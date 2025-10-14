
"use client"

import React from 'react'
import type { Document, Customer } from '@/hooks/use-workspace'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { format } from 'date-fns'

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document;
    customer: Customer;
}

const currencySymbols = { USD: '$', EUR: '€', AED: 'AED', INR: '₹' };

export function DocumentPreviewModal({ isOpen, onClose, document, customer }: DocumentPreviewModalProps) {
    if (!document || !customer) return null;

    // Use a placeholder currency or determine it from context if available
    const currencySymbol = '$'; 

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(document.type, 14, 22);

        doc.setFontSize(12);
        doc.text(`Order #: ${document.orderNumber}`, 14, 32);
        doc.text(`Date: ${format(new Date(document.date), 'dd-MM-yyyy')}`, doc.internal.pageSize.getWidth() - 14, 32, { align: 'right' });

        doc.setFontSize(10);
        doc.text(`Customer: ${customer.name}`, 14, 45);
        const addressLines = doc.splitTextToSize(customer.address || '', 80);
        doc.text(addressLines, 14, 50);

        autoTable(doc, {
            startY: 70,
            head: [['Description', 'Amount']],
            body: [
                [`${document.type} for Order #${document.orderNumber}`, `${currencySymbol}${document.amount.toFixed(2)}`],
            ],
            foot: [
                [{ content: 'Total', styles: { fontStyle: 'bold' } }, { content: `${currencySymbol}${document.amount.toFixed(2)}`, styles: { fontStyle: 'bold' } }]
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 75, 141] },
        });

        doc.save(`${document.type}-${document.orderNumber}.pdf`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{document.type} Preview</DialogTitle>
                    <DialogDescription>
                        A quick overview of Order #{document.orderNumber}. This is a summary, not the final PDF.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6 text-sm max-h-[70vh] overflow-y-auto">
                    
                    <div className="flex justify-between items-start p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold text-lg">{document.type}</h3>
                            <p className="text-muted-foreground">Order #{document.orderNumber}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-semibold">{format(new Date(document.date), 'dd-MM-yyyy')}</p>
                             <p className="text-muted-foreground">Date</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <h4 className="font-semibold text-base border-b pb-1">Customer Details</h4>
                             <p className="font-bold">{customer.name}</p>
                             {customer.company && <p>{customer.company}</p>}
                             <p>{customer.address}</p>
                             <p>{customer.email}</p>
                             <p>{customer.phone}</p>
                             {customer.taxId && <p>Tax ID: {customer.taxId}</p>}
                        </div>
                         <div className="space-y-2">
                            <h4 className="font-semibold text-base border-b pb-1">Financial Summary</h4>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-bold text-xl">{currencySymbol}{document.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-center text-muted-foreground">
                        <p>This is a simplified preview.</p>
                        <p>Line items and other specific details would appear on the final generated PDF.</p>
                    </div>

                </div>
                <DialogFooter className="sm:justify-end border-t pt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
