
"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Currency } from './dashboard-client'
import { format as formatDateFns } from 'date-fns'
import { useWorkspace } from '@/hooks/use-workspace'
import type { Order } from '@/components/orders/orders-client'

const exchangeRates = {
  USD: 1,
  EUR: 0.93,
  AED: 3.67,
  INR: 83.12,
};
const currencySymbols = {
  USD: '$',
  EUR: '€',
  AED: 'AED',
  INR: '₹',
};

const formatCurrency = (amount: number, currency: Currency) => {
    const symbol = currencySymbols[currency];
    const formatted = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${symbol}${formatted}`;
}

const statusVariants: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
    completed: 'default',
    'in-progress': 'secondary',
    pending: 'outline',
    overdue: 'destructive'
};

export function RecentOrders({ currency }: { currency: Currency }) {
  const { orders } = useWorkspace();

  const processedOrders = useMemo(() => {
    // Show only the 5 most recent orders
    return orders.slice(0, 5).map((order: Order) => {
      // Assuming a placeholder amount if not present in the order data
      const randomAmount = order.items * (Math.random() * 40 + 10);
      return {
        ...order,
        date: formatDateFns(new Date(order.orderDate), 'dd-MM-yyyy'),
        amount: formatCurrency(randomAmount, currency)
      }
    })
  }, [currency, orders]);

  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button asChild variant="outline">
          <Link href="/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[order.status] || 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{order.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
