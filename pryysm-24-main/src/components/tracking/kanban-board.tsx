
"use client";

import React, { useMemo } from 'react';
import type { KanbanColumn as KanbanColumnType, KanbanCardData, KanbanColumnId } from './tracking-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Building, Calendar, Layers, Flag, Hash, Inbox, Wrench, CheckSquare, Package, Truck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanBoardProps {
    columns: KanbanColumnType[];
    cardRefs: { [key: string]: React.RefObject<HTMLDivElement> };
    highlightedCardId: string | null;
    onCardClick: (card: KanbanCardData) => void;
    onDrop: (item: { id: string | number; type: 'order'; sourceColumnId: KanbanColumnId }, targetColumnId: KanbanColumnId) => void;
}

export function KanbanBoard({ columns, onCardClick, onDrop, cardRefs, highlightedCardId }: KanbanBoardProps) {
    return (
        <div className="flex gap-6 pb-4 items-start">
            {columns.map((column, index) => (
                 <React.Fragment key={column.id}>
                    <KanbanColumn
                        column={column}
                        cardRefs={cardRefs}
                        highlightedCardId={highlightedCardId}
                        onCardClick={onCardClick}
                        onDrop={onDrop}
                    />
                    {index < columns.length - 1 && (
                        <div className="hidden lg:flex items-center justify-center h-full pt-20">
                            <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

interface KanbanColumnProps {
    column: KanbanColumnType;
    cardRefs: { [key: string]: React.RefObject<HTMLDivElement> };
    highlightedCardId: string | null;
    onCardClick: (card: KanbanCardData) => void;
    onDrop: (item: { id: string | number; type: 'order'; sourceColumnId: KanbanColumnId }, targetColumnId: KanbanColumnId) => void;
}

const columnStyles: Record<KanbanColumnId, { icon: React.ElementType, color: string }> = {
    'order-received': { icon: Inbox, color: 'border-t-sky-500' },
    'printing': { icon: Wrench, color: 'border-t-amber-500' },
    'qc': { icon: CheckSquare, color: 'border-t-blue-500' },
    'packing': { icon: Package, color: 'border-t-orange-500' },
    'dispatched': { icon: Truck, color: 'border-t-green-500' },
};


function KanbanColumn({ column, onCardClick, onDrop, cardRefs, highlightedCardId }: KanbanColumnProps) {
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) {
            console.error("Dropped data is empty.");
            return;
        }
        try {
            const item = JSON.parse(data);
            onDrop(item, column.id);
        } catch (error) {
            console.error("Failed to parse dropped data", error);
        }
    };

    const style = columnStyles[column.id];

    return (
        <div 
            className="w-80 md:w-96 flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <Card className={cn("bg-muted/50 h-full border-t-4", style.color)}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-base">
                        <div className="flex items-center gap-2">
                           <style.icon className="h-5 w-5"/>
                           <span>{column.title}</span>
                        </div>
                        <span className="text-sm font-bold h-6 w-6 flex items-center justify-center rounded-full bg-primary/10 text-primary">{column.items.length}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {column.items.map(item => {
                        const cardId = item.orderNumber;
                        return (
                            <KanbanCard 
                                key={`${item.type}-${item.id}`} 
                                item={item} 
                                sourceColumnId={column.id} 
                                onClick={() => onCardClick(item)} 
                                ref={cardRefs[cardId]}
                                isHighlighted={highlightedCardId === cardId}
                            />
                        )
                    })}
                     {column.items.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                            Drop items here
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

interface KanbanCardProps {
    item: KanbanCardData;
    sourceColumnId: KanbanColumnId;
    isHighlighted: boolean;
    onClick: () => void;
}

const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(({ item, sourceColumnId, isHighlighted, onClick }, ref) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const payload = {
            id: item.id,
            type: item.type,
            sourceColumnId: sourceColumnId,
        };
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const { priority, orderNumber, technology, deadline, customer, company } = useMemo(() => ({
        priority: item.priority || 'medium',
        orderNumber: item.orderNumber,
        technology: item.printerTech,
        deadline: item.deadline,
        customer: item.customer,
        company: item.company,
    }), [item]);

    const priorityClasses = {
        high: { border: 'border-l-red-500', bg: 'bg-red-500/10 text-red-700' },
        medium: { border: 'border-l-yellow-500', bg: 'bg-yellow-500/10 text-yellow-700' },
        low: { border: 'border-l-green-500', bg: 'bg-green-500/10 text-green-700' },
    };
    const priorityClass = priorityClasses[priority as keyof typeof priorityClasses] || priorityClasses.medium;

    return (
        <div
            ref={ref}
            draggable
            onDragStart={handleDragStart}
            onClick={onClick}
            className={cn(
                'p-4 bg-background rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all border-l-4', 
                priorityClass.border,
                isHighlighted && 'ring-2 ring-offset-2 ring-primary'
            )}
        >
            <div className="flex items-start gap-4">
                <Image 
                    src={item.imageUrl || "https://placehold.co/100x100.png"} 
                    alt="Item image" 
                    width={56} height={56} 
                    className="rounded-md object-cover flex-shrink-0"
                    data-ai-hint="product photo"
                />
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{customer}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
                        <Building className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{company || 'N/A'}</span>
                    </p>
                </div>
                {orderNumber && <Badge variant="outline" className="text-xs font-mono">{orderNumber}</Badge>}
            </div>
            <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground"/>
                    <span className="font-medium">Priority:</span>
                    <Badge variant="secondary" className={cn("capitalize text-xs", priorityClass.bg)}>{priority}</Badge>
                </div>
                 <div className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground"/>
                    <span className="font-medium">Items:</span>
                    <span className="font-semibold">{item.items || 1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground"/>
                    <span className="font-medium">Tech:</span>
                    <span className="font-semibold">{technology}</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground"/>
                    <span className="font-medium">Due:</span>
                    <span className="font-semibold">{format(new Date(deadline), 'dd-MMM')}</span>
                </div>
            </div>
        </div>
    );
});
KanbanCard.displayName = "KanbanCard";
