
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Spool, Resin, Powder, Printer, Job } from '@/hooks/use-workspace'
import { useToast } from '@/hooks/use-toast'
import { History, LogIn, LogOut, Check, FileText } from 'lucide-react'
import { useWorkspace } from '@/hooks/use-workspace'
import { cn } from '@/lib/utils'

type MaterialItem = (Spool | Resin | Powder) & { itemType: 'spool' | 'resin' | 'powder' };

interface RequiredJob {
    job: Job;
    printer: Printer;
    materials: {
        id: string;
        material: string;
        finish: string;
        color: string;
        isAssigned: boolean;
    }[];
}

export function MaterialLogClient() {
    const { 
        spools: allSpools, 
        resins: allResins, 
        powders: allPowders, 
        printers: allPrinters, 
        schedule,
        returnMaterialToStock,
        assignMaterialToPrinter,
    } = useWorkspace();
    const { toast } = useToast();
    
    const [returnAmount, setReturnAmount] = useState<{ [key: string]: number }>({});
    const [selectedJob, setSelectedJob] = useState<RequiredJob | null>(null);

    const requiredJobs = useMemo((): RequiredJob[] => {
        const jobsMap = new Map<string, RequiredJob>();

        schedule.forEach(s => {
            const printer = allPrinters.find(p => p.id === s.printerId);
            if (!printer) return;
            
            s.jobs.forEach(job => {
                // Only consider confirmed jobs that haven't started yet.
                if (job.isConfirmed && new Date(job.start) > new Date()) {
                    job.itemGroups.forEach(group => {
                        group.materials.forEach(material => {
                            const isAssigned = [...allSpools, ...allResins, ...allPowders].some(m => 
                                m.assignedToJobId === job.id &&
                                ((m as any).material || (m as any).type) === material.material &&
                                (m as any).color === material.color &&
                                ((m as any).finish || 'Standard') === (material.finish || 'Standard')
                            );

                            const jobKey = `${job.id}-${printer.id}`;
                            if (!jobsMap.has(jobKey)) {
                                jobsMap.set(jobKey, { job, printer, materials: [] });
                            }
                            const existingJob = jobsMap.get(jobKey)!;
                            
                            // Avoid adding duplicate material requirements for the same job
                            if (!existingJob.materials.some(m => m.id === material.id)) {
                                existingJob.materials.push({ ...material, isAssigned });
                            } else {
                                // Update assignment status if it exists
                                const matIndex = existingJob.materials.findIndex(m => m.id === material.id);
                                if (matIndex !== -1) {
                                    existingJob.materials[matIndex].isAssigned = isAssigned;
                                }
                            }
                        });
                    });
                }
            });
        });
        
        // Filter out jobs where all materials are already assigned
        return Array.from(jobsMap.values()).filter(j => j.materials.some(m => !m.isAssigned));

    }, [schedule, allPrinters, allSpools, allResins, allPowders]);
    
    const assignedMaterials = useMemo<MaterialItem[]>(() => {
        const assigned = [
            ...allSpools.filter(s => s.assignedToPrinterId).map(s => ({ ...s, itemType: 'spool' as const })),
            ...allResins.filter(r => r.assignedToPrinterId).map(r => ({ ...r, itemType: 'resin' as const })),
            ...allPowders.filter(p => p.assignedToPrinterId).map(p => ({ ...p, itemType: 'powder' as const })),
        ];

        return assigned;
    }, [allSpools, allResins, allPowders]);
    

    const handleAssign = (material: RequiredJob['materials'][0]) => {
        if (!selectedJob) {
            toast({ variant: 'destructive', title: "No Job Selected", description: "An error occurred. Please re-select the job." });
            return;
        }

        const { printer, job } = selectedJob;
        const tech = printer.technology;
        
        let stockList: (Spool | Resin | Powder)[];
        if (['FDM'].includes(tech)) stockList = allSpools;
        else if (['SLA', 'DLP'].includes(tech)) stockList = allResins;
        else stockList = allPowders;

        const itemToAssign = stockList.find(item =>
            !item.assignedToPrinterId &&
            ((item as any).material || (item as any).type) === material.material &&
            (item as any).color === material.color &&
            ((item as any).finish || 'Standard') === (material.finish || 'Standard')
        );

        if (!itemToAssign) {
            toast({ variant: 'destructive', title: "Out of Stock", description: `No available "${material.material} - ${material.color}" found in inventory.` });
            return;
        }

        const materialType = (itemToAssign as any).spoolId ? 'spool' : (itemToAssign as any).resinId ? 'resin' : 'powder';
        
        assignMaterialToPrinter(materialType as any, itemToAssign.id, printer.id, job.id);
        
        // Update the UI immediately
        setSelectedJob(prev => {
            if (!prev) return null;
            return {
                ...prev,
                materials: prev.materials.map(m => m.id === material.id ? { ...m, isAssigned: true } : m)
            };
        });
    };

    const handleReturn = (item: MaterialItem) => {
        const used = returnAmount[`${item.itemType}-${item.id}`] || 0;
        returnMaterialToStock(item.itemType, item.id, used);
        setReturnAmount(prev => {
            const newAmounts = {...prev};
            delete newAmounts[`${item.itemType}-${item.id}`];
            return newAmounts;
        });
    };

    const handleReturnAmountChange = (key: string, value: string) => {
        setReturnAmount(prev => ({...prev, [key]: Number(value)}));
    };
    
    const allJobs = useMemo(() => schedule.flatMap(s => s.jobs), [schedule]);

    const getAvailableStockCount = (material: RequiredJob['materials'][0], tech: string) => {
         let stockList: (Spool | Resin | Powder)[];
        if (['FDM'].includes(tech)) stockList = allSpools;
        else if (['SLA', 'DLP'].includes(tech)) stockList = allResins;
        else if (['SLS', 'MJF', 'EBM', 'DMLS'].includes(tech)) stockList = allPowders;
        else return 0;
        
        return stockList.filter(item =>
            !item.assignedToPrinterId &&
            item.status !== 'Empty' &&
            ((item as any).material || (item as any).type) === material.material &&
            (item as any).color === material.color &&
            ((item as any).finish || 'Standard') === (material.finish || 'Standard')
        ).length;
    }


    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <History className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Material Log</h1>
                        <p className="text-sm text-muted-foreground">Check materials in and out for specific printers.</p>
                    </div>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Required Assignments</CardTitle>
                    <CardDescription>
                        This list shows confirmed, upcoming jobs that need materials assigned. Select a job to prepare for assignment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg max-h-96 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Materials Needed</TableHead>
                                    <TableHead>For Printer</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requiredJobs.length > 0 ? requiredJobs.map((req) => {
                                     const isSelected = selectedJob?.job.id === req.job.id;
                                     return (
                                        <TableRow 
                                            key={`${req.job.id}-${req.printer.id}`}
                                            onClick={() => setSelectedJob(req)}
                                            className={cn("cursor-pointer", isSelected && "bg-muted")}
                                        >
                                            <TableCell className="font-medium">{req.job.name}</TableCell>
                                            <TableCell>{req.materials.length} type(s)</TableCell>
                                            <TableCell>{req.printer.name}</TableCell>
                                        </TableRow>
                                     )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">No pending material assignments required.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LogIn className="text-primary"/>Assign Material to Printer (Check-Out)</CardTitle>
                        <CardDescription>Select a job from the list above, then assign the required materials one by one.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/30 min-h-[160px] space-y-3">
                            {selectedJob ? (
                                <>
                                    <div className="flex items-center gap-3 pb-2 border-b">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div>
                                            <h4 className="font-semibold text-sm">Project: {selectedJob.job.name} ({selectedJob.job.projectCode})</h4>
                                            <p className="text-xs text-muted-foreground">For Printer: {selectedJob.printer.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <p className="text-xs font-medium text-muted-foreground">MATERIALS REQUIRED ({selectedJob.materials.length})</p>
                                        {selectedJob.materials.map(material => {
                                            const stockCount = getAvailableStockCount(material, selectedJob.printer.technology);
                                            return (
                                                <div key={material.id} className="flex justify-between items-center bg-background p-2 rounded-md shadow-sm">
                                                    <div>
                                                        <p className="font-medium flex items-center gap-2">
                                                            {material.material}, {material.finish || 'Standard'}
                                                            <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: material.color }}></span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Available Stock: <span className="font-bold">{stockCount}</span></p>
                                                    </div>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleAssign(material)} 
                                                        disabled={material.isAssigned || stockCount === 0}
                                                        variant={material.isAssigned ? "secondary" : "default"}
                                                    >
                                                        {material.isAssigned ? <Check className="mr-2 h-4 w-4"/> : null}
                                                        {material.isAssigned ? 'Assigned' : (stockCount > 0 ? 'Assign' : 'Out of Stock')}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>Select a job from the "Required Assignments" list.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LogOut className="text-destructive"/>Return Material to Stock (Check-In)</CardTitle>
                        <CardDescription>View materials currently in use and return them to inventory.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96 overflow-y-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead>Project Code</TableHead>
                                        <TableHead>On Printer</TableHead>
                                        <TableHead>Used (g/ml)</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedMaterials.length > 0 ? assignedMaterials.map(item => {
                                        const printer = allPrinters.find(p => p.id === item.assignedToPrinterId);
                                        const job = allJobs.find(j => j.id === item.assignedToJobId);
                                        const itemKey = `${item.itemType}-${item.id}`;
                                        return (
                                            <TableRow key={itemKey}>
                                                <TableCell>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: {(item as any).spoolId || (item as any).resinId || (item as any).powderId}</div>
                                                </TableCell>
                                                 <TableCell>
                                                    <div className="font-medium truncate" title={job?.name}>{job?.projectCode || 'N/A'}</div>
                                                </TableCell>
                                                <TableCell>{printer?.name}</TableCell>
                                                <TableCell>
                                                    <Input 
                                                        type="number"
                                                        className="h-8 w-24"
                                                        placeholder="0"
                                                        value={returnAmount[itemKey] || ''}
                                                        onChange={(e) => handleReturnAmountChange(itemKey, e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="outline" onClick={() => handleReturn(item)}>Return</Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">No materials are currently assigned.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

    