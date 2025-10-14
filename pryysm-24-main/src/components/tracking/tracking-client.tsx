
"use client";

import React, { useState, useMemo, useCallback, createRef, useRef, useEffect } from 'react';
import { KanbanBoard } from './kanban-board';
import { ProjectDetailsModal } from './project-details-modal';
import { useWorkspace } from '@/hooks/use-workspace';
import type { Order } from '@/components/orders/orders-client';
import type { Customer } from '@/hooks/use-workspace';
import { Workflow, User, LogOut, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QRScannerModal } from './qr-scanner-modal';
import { ChangeStatusModal } from './change-status-modal';

export type KanbanCardData = Order & { company?: string, type: 'order' };

export type KanbanColumnId = 'order-received' | 'printing' | 'qc' | 'packing' | 'dispatched';

export interface KanbanColumn {
    id: KanbanColumnId;
    title: string;
    items: KanbanCardData[];
}

const columnStatusMap: Record<KanbanColumnId, Order['status'][]> = {
    'order-received': ['pending'],
    'printing': ['in-progress', 'overdue'],
    'qc': ['qc'],
    'packing': ['packing'],
    'dispatched': ['dispatched', 'completed'],
};

const statusToColumnMap: { [key in Order['status']]: KanbanColumnId } = {
    pending: 'order-received',
    'in-progress': 'printing',
    overdue: 'printing',
    qc: 'qc',
    packing: 'packing',
    dispatched: 'dispatched',
    completed: 'dispatched',
};

export function TrackingClient() {
    const { 
        orders, 
        customers, 
        updateOrderStatus,
    } = useWorkspace();
    const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
    const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const { toast } = useToast();

    const cardRefs = useRef<{[key: string]: React.RefObject<HTMLDivElement>}>({});

    const columns: KanbanColumn[] = useMemo(() => {
        const getCompany = (customerName: string): string | undefined => {
            return customers.find((c: Customer) => c.name === customerName)?.company;
        };

        const ordersWithCompany: KanbanCardData[] = orders.map(o => ({ ...o, company: getCompany(o.customer), type: 'order' }));
        
        // Ensure refs exist for all draggable items
        ordersWithCompany.forEach(item => {
            const cardId = item.orderNumber;
            if (!cardRefs.current[cardId]) {
                cardRefs.current[cardId] = createRef<HTMLDivElement>();
            }
        });

        return [
            { id: 'order-received', title: 'Order Received', items: ordersWithCompany.filter(o => columnStatusMap['order-received'].includes(o.status)) },
            { id: 'printing', title: 'Printing', items: ordersWithCompany.filter(o => columnStatusMap['printing'].includes(o.status)) },
            { id: 'qc', title: 'Quality Control', items: ordersWithCompany.filter(o => columnStatusMap['qc'].includes(o.status)) },
            { id: 'packing', title: 'Packing', items: ordersWithCompany.filter(o => columnStatusMap['packing'].includes(o.status)) },
            { id: 'dispatched', title: 'Dispatched', items: ordersWithCompany.filter(o => columnStatusMap['dispatched'].includes(o.status)) },
        ];
    }, [orders, customers]);

    useEffect(() => {
        // Check for a highlighted order ID from another page (e.g., Orders page)
        const orderToHighlight = localStorage.getItem('highlightOrderId');
        if (orderToHighlight) {
            setHighlightedCardId(orderToHighlight);
            localStorage.removeItem('highlightOrderId');
        }
    }, []);

    useEffect(() => {
        if (highlightedCardId) {
            const ref = cardRefs.current[highlightedCardId];
            if (ref && ref.current) {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const timer = setTimeout(() => setHighlightedCardId(null), 2000); // Highlight for 2 seconds
                return () => clearTimeout(timer);
            }
        }
    }, [highlightedCardId]);

    const handleCardClick = (card: KanbanCardData) => {
        setSelectedCard(card);
    };

    const handleDrop = useCallback((item: { id: string | number; type: 'order'; sourceColumnId: KanbanColumnId }, targetColumnId: KanbanColumnId) => {
        const { id, type, sourceColumnId } = item;
        
        if (sourceColumnId === targetColumnId) return;

        if (type === 'order') {
            const orderId = Number(id);
            const newStatus = columnStatusMap[targetColumnId][0]; // Take the primary status for the column
            if (newStatus) {
                updateOrderStatus(orderId, newStatus);
                toast({ title: 'Order Status Updated', description: `Order moved to ${targetColumnId.replace('-', ' ')}.`});
            }
        }
        
    }, [updateOrderStatus, toast]);
    
    const handleScanSuccess = (orderNumber: string) => {
        setIsScannerOpen(false);
        const order = orders.find(o => o.orderNumber === orderNumber);
        
        if (order) {
            setHighlightedCardId(order.orderNumber);
            setScannedOrder(order);
            setIsStatusModalOpen(true);
        } else {
             toast({
                variant: "destructive",
                title: "Order Not Found",
                description: `Could not find order ${orderNumber} on the board.`
            });
        }
    };
    
    const handleChangeStatus = (orderId: number, newStatus: Order['status']) => {
        updateOrderStatus(orderId, newStatus);
        setIsStatusModalOpen(false);
        setScannedOrder(null);
        toast({ title: 'Status Updated', description: `Order moved to ${newStatus.replace('-', ' ')}.` });
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Workflow className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Project Tracking</h1>
                        <p className="text-sm text-muted-foreground">Visualize and manage your entire workflow.</p>
                    </div>
                     <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR Code
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-x-auto">
                <KanbanBoard 
                    columns={columns} 
                    onCardClick={handleCardClick} 
                    onDrop={handleDrop} 
                    cardRefs={cardRefs.current}
                    highlightedCardId={highlightedCardId}
                />
            </div>

            {selectedCard && (
                <ProjectDetailsModal
                    card={selectedCard}
                    isOpen={!!selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}
            
            <QRScannerModal 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />

            {scannedOrder && (
                <ChangeStatusModal
                    order={scannedOrder}
                    isOpen={isStatusModalOpen}
                    onClose={() => { setIsStatusModalOpen(false); setScannedOrder(null); }}
                    onStatusChange={handleChangeStatus}
                />
            )}
        </div>
    );
}
