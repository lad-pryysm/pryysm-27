
"use client";

import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { useWorkspace } from '@/hooks/use-workspace';
import QRCode from 'qrcode';
import { Layers, Printer } from 'lucide-react';
import type { Order } from '@/components/orders/orders-client';

interface ProjectLabelProps {
  order: Order;
  currentItem: number;
  totalItems: number;
}

export const ProjectLabel = forwardRef<HTMLDivElement, ProjectLabelProps>(({ order, currentItem, totalItems }, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { customers, printers, schedule } = useWorkspace();
  const customer = customers.find(c => c.name === order.customer);
  const customerCode = customer ? customer.customerCode : 'N/A';

  const assignedPrinter = useMemo(() => {
    for (const printerSchedule of schedule) {
      const job = printerSchedule.jobs.find(j => j.projectCode === order.projectCode);
      if (job) {
        return printers.find(p => p.id === printerSchedule.printerId);
      }
    }
    return null;
  }, [schedule, printers, order.projectCode]);


  useEffect(() => {
    const qrData = `PRYYSM://project/${order.orderNumber}/item-${currentItem}`;
    QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 128,
        color: { dark:"#000000", light:"#FFFFFF" }
    })
      .then(url => { setQrCodeUrl(url); })
      .catch(err => { console.error('Failed to generate QR code:', err); });
  }, [order, currentItem]);

  return (
    // This component is now used for both preview and hidden rendering for PDF
    // The size is controlled by the parent container
    <div ref={ref} className="w-full aspect-[2/1] bg-white text-black font-sans">
      <div className="w-full h-full p-1 flex items-stretch gap-1 border border-black">
        {/* Left Column: QR Code */}
        <div className="flex-shrink-0 w-[38%] h-full flex items-center justify-center p-0.5">
             {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Project QR Code" className="w-full h-full object-contain" />
            ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-sm" />
            )}
        </div>

        {/* Right Column: Details */}
        <div className="flex-grow flex flex-col justify-between h-full text-[9px] leading-tight py-1 pr-0.5">
            <div>
                <h3 className="text-[11px] font-bold tracking-tighter leading-none">{order.projectCode}</h3>
                <p className="text-gray-700 font-semibold">{customerCode}</p>
            </div>

            <div className="space-y-1 text-[10px]">
                <p className="flex items-center gap-1"><Layers className="w-3 h-3" /> <span className="font-semibold">Tech:</span> {assignedPrinter?.technology || 'N/A'}</p>
                <p className="flex items-center gap-1"><Printer className="w-3 h-3" /> <span className="font-semibold">Printer:</span> {assignedPrinter?.name || 'Unassigned'}</p>
            </div>
            
            <div className="text-center font-bold text-[11px] pt-1 border-t border-gray-400">
                Item {currentItem} of {totalItems}
            </div>
        </div>
      </div>
    </div>
  );
});

ProjectLabel.displayName = "ProjectLabel";
