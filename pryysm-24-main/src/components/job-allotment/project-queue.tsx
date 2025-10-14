
"use client"

import React, { useState, Fragment, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Check, Info, Zap, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import type { Job, Printer, PrinterStatus, ScheduledJob } from '@/hooks/use-workspace'
import Image from 'next/image'
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectQueueProps {
  jobs: Job[];
  machines: Printer[];
  schedule: ScheduledJob[];
  onAssign: (jobId: number | string, machineId: string, parentJobId?: string | number) => void;
  onAutoAssign: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: number | string) => void;
  techFilter: string;
  onTechFilterChange: (value: string) => void;
  statusFilter: 'all' | PrinterStatus;
  onStatusFilterChange: (value: 'all' | PrinterStatus) => void;
  availableTechnologies: string[];
  technologyDisplayNames: { [key: string]: string };
}

const priorityBadgeVariants: { [key: string]: string } = {
    high: "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30",
    low: "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30"
};

export function ProjectQueue({ 
    jobs, 
    machines, 
    schedule,
    onAssign, 
    onAutoAssign, 
    onEdit, 
    onDelete, 
    techFilter, 
    onTechFilterChange,
    statusFilter,
    onStatusFilterChange,
    availableTechnologies, 
    technologyDisplayNames 
}: ProjectQueueProps) {
    const [jobToAssign, setJobToAssign] = useState<{job: Job, subItemIndex?: number} | null>(null);
    const [isManualAssignOpen, setManualAssignOpen] = useState(false);
    const [expandedJobs, setExpandedJobs] = useState<Set<number|string>>(new Set());

    const toggleJobExpansion = (jobId: number | string) => {
        setExpandedJobs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jobId)) {
                newSet.delete(jobId);
            } else {
                newSet.add(jobId);
            }
            return newSet;
        });
    };

    const handleManualAssign = (job: Job, subItemIndex?: number) => {
        setJobToAssign({job, subItemIndex});
        setManualAssignOpen(true);
    };

    const handleAutoAssign = (job: Job, subItemIndex?: number) => {
        if (subItemIndex !== undefined) {
             const subItemJob = {
                ...job,
                id: `${job.id}-item-${subItemIndex}`,
                items: 1,
                name: `${job.name} (Item ${subItemIndex + 1})`,
                estimatedTime: (job.estimatedTime || 0) / job.items,
            };
            onAutoAssign(subItemJob);
        } else {
            onAutoAssign(job);
        }
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Unassigned Projects Queue</CardTitle>
                            <CardDescription>Projects waiting for assignment. Use the actions to assign them to a printer.</CardDescription>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <Select value={techFilter} onValueChange={onTechFilterChange}>
                                <SelectTrigger className="w-full md:w-[220px]">
                                    <SelectValue placeholder="Filter by Technology"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Technologies</SelectItem>
                                    {availableTechnologies.map(tech => (
                                        <SelectItem key={tech} value={tech}>
                                            {technologyDisplayNames[tech] || tech}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                                <SelectTrigger className="w-full md:w-[220px]">
                                    <SelectValue placeholder="Filter by Status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="printing">Printing</SelectItem>
                                    <SelectItem value="idle">Idle</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Est. Time</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Technology</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {jobs.length > 0 ? jobs.map((job) => {
                            const isExpanded = expandedJobs.has(job.id);
                            return (
                                <Fragment key={job.id}>
                                    <TableRow>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {job.items > 1 && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleJobExpansion(job.id)}>
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            {job.imageUrl && (
                                                <Image src={job.imageUrl} alt={job.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint="product photo" />
                                            )}
                                            <div>
                                                <p className="font-medium">{job.name}</p>
                                                <p className="text-xs text-muted-foreground">{job.projectCode}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{Math.floor((job.estimatedTime || 0) / 60)}h {(job.estimatedTime || 0) % 60}m</TableCell>
                                    <TableCell>{job.items}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("capitalize", priorityBadgeVariants[job.priority?.toLowerCase() || 'medium'])}>
                                        {job.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{job.requiredTechnology}</TableCell>
                                    <TableCell>{format(new Date(job.deadline), 'dd-MM-yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => handleAutoAssign(job)}><Zap className="mr-2 h-4 w-4"/>Auto</Button>
                                        <Button size="sm" onClick={() => handleManualAssign(job)}>Manual</Button>
                                        <Button size="icon" variant="ghost" onClick={() => onEdit(job)}><Edit className="h-4 w-4"/></Button>
                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => onDelete(job.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                    </TableCell>
                                    </TableRow>
                                    {isExpanded && job.items > 1 && Array.from({ length: job.items }).map((_, index) => (
                                        <TableRow key={`${job.id}-item-${index}`} className="bg-muted/50 hover:bg-muted">
                                            <TableCell className="pl-16">
                                                Sub-Item {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                {Math.floor(((job.estimatedTime || 0) / job.items) / 60)}h {Math.round(((job.estimatedTime || 0) / job.items) % 60)}m
                                            </TableCell>
                                            <TableCell>1</TableCell>
                                            <TableCell colSpan={3}></TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" onClick={() => handleAutoAssign(job, index)}><Zap className="mr-2 h-4 w-4"/>Auto</Button>
                                                    <Button size="sm" onClick={() => handleManualAssign(job, index)}>Manual</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </Fragment>
                            )
                        }) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No projects in the queue. Add one to get started!
                            </TableCell>
                        </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>

            {jobToAssign && (
                <ManualAssignDialog
                    isOpen={isManualAssignOpen}
                    onClose={() => setManualAssignOpen(false)}
                    job={jobToAssign.job}
                    subItemIndex={jobToAssign.subItemIndex}
                    machines={machines}
                    schedule={schedule}
                    onAssign={(machineId) => {
                        const { job, subItemIndex } = jobToAssign;
                        const subItemId = subItemIndex !== undefined ? `${job.id}-item-${subItemIndex}` : job.id;
                        onAssign(subItemId, machineId, job.id);
                        setManualAssignOpen(false);
                        setJobToAssign(null);
                    }}
                />
            )}
        </>
    );
}

const statusBadgeVariants: { [key: string]: string } = {
    printing: "bg-green-100 text-green-800",
    running: "bg-green-100 text-green-800",
    idle: "bg-blue-100 text-blue-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    offline: 'bg-red-100 text-red-800',
};


const ManualAssignDialog = ({ isOpen, onClose, job, subItemIndex, machines, schedule, onAssign }: { isOpen: boolean; onClose: () => void; job: Job; subItemIndex?: number; machines: Printer[], schedule: ScheduledJob[], onAssign: (machineId: string) => void; }) => {
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

    const getNextAvailableSlot = (machine: Printer, jobDurationMinutes: number): Date => {
        const printerSchedule = schedule.find(s => s.printerId === machine.id)?.jobs || [];
        const sortedJobs = [...printerSchedule].sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        
        let availableTime = new Date();
        
        for (const scheduledJob of sortedJobs) {
            const jobStart = new Date(scheduledJob.start);
            const jobEnd = new Date(scheduledJob.end);
            
            if (availableTime < jobStart) {
                const gapDuration = jobStart.getTime() - availableTime.getTime();
                if (gapDuration >= jobDurationMinutes * 60 * 1000) {
                    return availableTime;
                }
            }
            availableTime = new Date(Math.max(availableTime.getTime(), jobEnd.getTime()));
        }
        
        return availableTime;
    };
    
    const jobToConsider = useMemo(() => {
        if (subItemIndex !== undefined) {
             return {
                ...job,
                items: 1,
                estimatedTime: (job.estimatedTime || 0) / job.items,
            };
        }
        return job;
    }, [job, subItemIndex]);


    const compatibleMachines = machines.filter(m => {
        if (jobToConsider.requiredTechnology && m.technology !== jobToConsider.requiredTechnology) return false;
        return m.status === 'idle' || m.status === 'printing' || m.status === 'maintenance'; 
    });

    const handleAssign = () => {
        if (selectedMachine) {
            onAssign(selectedMachine);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manual Project Assignment</DialogTitle>
                    <DialogDescription>
                        Select a printer for <span className="font-semibold text-primary">{job.name}{subItemIndex !== undefined ? ` (Item ${subItemIndex + 1})` : ''}</span>. The system will find the earliest available slot.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {compatibleMachines.length > 0 ? compatibleMachines.map(machine => {
                        const isSelected = selectedMachine === machine.id;
                        const nextSlot = getNextAvailableSlot(machine, jobToConsider.estimatedTime || 0);
                        const statusClass = statusBadgeVariants[machine.status];
                        return (
                            <button
                                key={machine.id}
                                onClick={() => setSelectedMachine(machine.id)}
                                className={cn(
                                    'w-full text-left p-4 border rounded-lg flex items-center justify-between transition-all',
                                    isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'hover:bg-muted/50'
                                )}
                            >
                                <div>
                                    <p className="font-semibold">{machine.name}</p>
                                    <p className="text-sm text-muted-foreground">{machine.technology}</p>
                                     <p className="text-xs flex items-center gap-1 mt-2">
                                        <Clock className="h-3 w-3" />
                                        Next Slot: {format(nextSlot, 'dd MMM, h:mm a')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <Badge className={cn("capitalize", statusClass)}>{machine.status}</Badge>
                                </div>
                            </button>
                        )
                    }) : (
                        <p className="text-center text-muted-foreground py-8">No compatible printers available for this job.</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={!selectedMachine}>
                        <Check className="mr-2 h-4 w-4" />
                        Assign to Selected Printer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    