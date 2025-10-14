
"use client"

import React, { useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { InventoryDashboard } from './inventory-dashboard'
import { InventoryList } from './inventory-list'
import { AddItemForm } from './add-item-form'
import { EditItemForm } from './edit-item-form'
import { ReorderManagement } from './reorder-management'
import { Box, LayoutDashboard, List, PlusCircle, Repeat, User, LogOut, QrCode } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { useWorkspace } from '@/hooks/use-workspace'
import type { InventoryItem } from '@/hooks/use-workspace'
import { ScanAndAdd } from './scan-and-add'

export function InventoryClient() {
    const { 
        inventory, 
        addInventoryItem, 
        updateInventoryItem, 
        deleteInventoryItem, 
        useInventoryItem,
    } = useWorkspace();
    
    const { toast } = useToast()
    const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
    const [activeTab, setActiveTab] = useState("dashboard");

    const handleAddItem = (newItem: Omit<InventoryItem, 'id' | 'status'>) => {
        addInventoryItem(newItem);
        toast({ title: "Item Added", description: `${newItem.name} has been added to inventory.` });
        setActiveTab("inventory");
    };

    const handleDeleteItem = (id: string) => {
        const itemToDelete = inventory.find(item => item.id === id);
        deleteInventoryItem(id);
        toast({ title: "Item Removed", description: `${itemToDelete?.name} has been removed.`, variant: "destructive" });
    };
    
    const handleEditItem = (updatedItem: InventoryItem) => {
        updateInventoryItem(updatedItem);
        setItemToEdit(null);
        toast({ title: "Item Updated", description: `${updatedItem.name} has been updated.` });
    };
    
    const handleTriggerReorder = () => {
        setActiveTab("reorder");
    }
    
    const handleUseItem = (itemId: string, quantityUsed: number) => {
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;
        
        if (quantityUsed > item.quantity) {
            toast({ variant: 'destructive', title: 'Not enough stock', description: `Cannot use ${quantityUsed} items, only ${item.quantity} available.`});
            return;
        }

        useInventoryItem(itemId, quantityUsed);
        toast({ title: "Inventory Updated", description: `${quantityUsed} unit(s) of item ${item.name} have been used.` });
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
             <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Box className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Spares and Stores</h1>
                        <p className="text-sm text-muted-foreground">Manage all your spare parts and store items.</p>
                    </div>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-2xl rounded-full">
                    <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2"/>Dashboard</TabsTrigger>
                    <TabsTrigger value="inventory"><List className="mr-2"/>Inventory</TabsTrigger>
                    <TabsTrigger value="add-item"><PlusCircle className="mr-2"/>Add Item</TabsTrigger>
                    <TabsTrigger value="reorder"><Repeat className="mr-2"/>Reorder</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-6">
                    <InventoryDashboard items={inventory} />
                </TabsContent>
                <TabsContent value="inventory" className="mt-6">
                    <InventoryList items={inventory} onDelete={handleDeleteItem} onEdit={(item) => setItemToEdit(item)} onReorder={handleTriggerReorder} />
                </TabsContent>
                <TabsContent value="add-item" className="mt-6 space-y-8">
                    <ScanAndAdd onAddItem={handleAddItem} />
                    <AddItemForm onSubmit={handleAddItem} />
                </TabsContent>
                <TabsContent value="reorder" className="mt-6">
                    <ReorderManagement allInventory={inventory} />
                </TabsContent>
            </Tabs>

            {itemToEdit && (
                <EditItemForm
                    item={itemToEdit}
                    isOpen={!!itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    onSubmit={handleEditItem}
                />
            )}
        </div>
    )
}
