
"use client"

import React, { useState, useMemo } from 'react'
import type { InventoryItem, StockStatus, InventoryCategory } from '@/hooks/use-workspace'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Edit, Trash, Package, Cpu, Wrench, Shapes, Box, Repeat } from 'lucide-react'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InventoryListProps {
    items: InventoryItem[];
    onDelete: (id: string) => void;
    onEdit: (item: InventoryItem) => void;
    onReorder: () => void;
}

const statusColors: Record<StockStatus, string> = {
    "In Stock": "border-green-500",
    "Low Stock": "border-yellow-400",
    "Out of Stock": "border-red-500",
    "Need Reorder": "border-pink-500"
};

const statusBadgeColors: Record<StockStatus, string> = {
    "In Stock": "bg-green-100 text-green-800",
    "Low Stock": "bg-yellow-100 text-yellow-800",
    "Out of Stock": "bg-red-100 text-red-800",
    "Need Reorder": "bg-pink-100 text-pink-800"
};

const CategoryIcons: Record<string, React.ElementType> = {
    "Packing Material": Package,
    "Electronics": Cpu,
    "Tools": Wrench,
    "Miscellaneous": Shapes
}

export function InventoryList({ items, onDelete, onEdit, onReorder }: InventoryListProps) {
    const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesStatus && matchesCategory && matchesSearch;
        })
    }, [items, statusFilter, categoryFilter, searchTerm]);

    const filterBadges: (StockStatus | 'all')[] = ['all', 'In Stock', 'Low Stock', 'Out of Stock', 'Need Reorder'];
    const categoryOptions: (InventoryCategory | 'all')[] = ['all', "Packing Material", "Electronics", "Tools", "Miscellaneous"];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold">All Inventory Items</h3>
                <p className="text-muted-foreground text-sm">Manage all your 3D printing materials and components</p>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Search by name or description..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                             <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 items-center">
                                {filterBadges.map(f => {
                                    const displayName = f === 'all' ? 'All Statuses' : f;
                                    return (
                                        <Badge
                                            key={f}
                                            variant={statusFilter === f ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => setStatusFilter(f)}
                                        >
                                            {displayName}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                    const Icon = CategoryIcons[item.category] || Box;
                    return (
                        <Card key={item.id} className={`flex flex-col border-l-4 ${statusColors[item.status]}`}>
                            <CardHeader className="flex-shrink-0">
                                <div className="flex justify-between items-start">
                                    <div className="w-10/12">
                                        <CardTitle className="text-base">{item.name}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </div>
                                    <Badge className={`${statusBadgeColors[item.status]} whitespace-nowrap`}>{item.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-between">
                                <div className="flex items-center justify-center h-24 bg-muted/50 rounded-lg mb-4">
                                     {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} width={96} height={96} className="object-contain" data-ai-hint="product photo" />
                                     ) : (
                                        <Icon className="h-12 w-12 text-muted-foreground" />
                                     )}
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                    <div>
                                        <div className="font-semibold text-muted-foreground">Quantity</div>
                                        <div className="text-lg font-bold">{item.quantity}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-muted-foreground">Min Stock</div>
                                        <div className="text-lg font-bold">{item.minStock}</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-muted-foreground">Location</div>
                                        <div className="text-sm font-medium">{item.location}</div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="flex justify-end gap-2 p-4 pt-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}><Edit className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(item.id)}><Trash className="h-4 w-4"/></Button>
                                <Button size="sm" variant="outline" onClick={onReorder}>
                                    <Repeat className="mr-2 h-4 w-4"/> Reorder
                                </Button>
                            </div>
                        </Card>
                    )
                })}
                 {filteredItems.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center">No items match your criteria.</p>
                )}
            </div>
        </div>
    )
}
