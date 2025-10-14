
"use client"
import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReorderAlert, type InventoryItemData } from "./reorder-alert"
import { useWorkspace } from "@/hooks/use-workspace"
import type { InventoryItem } from "@/hooks/use-workspace"

export function InventoryStatus() {
  const { inventory, spools, resins, powders } = useWorkspace();
  const [selectedItem, setSelectedItem] = useState<InventoryItemData | null>(null);

  const rawMaterialItems = useMemo((): InventoryItemData[] => {
    const allMaterials = [
      ...spools.map(s => ({ name: s.name, quantity: spools.filter(sp => sp.name === s.name && sp.status !== 'Empty').length, unit: 'spools', status: 'In Stock', historicalUsage: '10 spools/month' })),
      ...resins.map(r => ({ name: r.name, quantity: resins.filter(re => re.name === r.name && re.status !== 'Empty').length, unit: 'bottles', status: 'In Stock', historicalUsage: '5 bottles/month' })),
      ...powders.map(p => ({ name: p.name, quantity: powders.filter(po => po.name === p.name && po.status !== 'Empty').length, unit: 'kg', status: 'In Stock', historicalUsage: '2 kg/month' })),
    ];
    // Simple deduplication
    const uniqueMaterials = Array.from(new Map(allMaterials.map(item => [item.name, item])).values());
    
    // Update status for low stock
    return uniqueMaterials.map(item => {
      if (item.quantity < 5) { // Example low stock threshold
        return { ...item, status: 'Low Stock' };
      }
      return item;
    });
  }, [spools, resins, powders]);

  const otherInventoryItems = useMemo((): InventoryItemData[] => {
    return inventory.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: 'units',
      status: item.status,
      historicalUsage: 'N/A'
    }));
  }, [inventory]);


  const renderInventoryList = (items: InventoryItemData[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <Card
          key={index}
          className={`p-4 transition-transform duration-300 hover:-translate-y-1 cursor-pointer ${
            item.status === 'Low Stock' ? 'border-destructive border-l-4' : ''
          }`}
          onClick={() => item.status === 'Low Stock' && setSelectedItem(item)}
        >
          <h4 className="font-semibold text-sm">{item.name}</h4>
          <p className={`text-2xl font-bold my-2 ${item.status === 'Low Stock' ? 'text-destructive' : ''}`}>
            {item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
          </p>
          <p className={`text-xs font-medium ${item.status === 'Low Stock' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {item.status}
          </p>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Raw Material Status</CardTitle>
            <Button asChild variant="outline" size="sm">
                <Link href="/raw-material">Manage</Link>
            </Button>
            </CardHeader>
            <CardContent>
                {renderInventoryList(rawMaterialItems)}
            </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory Status</CardTitle>
            <Button asChild variant="outline" size="sm">
                <Link href="/inventory">Manage</Link>
            </Button>
            </CardHeader>
            <CardContent>
                 {renderInventoryList(otherInventoryItems)}
            </CardContent>
        </Card>
      </div>
      {selectedItem && (
         <ReorderAlert
          open={!!selectedItem}
          onOpenChange={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}
    </>
  )
}
