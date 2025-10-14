
"use client";

import React, { useState, useEffect, forwardRef } from 'react';
import QRCode from 'qrcode';
import { Printer as PrinterIcon, MapPin, Layers } from 'lucide-react';
import type { Printer } from '@/hooks/use-workspace';

interface PrinterLabelProps {
  printer: Printer;
}

export const PrinterLabel = forwardRef<HTMLDivElement, PrinterLabelProps>(({ printer }, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const qrData = `PRYYSM://printer/${printer.id}`;
    QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 128,
        color: { dark:"#000000", light:"#FFFFFF" }
    })
      .then(url => { setQrCodeUrl(url); })
      .catch(err => { console.error('Failed to generate QR code:', err); });
  }, [printer]);

  return (
    // Sized with aspect ratio for preview, actual size enforced in PDF
    <div ref={ref} className="w-full aspect-[2/1] bg-white text-black font-sans">
      <div className="w-full h-full p-2 flex items-stretch gap-2 border border-black">
        {/* Left Column: QR Code */}
        <div className="flex-shrink-0 w-[30%] h-full flex items-center justify-center">
             {qrCodeUrl ? (
                <img src={qrCodeUrl} alt={`QR Code for ${printer.name}`} className="w-full h-full object-contain" />
            ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-sm" />
            )}
        </div>

        {/* Right Column: Details */}
        <div className="flex-grow flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xs font-bold tracking-tight leading-none flex items-center gap-1">
                    {printer.name}
                </h3>
                <p className="text-[10px] text-gray-700 font-semibold">{printer.codeName}</p>
            </div>

            <div className="space-y-0.5 text-[9px] text-gray-600">
                <p className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {printer.location}</p>
                <p className="flex items-center gap-1"><Layers className="w-2.5 h-2.5" /> {printer.technology}</p>
            </div>
            
            <div className="text-right font-bold text-[7px] text-gray-500">
                PRYYSM ASSET TAG
            </div>
        </div>
      </div>
    </div>
  );
});

PrinterLabel.displayName = "PrinterLabel";
