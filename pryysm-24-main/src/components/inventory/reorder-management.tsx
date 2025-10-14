
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import Image from 'next/image'
import { Box, Package, Cpu, Wrench, Shapes } from 'lucide-react'
import type { InventoryItem, StockStatus } from '@/hooks/use-workspace'

const statusBadgeColors: Record<StockStatus, string> = {
    "In Stock": "bg-green-100 text-green-800",
    "Low Stock": "bg-yellow-100 text-yellow-800",
    "Out of Stock": "bg-red-100 text-red-800",
    "Need Reorder": "bg-pink-100 text-pink-800",
};

interface ReorderableInventoryItem extends InventoryItem {
    reorderQty: number;
}

interface ReorderManagementProps {
    allInventory: InventoryItem[];
}

export function ReorderManagement({ allInventory }: ReorderManagementProps) {
    const { toast } = useToast();
    const statusOrder: Record<StockStatus, number> = { 'Out of Stock': 0, 'Low Stock': 1, 'Need Reorder': 2, 'In Stock': 3 };

    const itemsToReorder = useMemo((): ReorderableInventoryItem[] => {
        return allInventory
            .filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock' || item.status === 'Need Reorder')
            .map(item => ({ ...item, reorderQty: item.minOrder }))
            .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }, [allInventory]);

    const [reorderList, setReorderList] = useState<ReorderableInventoryItem[]>(itemsToReorder);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        setReorderList(prevList => {
            const newList = itemsToReorder.map(item => {
                const existing = prevList.find(p => p.id === item.id);
                return { ...item, reorderQty: existing?.reorderQty ?? item.reorderQty };
            });
            return newList;
        });
    }, [itemsToReorder]);

    const handleQuantityChange = (itemId: string, newQty: number) => {
        setReorderList(currentList => currentList.map(item =>
            item.id === itemId ? { ...item, reorderQty: newQty < 0 ? 0 : newQty } : item
        ));
    };

    const handleCreatePO = () => {
        const selected = reorderList.filter(item => selectedItems.includes(item.id));

        if (selected.length === 0) {
            toast({ title: "No Items Selected", description: "Please select items to include in the purchase order.", variant: "destructive" });
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Inventory Purchase Order', 14, 20);

        autoTable(doc, {
            startY: 30,
            head: [['Item Name', 'Category', 'Current Qty', 'Reorder Quantity']],
            body: selected.map(item => [item.name, item.category, item.quantity, item.reorderQty]),
        });

        doc.save(`inventory-purchase-order.pdf`);
        toast({ title: "Purchase Order PDF Created", description: `PO for ${selected.length} item(s) has been downloaded.` });
        setSelectedItems([]);
    };
    
    const handleSelect = (itemId: string) => {
        setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedItems(checked ? reorderList.map(item => item.id) : []);
    };

    const totalSelectedCount = selectedItems.length;
    const isAllSelected = reorderList.length > 0 && totalSelectedCount === reorderList.length;

    const CategoryIcons: Record<string, React.ElementType> = { "Packing Material": Package, "Electronics": Cpu, "Tools": Wrench, "Miscellaneous": Shapes };

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                    <CardTitle>Reorder Management for Spares & Stores</CardTitle>
                    <CardDescription className="mt-1">Manage and create purchase orders for items that need restocking.</CardDescription>
                </div>
                <Button onClick={handleCreatePO} disabled={totalSelectedCount === 0}>
                    Create & Download PO for Selected ({totalSelectedCount})
                </Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(Boolean(checked))} aria-label="Select all" />
                                </TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">Current Qty</TableHead>
                                <TableHead className="text-center">Reorder Qty</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reorderList.length > 0 ? reorderList.map(item => (
                                <TableRow key={item.id} data-state={selectedItems.includes(item.id) && "selected"}>
                                    <TableCell>
                                        <Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => handleSelect(item.id)} aria-label={`Select ${item.name}`} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                            {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-cover rounded-md" data-ai-hint="product photo" /> : <Box className="h-6 w-6 text-muted-foreground" />}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.barcode}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {React.createElement(CategoryIcons[item.category] || Box, { className: "h-4 w-4 text-muted-foreground" })}
                                            <span>{item.category}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-center">
                                        <Input type="number" className="w-24 mx-auto h-8" value={item.reorderQty} min="1" onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={`${statusBadgeColors[item.status]} whitespace-nowrap`}>{item.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">All items are sufficiently stocked.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
