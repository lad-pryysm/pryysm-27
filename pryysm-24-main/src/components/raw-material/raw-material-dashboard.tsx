
"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Spool, Resin, Powder, MaterialStatus, Currency } from '@/hooks/use-workspace';
import { Box, Droplet, Sparkles, DollarSign, AlertTriangle, Repeat, Layers3 } from 'lucide-react';
import Image from 'next/image';

const currencySymbols: Record<Currency, string> = { 'USD': '$', 'EUR': '€', 'AED': 'AED', 'INR': '₹' };

interface RawMaterialDashboardProps {
    spools: Spool[];
    resins: Resin[];
    powders: Powder[];
    displayCurrency: Currency;
    formatCurrency: (amount: number, fromCurrency: Spool['currency']) => string;
    onReorderRequest: (type: 'spool' | 'resin' | 'powder', id: number) => void;
}

const statusBadgeColors: Record<MaterialStatus, string> = {
    "New": "bg-sky-100 text-sky-800",
    "Active": "bg-green-100 text-green-800",
    "Low": "bg-yellow-100 text-yellow-800",
    "Critical": "bg-red-100 text-red-800",
    "Empty": "bg-gray-100 text-gray-800",
    "Need Reorder": "bg-pink-100 text-pink-800"
};

export function RawMaterialDashboard({ 
    spools, 
    resins, 
    powders, 
    displayCurrency, 
    formatCurrency,
    onReorderRequest
}: RawMaterialDashboardProps) {

    const stats = useMemo(() => {
        const allItems = [...spools, ...resins, ...powders];
        const exchangeRates: Record<Currency, number> = { 'USD': 1, 'EUR': 0.93, 'AED': 3.67, 'INR': 83.33 };

        const totalValue = allItems.reduce((acc, s) => acc + (s.price / exchangeRates[s.currency]), 0) * exchangeRates[displayCurrency];
        const lowStockCount = allItems.filter(s => s.status === 'Low').length;
        const criticalCount = allItems.filter(s => s.status === 'Critical').length;
        
        return { 
            totalValue, 
            lowStockCount, 
            criticalCount, 
            totalItems: allItems.length,
            spoolCount: spools.length,
            resinCount: resins.length,
            powderCount: powders.length,
        };
    }, [spools, resins, powders, displayCurrency]);
    
    const itemsNeedingAttention = useMemo(() => {
        const allItems = [
            ...spools.map(s => ({ ...s, itemType: 'spool' as const, imageUrl: s.imageUrl })),
            ...resins.map(r => ({ ...r, itemType: 'resin' as const, imageUrl: undefined })),
            ...powders.map(p => ({ ...p, itemType: 'powder' as const, imageUrl: undefined }))
        ];

        return allItems.filter(item => 
            item.status === 'Low' || 
            item.status === 'Critical' || 
            item.status === 'Need Reorder'
        ).sort((a,b) => {
            const statusOrder: Record<MaterialStatus, number> = { 'Critical': 0, 'Low': 1, 'Need Reorder': 2, 'Active': 3, 'New': 4, 'Empty': 5 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
    }, [spools, resins, powders]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <p className="text-xs text-muted-foreground">Across all material types</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currencySymbols[displayCurrency]}{stats.totalValue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Estimated inventory value</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">Items below 30% stock</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Critical Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.criticalCount}</div>
                        <p className="text-xs text-muted-foreground">Items below 10% stock</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Layers3 className="h-8 w-8 text-primary"/>
                        <div>
                            <CardTitle>Filaments</CardTitle>
                            <CardDescription>{stats.spoolCount} Spools</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Droplet className="h-8 w-8 text-primary"/>
                        <div>
                            <CardTitle>Resins</CardTitle>
                            <CardDescription>{stats.resinCount} Bottles</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Sparkles className="h-8 w-8 text-primary"/>
                        <div>
                            <CardTitle>Powders</CardTitle>
                            <CardDescription>{stats.powderCount} Batches</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Items Needing Attention</CardTitle>
                    <CardDescription>All items that are low, critical, or marked for reorder.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sr.No</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsNeedingAttention.length > 0 ? itemsNeedingAttention.map((item, index) => {
                                    const Icon = item.itemType === 'spool' ? Layers3 : item.itemType === 'resin' ? Droplet : Sparkles;
                                    return (
                                        <TableRow key={`${item.itemType}-${item.id}`}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-cover rounded-md" data-ai-hint="product photo" />
                                                    ) : (
                                                        <Icon className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.brand}</TableCell>
                                            <TableCell className="capitalize">{item.itemType}</TableCell>
                                            <TableCell>
                                                <Badge className={statusBadgeColors[item.status]}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => onReorderRequest(item.itemType, item.id)}
                                                    disabled={item.status === 'Need Reorder'}
                                                >
                                                    <Repeat className="mr-2 h-3 w-3" /> 
                                                    {item.status === 'Need Reorder' ? 'Marked' : 'Mark for Reorder'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            All materials are well-stocked. Great job!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
