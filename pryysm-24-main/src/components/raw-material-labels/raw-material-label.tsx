
"use client";

import React, { useState, useEffect, forwardRef } from 'react';
import QRCode from 'qrcode';
import { Layers3, Droplet, Sparkles, MapPin } from 'lucide-react';
import type { Spool, Resin, Powder } from '@/hooks/use-workspace';

type MaterialItem = (Spool | Resin | Powder) & { itemType: 'spool' | 'resin' | 'powder' };

interface RawMaterialLabelProps {
  item: MaterialItem;
  currentItem: number;
  totalItems: number;
}

export const RawMaterialLabel = forwardRef<HTMLDivElement, RawMaterialLabelProps>(({ item, currentItem, totalItems }, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const { id, itemType, name, brand } = item;
  const materialId = (item as any).spoolId || (item as any).resinId || (item as any).powderId || 'N/A';
  const material = (item as any).material || (item as any).type || 'N/A';
  const color = (item as any).color || 'transparent';
  const finish = (item as any).finish || 'N/A';
  const location = (item as any).location || 'N/A';


  useEffect(() => {
    const qrData = `PRYYSM://material/${itemType}/${materialId}`;
    QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 128,
        color: { dark:"#000000", light:"#FFFFFF" }
    })
      .then(url => { setQrCodeUrl(url); })
      .catch(err => { console.error('Failed to generate QR code:', err); });
  }, [itemType, materialId]);

  const Icon = itemType === 'spool' ? Layers3 : itemType === 'resin' ? Droplet : Sparkles;

  return (
    <div ref={ref} className="w-full aspect-[2/1] bg-white text-black font-sans">
      <div className="w-full h-full p-1 flex items-stretch gap-1 border border-black">
        {/* Left Column: QR Code */}
        <div className="flex-shrink-0 w-[38%] h-full flex items-center justify-center p-0.5">
             {qrCodeUrl ? (
                <img src={qrCodeUrl} alt={`QR Code for ${name}`} className="w-full h-full object-contain" />
            ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-sm" />
            )}
        </div>

        {/* Right Column: Details */}
        <div className="flex-grow flex flex-col justify-between h-full text-[9px] leading-tight py-1 pr-0.5">
            <div>
                <h3 className="text-[10px] font-bold tracking-tighter leading-none">{name}</h3>
                <p className="text-gray-700 text-[8px]">{brand}</p>
            </div>

            <div className="space-y-1 text-[9px] flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full border border-black" style={{ backgroundColor: color }}></div>
                 <div className="flex-grow">
                    <p className="flex items-center gap-1"><Icon className="w-2.5 h-2.5" /> <span className="font-semibold">{material}</span></p>
                    <p>Finish: <span className="font-semibold">{finish}</span></p>
                    <p className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> <span className="font-semibold">{location}</span></p>
                 </div>
            </div>
            
            <div className="text-center font-mono text-[10px] pt-1 border-t border-gray-400">
                Item {currentItem} of {totalItems}
            </div>
        </div>
      </div>
    </div>
  );
});

RawMaterialLabel.displayName = "RawMaterialLabel";
