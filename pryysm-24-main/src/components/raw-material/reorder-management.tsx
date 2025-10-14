
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from "@/components/ui/checkbox"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Droplet, Sparkles, Layers3 } from 'lucide-react'
import type { Spool, Resin, Powder, MaterialStatus } from '@/hooks/use-workspace'


const statusBadgeColors: Record<MaterialStatus, string> = {
    "New": "bg-sky-100 text-sky-800",
    "Active": "bg-green-100 text-green-800",
    "Low": "bg-yellow-100 text-yellow-800",
    "Critical": "bg-red-100 text-red-800",
    "Empty": "bg-gray-100 text-gray-800",
    "Need Reorder": "bg-pink-100 text-pink-800",
};

interface ReorderSpoolGroup { key: string; name: string; brand: string; material: string; color: string; finish: string; lowStockCount: number; reorderQty: number; status: MaterialStatus; imageUrl?: string; }
interface ReorderResinGroup { key: string; name: string; brand: string; type: string; color: string; lowStockCount: number; reorderQty: number; status: MaterialStatus; imageUrl?: string; }
interface ReorderPowderGroup { key: string; name: string; brand: string; material: string; color: string; lowStockCount: number; reorderQty: number; status: MaterialStatus; imageUrl?: string; }


interface ReorderManagementProps {
    allSpools: Spool[];
    allResins: Resin[];
    allPowders: Powder[];
}

