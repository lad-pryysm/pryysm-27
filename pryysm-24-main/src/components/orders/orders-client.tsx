
"use client"

import React, { useState, useMemo } from 'react'
import { OrdersHeader } from './orders-header'
import { OrdersList } from './orders-list'
import { NewOrderForm } from './new-order-form'
import { useToast } from '@/hooks/use-toast'
import { useWorkspace } from '@/hooks/use-workspace'
import { Button } from '@/components/ui/button'
import { BarChart, List, PlusCircle, LayoutDashboard } from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export interface Order {
  id: number
  customer: string
  orderNumber: string
  projectCode: string
  orderDate: string
  deadline: string
  status: 'pending' | 'in-progress' | 'overdue' | 'qc' | 'packing' | 'dispatched' | 'completed' 
  items: number
  priority: 'low' | 'medium' | 'high'
  notes?: string
  printerTech: string
  salesPerson: string
  imageUrl?: string
}

export function OrdersClient() {
  const [activeTab, setActiveTab] = useState('list');
  const { orders, customers, addOrder } = useWorkspace();
  const { toast } = useToast();

  const handleNewOrder = (newOrderData: Omit<Order, 'id' | 'status'>) => {
    const newOrder = addOrder(newOrderData);
    
    if (newOrder) {
      setActiveTab('list');
      toast({
          title: "Order Created",
          description: `Order ${newOrder.orderNumber} for ${newOrder.customer} has been created and added to the job queue.`
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6 md:gap-8">
      <OrdersHeader onNewOrderClick={() => setActiveTab('newOrder')} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs rounded-full">
          <TabsTrigger value="list"><List className="mr-2"/>Orders List</TabsTrigger>
          <TabsTrigger value="newOrder"><PlusCircle className="mr-2"/>New Order</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <OrdersList orders={orders} />
        </TabsContent>
        <TabsContent value="newOrder" className="mt-6">
           <NewOrderForm 
            onSubmit={handleNewOrder}
            onCancel={() => setActiveTab('list')}
            customers={customers} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
