
"use client"

import React from 'react'
import type { Printer } from '@/hooks/use-workspace'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Printer as PrinterIcon, Clock } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'

interface PrintersListProps {
    printers: Printer[];
    onViewLog: (printer: Printer) => void;
}

const statusText: { [key in Printer['status']]: string } = {
    printing: "bg-green-100 text-green-800",
    running: "bg-green-100 text-green-800",
    idle: "bg-blue-100 text-blue-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    offline: 'bg-red-100 text-red-800',
};

const statusBorderColors: { [key in Printer['status']]: string } = {
    printing: 'border-l-4 border-green-500',
    running: 'border-l-4 border-green-500',
    idle: 'border-l-4 border-blue-500',
    maintenance: 'border-l-4 border-yellow-500',
    offline: 'border-l-4 border-red-500',
};


export function PrintersList({ printers, onViewLog }: PrintersListProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Printers</CardTitle>
            <CardDescription>Status of all printers.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {printers.length > 0 ? printers.map(printer => (
                <div key={printer.id} onClick={() => onViewLog(printer)} className={`p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${statusBorderColors[printer.status]}`}>
                     <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{printer.name}</h3>
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusText[printer.status]}`}>
                            {printer.status.charAt(0).toUpperCase() + printer.status.slice(1)}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            {printer.status === 'printing' && printer.currentJobImage ? (
                                <Image src={printer.currentJobImage} alt="Current Job" width={96} height={96} className="object-cover rounded-md" data-ai-hint="product photo" />
                            ) : (
                                <PrinterIcon className="w-10 h-10 text-muted-foreground" />
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1 w-full">
                            <div><span className="font-medium">Technology:</span> {printer.technology}</div>
                            <div><span className="font-medium">Capacity:</span> {printer.capacity}</div>
                            <div><span className="font-medium">Material:</span> {printer.material}</div>
                            <div className="pt-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    <Clock className="h-3 w-3" />
                                    {printer.status === 'printing' && printer.completionEstimate 
                                        ? `Done: ${format(printer.completionEstimate, 'dd-MM-yyyy, h:mm a')}`
                                        : printer.status === 'idle' && printer.idleSince
                                        ? `Idle since: ${format(printer.idleSince, 'dd-MM-yyyy, h:mm a')}`
                                        : `${printer.status.charAt(0).toUpperCase() + printer.status.slice(1)}`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )) : (
                 <div className="text-center text-muted-foreground py-8 col-span-full">
                    No printers match the selected technology.
                </div>
            )}
        </CardContent>
    </Card>
  )
}
