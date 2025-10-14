
"use client";

import React, { useState, useEffect, forwardRef } from 'react';
import QRCode from 'qrcode';
import { Package, Cpu, Wrench, Shapes, MapPin, AlertTriangle, Box } from 'lucide-react';
import type { InventoryItem } from '@/hooks/use-workspace';
import Image from 'next/image';

interface InventoryLabelProps {
  item: InventoryItem;
}

const CategoryIcons: Record<string, React.ElementType> = {
    "Packing Material": Package,
    "Electronics": Cpu,
    "Tools": Wrench,
    "Miscellaneous": Shapes
};

export const InventoryLabel = forwardRef<HTMLDivElement, InventoryLabelProps>(({ item }, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const qrData = `PRYYSM://inventory/${item.id}`;
    QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 128, // Generate a larger QR code for better quality
        color: { dark:"#000000", light:"#FFFFFF" }
    })
      .then(url => { setQrCodeUrl(url); })
      .catch(err => { console.error('Failed to generate QR code:', err); });
  }, [item]);

  const Icon = CategoryIcons[item.category] || Shapes;

  return (
    <div ref={ref} className="w-full aspect-[2/1] bg-white text-black font-sans">
      <div className="w-full h-full p-2 flex flex-col items-stretch gap-1 border border-black">
        {/* Middle Section with QR and Photo */}
        <div className="flex-grow flex items-center justify-start gap-2 min-h-0">
          <div className="w-[35%] h-full flex items-center justify-center p-0.5">
             {qrCodeUrl ? (
                <img src={qrCodeUrl} alt={`QR Code for ${item.name}`} className="w-full h-full object-contain" />
            ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-sm" />
            )}
          </div>
           <div className="w-[35%] h-full p-0.5 flex items-center justify-center">
             {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} width={128} height={128} className="w-full h-full object-contain" />
             ) : (
                <Box className="w-8 h-8 text-gray-400"/>
             )}
          </div>
          <div className="w-[30%] flex flex-col justify-center items-center text-[10px] leading-tight space-y-1 pl-1 border-l border-dashed border-gray-400">
             <div className="text-center">
                <p className="text-gray-500">Min. Qty</p>
                <p className="font-bold text-lg text-red-700">{item.minStock}</p>
            </div>
             <div className="text-center">
                <p className="text-gray-500">Location</p>
                <p className="font-bold truncate">{item.location || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center text-center border-t border-dashed border-gray-400 pt-1">
            <h3 className="text-[11px] font-bold tracking-tight leading-tight truncate w-full">{item.name}</h3>
            <p className="text-gray-700 font-mono text-[9px]">{item.barcode}</p>
        </div>
      </div>
    </div>
  );
});

InventoryLabel.displayName = "InventoryLabel";
