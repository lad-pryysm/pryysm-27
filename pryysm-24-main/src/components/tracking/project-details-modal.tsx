
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { KanbanCardData } from './tracking-client';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Box, Calendar, Clock, Hash, Info, Layers, User as UserIcon, Tag, Building } from 'lucide-react';

interface ProjectDetailsModalProps {
    card: KanbanCardData | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectDetailsModal({ card, isOpen, onClose }: ProjectDetailsModalProps) {
    if (!card) return null;

    const details = {
        title: `Order: ${card.orderNumber}`,
        subtitle: `Customer: ${card.customer}`,
        company: card.company,
        deadline: format(new Date(card.deadline), 'PPP'),
        imageUrl: card.imageUrl,
        priority: card.priority,
        technology: card.printerTech,
        items: card.items,
        notes: card.notes,
        status: card.status,
        salesPerson: card.salesPerson,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{details.title}</DialogTitle>
                    <DialogDescription>{details.subtitle}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex justify-center">
                        <Image 
                            src={details.imageUrl || "https://placehold.co/200x200.png"} 
                            alt="Project image" 
                            width={200} height={200} 
                            className="rounded-lg object-cover" 
                            data-ai-hint="product photo"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 col-span-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Company</p>
                                <p className="font-semibold">{details.company || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Deadline</p>
                                <p className="font-semibold">{details.deadline}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge variant="secondary" className="capitalize">{details.status.replace('-', ' ')}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Priority</p>
                                <p className="font-semibold capitalize">{details.priority}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Items</p>
                                <p className="font-semibold">{details.items}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Technology</p>
                                <p className="font-semibold">{details.technology}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Sales Person</p>
                                <p className="font-semibold">{details.salesPerson}</p>
                            </div>
                        </div>
                    </div>
                    {details.notes && (
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><Info className="h-4 w-4" /> Notes</h4>
                            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">{details.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
