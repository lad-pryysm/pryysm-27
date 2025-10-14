
"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Package, Recycle, Shield, GlassWater, Barcode } from 'lucide-react'

export interface AddressInfo {
    name: string;
    company: string;
    line1: string;
    hasLine2: boolean;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: {
        prefix: string;
        number: string;
    };
}

export interface PackageDetails {
    trackingNumber: string;
    weight: string;
    weightUnit: 'kg' | 'lb';
    length: string;
    width: string;
    height: string;
    dimensionUnit: 'cm' | 'in';
    contents: string;
}


export interface ShippingInfo {
    from: AddressInfo;
    to: AddressInfo;
    orderId: string;
    barcode: string;
    itemNumber: string;
    packageDetails: PackageDetails;
}

export function ShippingLabel({ info }: { info: ShippingInfo }) {

  const formatAddress = (addr: AddressInfo) => {
    return (
      <>
        <p>{addr.name}</p>
        {addr.company && <p>{addr.company}</p>}
        <p>{addr.line1}</p>
        {addr.hasLine2 && addr.line2 && <p>{addr.line2}</p>}
        <p>{`${addr.city}, ${addr.state} ${addr.zip}`}</p>
        <p>{addr.country}</p>
        {addr.phone?.number && <p>P: {addr.phone.prefix} {addr.phone.number}</p>}
      </>
    )
  }

  return (
    <div className="printable-label">
        <Card className="w-full @lg:w-[4in] @lg:h-[6in] p-4 flex flex-col bg-white border-2 border-black shadow-lg rounded-lg">
            <header className="flex justify-between items-center pb-2">
                <div className="flex items-center gap-2">
                    <Package className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Pryysm <span className="text-sm font-medium text-muted-foreground">by 3D Prodigy</span></h3>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold">ORDER #</p>
                    <p className="text-sm">{info.orderId}</p>
                </div>
            </header>
            
            <Separator className="bg-black my-2" />

            <div className="grid grid-cols-2 gap-4 py-2 text-xs">
                <div>
                    <p className="font-bold uppercase">From:</p>
                    {formatAddress(info.from)}
                </div>
                <div className="pl-4 border-l border-dashed border-black">
                    <p className="font-bold uppercase">To:</p>
                    {formatAddress(info.to)}
                </div>
            </div>

            <Separator className="bg-black my-2" />
            
            <div className="text-center py-4">
                <p className="text-lg @lg:text-2xl font-bold tracking-wider">PRIORITY MAIL</p>
            </div>

            <Separator className="bg-black my-2" />
            
            <div className="flex-grow flex items-center justify-between gap-4 py-2">
                 <div className="flex flex-col gap-2">
                    <div className="h-12 w-12 border border-black flex items-center justify-center rounded-sm"><GlassWater className="h-8 w-8" /></div>
                    <div className="h-12 w-12 border border-black flex items-center justify-center rounded-sm"><Shield className="h-8 w-8" /></div>
                    <div className="h-12 w-12 border border-black flex items-center justify-center rounded-sm"><Recycle className="h-8 w-8" /></div>
                </div>
                 <div className="flex-grow flex flex-col items-center justify-center">
                    <Barcode className="w-full h-16" />
                    <p className="text-sm font-mono tracking-widest mt-1">{info.barcode}</p>
                </div>
            </div>
            
            <Separator className="bg-black my-2" />

            <footer className="pt-2 text-xs">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p><span className="font-bold">Item Nº:</span> {info.itemNumber}</p>
                        <p><span className="font-bold">Contents:</span> {info.packageDetails.contents}</p>
                    </div>
                    <div className="text-right">
                         <p><span className="font-bold">Weight:</span> {info.packageDetails.weight} {info.packageDetails.weightUnit}</p>
                         <p className="font-bold">May be opened officially.</p>
                    </div>
                </div>
            </footer>
        </Card>
    </div>
  )
}

    
