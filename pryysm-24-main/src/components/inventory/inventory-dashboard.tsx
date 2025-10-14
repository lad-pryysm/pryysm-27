
"use client"

import React, { useMemo } from 'react'
import type { InventoryItem, StockStatus, InventoryCategory } from '@/hooks/use-workspace'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Box, Boxes, AlertTriangle, XCircle, Package, Cpu, Wrench, Shapes } from 'lucide-react'
import Image from 'next/image'

interface InventoryDashboardProps {
    items: InventoryItem[]
}

const CategoryIcons: Record<InventoryCategory, React.ElementType> = {
    "Packing Material": Package,
    "Electronics": Cpu,
    "Tools": Wrench,
    "Miscellaneous": Shapes
}

export function InventoryDashboard({ items }: InventoryDashboardProps) {
    const stats = useMemo(() => {
        const totalItems = items.length;
        const lowStock = items.filter(i => i.status === 'Low Stock' || i.status === 'Need Reorder').length;
        const outOfStock = items.filter(i => i.status === 'Out of Stock').length;
        const categories = new Set(items.map(i => i.category)).size;
        return { totalItems, lowStock, outOfStock, categories };
    }, [items]);

    const itemsNeedingAttention = useMemo(() => {
        return items.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock' || item.status === 'Need Reorder');
    }, [items]);

    const categoryCounts = useMemo(() => {
        return items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<InventoryCategory, number>);
    }, [items]);

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Box className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStock}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <XCircle className="h-5 w-5 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.outOfStock}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Boxes className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.categories}</div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Category Overview */}
            <div>
                <h3 className="text-xl font-semibold">Inventory Categories</h3>
                <p className="text-muted-foreground text-sm">Browse items by category</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    {Object.entries(categoryCounts).map(([category, count]) => {
                        const Icon = CategoryIcons[category as InventoryCategory] || Box;
                        return (
                            <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                    <div className="p-3 rounded-full bg-primary/10 mb-3">
                                        <Icon className="h-8 w-8 text-primary"/>
                                    </div>
                                    <h4 className="font-semibold">{category}</h4>
                                    <p className="text-muted-foreground text-sm">{count} items</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Items Needing Attention */}
            <div>
                <h3 className="text-xl font-semibold">Items Needing Attention</h3>
                <p className="text-muted-foreground text-sm">Low stock and out of stock items</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {itemsNeedingAttention.map(item => (
                        <Card key={item.id} className="relative">
                             <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg 
                                ${item.status === 'Low Stock' ? 'bg-yellow-400' : ''}
                                ${item.status === 'Out of Stock' ? 'bg-red-500' : ''}
                                ${item.status === 'Need Reorder' ? 'bg-pink-500' : ''}
                             `}></div>
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                     <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-muted flex-shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="object-cover rounded-md" data-ai-hint="product photo" />
                                        ) : (
                                            <Box className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{item.name}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center pt-0">
                                <div>
                                    <div className="text-sm text-muted-foreground">Quantity</div>
                                    <div className="text-lg font-bold">{item.quantity}</div>
                                </div>
                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                    ${item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${item.status === 'Out of Stock' ? 'bg-red-100 text-red-800' : ''}
                                    ${item.status === 'Need Reorder' ? 'bg-pink-100 text-pink-800' : ''}
                                `}>
                                    {item.status}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                    {itemsNeedingAttention.length === 0 && <p className="text-muted-foreground col-span-full">No items need attention right now.</p>}
                </div>
            </div>

        </div>
    )
}