export function ReorderManagement({ allSpools, allResins, allPowders }: ReorderManagementProps) {
    const { toast } = useToast();
    const statusOrder: Record<MaterialStatus, number> = { 'Critical': 0, 'Low': 1, 'Need Reorder': 2, 'Active': 3, 'New': 4, 'Empty': 5 };

    const spoolsToReorder = useMemo(() => {
        const groups: { [key: string]: ReorderSpoolGroup } = {};
        allSpools.forEach(spool => {
            if (spool.status === 'Low' || spool.status === 'Critical' || spool.status === 'Need Reorder') {
                const key = `${spool.name}-${spool.brand}-${spool.material}-${spool.color}-${spool.finish}`;
                if (!groups[key]) {
                    groups[key] = { key, name: spool.name, brand: spool.brand, material: spool.material, color: spool.color, finish: spool.finish, lowStockCount: 0, reorderQty: spool.minOrder, status: 'Low', imageUrl: spool.imageUrl };
                }
                groups[key].lowStockCount++;
                if (spool.status === 'Critical') {
                    groups[key].status = 'Critical';
                } else if (spool.status === 'Need Reorder') {
                    groups[key].status = 'Need Reorder';
                }
            }
        });
        return Object.values(groups).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }, [allSpools]);
    
    const resinsToReorder = useMemo(() => {
        const groups: { [key: string]: ReorderResinGroup } = {};
        allResins.forEach(resin => {
            if (resin.status === 'Low' || resin.status === 'Critical' || resin.status === 'Need Reorder') {
                const key = `${resin.name}-${resin.brand}-${resin.type}-${resin.color}`;
                if (!groups[key]) {
                    groups[key] = { key, name: resin.name, brand: resin.brand, type: resin.type, color: resin.color, lowStockCount: 0, reorderQty: resin.minOrder, status: 'Low', imageUrl: undefined };
                }
                groups[key].lowStockCount++;
                if (resin.status === 'Critical') {
                    groups[key].status = 'Critical';
                } else if (resin.status === 'Need Reorder') {
                    groups[key].status = 'Need Reorder';
                }
            }
        });
        return Object.values(groups).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }, [allResins]);

    const powdersToReorder = useMemo(() => {
        const groups: { [key: string]: ReorderPowderGroup } = {};
        allPowders.forEach(powder => {
            if (powder.status === 'Low' || powder.status === 'Critical' || powder.status === 'Need Reorder') {
                const key = `${powder.name}-${powder.brand}-${powder.material}-${powder.color}`;
                if (!groups[key]) {
                    groups[key] = { key, name: powder.name, brand: powder.brand, material: powder.material, color: powder.color || '#FFFFFF', lowStockCount: 0, reorderQty: powder.minOrder, status: 'Low', imageUrl: undefined };
                }
                groups[key].lowStockCount++;
                 if (powder.status === 'Critical') {
                    groups[key].status = 'Critical';
                } else if (powder.status === 'Need Reorder') {
                    groups[key].status = 'Need Reorder';
                }
            }
        });
        return Object.values(groups).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }, [allPowders]);

    const [reorderList, setReorderList] = useState({ 
        spools: spoolsToReorder,
        resins: resinsToReorder, 
        powders: powdersToReorder,
    });
    const [selectedItems, setSelectedItems] = useState({ spools: [] as string[], resins: [] as string[], powders: [] as string[] });
    
    useEffect(() => {
        setReorderList(prev => ({ 
            spools: spoolsToReorder.map(i => ({...i, reorderQty: prev.spools.find(s => s.key === i.key)?.reorderQty ?? i.reorderQty})), 
            resins: resinsToReorder.map(i => ({...i, reorderQty: prev.resins.find(r => r.key === i.key)?.reorderQty ?? i.reorderQty})), 
            powders: powdersToReorder.map(i => ({...i, reorderQty: prev.powders.find(p => p.key === i.key)?.reorderQty ?? i.reorderQty})), 
        }));
    }, [spoolsToReorder, resinsToReorder, powdersToReorder]);


    const handleQuantityChange = (type: 'spools' | 'resins' | 'powders', itemKey: string, newQty: number) => {
        setReorderList(currentList => ({
            ...currentList,
            [type]: currentList[type].map((item: any) => 
                item.key === itemKey ? { ...item, reorderQty: newQty < 0 ? 0 : newQty } : item
            )
        }));
    };
    
    const handleCreatePO = () => {
        const selectedSpools = reorderList.spools.filter((item: any) => selectedItems.spools.includes(item.key));
        const selectedResins = reorderList.resins.filter((item: any) => selectedItems.resins.includes(item.key));
        const selectedPowders = reorderList.powders.filter((item: any) => selectedItems.powders.includes(item.key));

        const totalSelected = selectedSpools.length + selectedResins.length + selectedPowders.length;

        if (totalSelected === 0) {
            toast({ title: "No Items Selected", description: "Please select items to include in the purchase order.", variant: "destructive" });
            return;
        }

        const doc = new jsPDF();
        let finalY = 20;

        doc.setFontSize(20);
        doc.text('Unified Purchase Order', 14, finalY);
        finalY += 10;

        if (selectedSpools.length > 0) {
             autoTable(doc, { startY: finalY, head: [['Filament Spools', 'Brand', 'Material', 'Color', 'Finish', 'Reorder Quantity']], body: (selectedSpools as ReorderSpoolGroup[]).map(item => [item.name, item.brand, item.material, item.color, item.finish, item.reorderQty]), didDrawPage: (data) => { if (data.pageNumber > 1) finalY = 20 } });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        }
        
        if (selectedResins.length > 0) {
             autoTable(doc, { startY: finalY, head: [['Resins', 'Brand', 'Type', 'Color', 'Reorder Quantity']], body: (selectedResins as ReorderResinGroup[]).map(item => [item.name, item.brand, item.type, item.color, item.reorderQty]), didDrawPage: (data) => { if (data.pageNumber > 1) finalY = 20 } });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        }

        if (selectedPowders.length > 0) {
            autoTable(doc, { startY: finalY, head: [['Powders', 'Brand', 'Material', 'Color', 'Reorder Quantity (kg)']], body: (selectedPowders as ReorderPowderGroup[]).map(item => [item.name, item.brand, item.material, item.color, item.reorderQty]), didDrawPage: (data) => { if (data.pageNumber > 1) finalY = 20 } });
             finalY = (doc as any).lastAutoTable.finalY + 10;
        }
        
        doc.save(`unified-purchase-order.pdf`);
        toast({ title: "Purchase Order PDF Created", description: `PO for ${totalSelected} item type(s) has been downloaded.` });
        setSelectedItems({ spools: [], resins: [], powders: [] });
    }
    
    const handleSelect = (type: 'spools' | 'resins' | 'powders', itemKey: string) => {
        setSelectedItems(prev => ({ ...prev, [type]: prev[type].includes(itemKey) ? prev[type].filter(id => id !== itemKey) : [...prev[type], itemKey] }));
    }
    
    const handleSelectAll = (type: 'spools' | 'resins' | 'powders', checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => ({ ...prev, [type]: reorderList[type].map((item: any) => item.key) }));
        } else {
            setSelectedItems(prev => ({ ...prev, [type]: [] }));
        }
    }

    const totalSelectedCount = selectedItems.spools.length + selectedItems.resins.length + selectedItems.powders.length;

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                    <CardTitle>Reorder Management</CardTitle>
                    <CardDescription className="mt-1">Manage and create purchase orders for all materials that need restocking.</CardDescription>
                </div>
                <Button onClick={handleCreatePO} disabled={totalSelectedCount === 0}>
                    Create & Download PO for Selected ({totalSelectedCount})
                </Button>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={['spools']} className="w-full">
                    <AccordionItem value="spools">
                        <AccordionTrigger>Filament Spools ({reorderList.spools.length} items need reorder)</AccordionTrigger>
                        <AccordionContent> <ReorderTable items={reorderList.spools} selectedItems={selectedItems.spools} onSelectAll={(checked: boolean) => handleSelectAll('spools', checked)} onSelect={(key: string) => handleSelect('spools', key)} onQuantityChange={(key: string, qty: number) => handleQuantityChange('spools', key, qty)} type="spools" /> </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="resins">
                        <AccordionTrigger>Resins ({reorderList.resins.length} items need reorder)</AccordionTrigger>
                        <AccordionContent> <ReorderTable items={reorderList.resins} selectedItems={selectedItems.resins} onSelectAll={(checked: boolean) => handleSelectAll('resins', checked)} onSelect={(key: string) => handleSelect('resins', key)} onQuantityChange={(key: string, qty: number) => handleQuantityChange('resins', key, qty)} type="resins" /> </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="powders">
                        <AccordionTrigger>Powders ({reorderList.powders.length} items need reorder)</AccordionTrigger>
                        <AccordionContent> <ReorderTable items={reorderList.powders} selectedItems={selectedItems.powders} onSelectAll={(checked: boolean) => handleSelectAll('powders', checked)} onSelect={(key: string) => handleSelect('powders', key)} onQuantityChange={(key: string, qty: number) => handleQuantityChange('powders', key, qty)} type="powders" /> </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}

