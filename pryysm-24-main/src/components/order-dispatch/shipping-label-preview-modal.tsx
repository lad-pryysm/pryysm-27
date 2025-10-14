
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
import { ShippingLabel, type ShippingInfo } from './shipping-label';
import { Printer } from 'lucide-react';

interface ShippingLabelPreviewModalProps {
    info: ShippingInfo | null;
    onClose: () => void;
}

export function ShippingLabelPreviewModal({ info, onClose }: ShippingLabelPreviewModalProps) {
    if (!info) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const labelElement = document.getElementById('modal-printable-label');
            if (labelElement) {
                printWindow.document.write('<html><head><title>Print Label</title>');
                // You may need to link your CSS file here for proper styling in the new window
                printWindow.document.write('<link rel="stylesheet" href="/globals.css" type="text/css" />');
                printWindow.document.write('</head><body>');
                printWindow.document.write(labelElement.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                // A timeout is often needed to ensure styles are loaded before printing
                setTimeout(() => {
                     printWindow.print();
                     printWindow.close();
                }, 500);
            }
        }
    }


    return (
        <Dialog open={!!info} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Label Preview</DialogTitle>
                    <DialogDescription>
                        Preview for Order ID: {info.orderId}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 bg-gray-200 flex justify-center items-center rounded-lg">
                    <div id="modal-printable-label">
                         <ShippingLabel info={info} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
