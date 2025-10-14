
"use client"

import React, { useState, useMemo } from 'react'
import type { Order } from './orders-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Box,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Calendar,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

const statusBadgeVariants: { [key in Order['status']]: string } = {
  completed: 'bg-green-100 text-green-800',
  dispatched: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-cyan-100 text-cyan-800',
  overdue: 'bg-red-200 text-red-900 font-semibold border border-red-300',
  packing: 'bg-orange-100 text-orange-800',
  pending: 'bg-gray-100 text-gray-800',
  qc: 'bg-purple-100 text-purple-800',
};

const priorityBadgeVariants: { [key in Order['priority']]: string } = {
    high: "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30",
    low: "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30"
};

interface OrdersListProps {
  orders: Order[]
}

export function OrdersList({ orders }: OrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const router = useRouter();

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      overdue: orders.filter((o) => o.status === 'overdue').length,
      completed: orders.filter((o) => o.status === 'completed' || o.status === 'dispatched').length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [orders, searchTerm, statusFilter, priorityFilter])

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    // Reset time part to 00:00:00 for accurate day difference
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MM-yyyy');
  }

  const handleTrackOrder = (orderNumber: string) => {
    // Store the ID in localStorage to be picked up by the tracking page
    localStorage.setItem('highlightOrderId', orderNumber);
    router.push('/tracking');
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Stats Cards */}
      <div id="stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div id="orders-list">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 text-gray-400 transform -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search orders by customer or order number..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="qc">QC</SelectItem>
                    <SelectItem value="packing">Packing</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Orders Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                            <div className="font-medium">{order.orderNumber}</div>
                            <div className="text-sm text-muted-foreground">{order.projectCode}</div>
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(order.deadline)}</span>
                            <span className="text-xs text-muted-foreground">{getDaysRemaining(order.deadline)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("capitalize", statusBadgeVariants[order.status])}>
                            {order.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className={cn("capitalize", priorityBadgeVariants[order.priority])}>
                              {order.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order.orderNumber)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Track
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center">
                            <Search className="text-gray-400 h-12 w-12 mb-4"/>
                            <p className="text-lg font-medium">No orders found</p>
                            <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
