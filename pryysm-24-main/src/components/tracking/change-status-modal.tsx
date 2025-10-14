
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Order } from '@/components/orders/orders-client';
import { Badge } from '../ui/badge';
import { MoveRight, PackageCheck, Wrench, Package, CheckSquare } from 'lucide-react';

interface ChangeStatusModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (orderId: number, newStatus: Order['status']) => void;
}

const allStatuses: Order['status'][] = ['pending', 'in-progress', 'overdue', 'qc', 'packing', 'dispatched', 'completed'];

const statusDetails: Record<Order['status'], { label: string; icon: React.ElementType }> = {
    pending: { label: 'Order Received', icon: Package },
    'in-progress': { label: 'Printing', icon: Wrench },
    overdue: { label: 'Printing (Overdue)', icon: Wrench },
    qc: { label: 'Quality Control', icon: CheckSquare },
    packing: { label: 'Packing', icon: Package },
    dispatched: { label: 'Dispatched', icon: PackageCheck },
    completed: { label: 'Completed', icon: PackageCheck },
};


export function ChangeStatusModal({ order, isOpen, onClose, onStatusChange }: ChangeStatusModalProps) {
    if (!order) return null;

    const currentStatusInfo = statusDetails[order.status];
    const currentStatusIndex = allStatuses.indexOf(order.status);

    // Allow moving to any status that comes after the current one.
    const nextPossibleStatuses = allStatuses.slice(currentStatusIndex + 1);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Status for: {order.orderNumber}</DialogTitle>
                    <DialogDescription>
                        Project for <span className="font-semibold">{order.customer}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex items-center justify-center gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Current Status</p>
                            <Badge variant="secondary" className="text-base mt-1">{currentStatusInfo.label}</Badge>
                        </div>
                         <MoveRight className="h-6 w-6 text-muted-foreground" />
                         <div>
                            <p className="text-sm text-muted-foreground">New Status</p>
                             <p className="font-bold text-lg text-primary">?</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2 pt-4">
                        <p className="font-medium text-center">Select the next stage for this project:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {nextPossibleStatuses.length > 0 ? (
                                nextPossibleStatuses.map(status => {
                                    const { label, icon: Icon } = statusDetails[status];
                                    return (
                                        <Button
                                            key={status}
                                            variant="outline"
                                            className="h-12 justify-start"
                                            onClick={() => onStatusChange(order.id, status)}
                                        >
                                            <Icon className="mr-3 h-5 w-5"/>
                                            <span className="capitalize">{label}</span>
                                        </Button>
                                    )
                                })
                           ) : (
                               <p className="text-sm text-muted-foreground text-center col-span-full py-4">This project is already at its final stage.</p>
                           )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