type ItemType = ReorderSpoolGroup | ReorderResinGroup | ReorderPowderGroup;

interface ReorderTableProps {
    items: ItemType[];
    selectedItems: string[];
    onSelectAll: (checked: boolean) => void;
    onSelect: (key: string) => void;
    onQuantityChange: (key: string, qty: number) => void;
    type: 'spools' | 'resins' | 'powders';
}


const ReorderTable = ({ items, selectedItems, onSelectAll, onSelect, onQuantityChange, type }: ReorderTableProps) => {
    const isAllSelected = items.length > 0 && selectedItems.length === items.length;

    const headers = {
        spools: ['Name', 'Brand', 'Material', 'Color', 'Finish', 'Remaining', 'Reorder Qty', 'Status'],
        resins: ['Name', 'Brand', 'Type', 'Color', 'Remaining', 'Reorder Qty', 'Status'],
        powders: ['Name', 'Brand', 'Material', 'Color', 'Remaining', 'Reorder Qty (kg)', 'Status'],
    };

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]"> <Checkbox checked={isAllSelected} onCheckedChange={(checked) => onSelectAll(Boolean(checked))} aria-label="Select all" /> </TableHead>
                        {headers[type].map((h, i) => <TableHead key={i} className={['Remaining', 'Reorder Qty', 'Status', 'Current Qty', 'Reorder Qty (kg)'].includes(h) ? 'text-center' : ''}>{h}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length > 0 ? items.map((item) => (
                        <TableRow key={item.key} data-state={selectedItems.includes(item.key) && "selected"}>
                            <TableCell> <Checkbox checked={selectedItems.includes(item.key)} onCheckedChange={() => onSelect(item.key)} aria-label={`Select ${item.name}`} /> </TableCell>
                            
                            {type === 'spools' && <SpoolRow item={item as ReorderSpoolGroup} />}
                            {type === 'resins' && <ResinRow item={item as ReorderResinGroup} />}
                            {type === 'powders' && <PowderRow item={item as ReorderPowderGroup} />}

                            <TableCell className="text-center"><Input type="number" className="w-24 mx-auto h-8" value={item.reorderQty} min="1" onChange={(e) => onQuantityChange(item.key, Number(e.target.value))}/></TableCell>
                            <TableCell className="text-center"><Badge className={`${statusBadgeColors[item.status]} whitespace-nowrap`}>{item.status}</Badge></TableCell>
                        </TableRow>
                    )) : ( <TableRow><TableCell colSpan={headers[type].length + 1} className="text-center h-24">All items in this category are sufficiently stocked.</TableCell></TableRow> )}
                </TableBody>
            </Table>
        </div>
    );
};

const SpoolRow = ({ item }: { item: ReorderSpoolGroup }) => (
    <>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>{item.brand}</TableCell>
        <TableCell>{item.material}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                 <div className="relative h-6 w-6">
                    <div className="absolute inset-0 rounded-full border border-black" style={{backgroundColor: item.color, opacity: 0.3}}></div>
                    <div className="absolute inset-0.5 rounded-full bg-background border border-black/10"></div>
                    <div className="absolute inset-1 rounded-full border border-black" style={{backgroundColor: item.color}}></div>
                </div>
                <span>{item.color}</span>
            </div>
        </TableCell>
        <TableCell>{item.finish}</TableCell>
        <TableCell className="text-center">{item.lowStockCount}</TableCell>
    </>
);

const ResinRow = ({ item }: { item: ReorderResinGroup }) => (
    <>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>{item.brand}</TableCell>
        <TableCell>{item.type}</TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
                <Droplet className="h-6 w-6 stroke-black stroke-1" style={{ fill: item.color, opacity: 0.7 }}/>
                <span>{item.color}</span>
            </div>
        </TableCell>
        <TableCell className="text-center">{item.lowStockCount}</TableCell>
    </>
);

const PowderRow = ({ item }: { item: ReorderPowderGroup }) => (
    <>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>{item.brand}</TableCell>
        <TableCell>{item.material}</TableCell>
        <TableCell>
             <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full border border-black" style={{ backgroundColor: item.color }}></div>
                <span>{item.color}</span>
            </div>
        </TableCell>
        <TableCell className="text-center">{item.lowStockCount}</TableCell>
    </>
);

    
