
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShippingLabel, type ShippingInfo } from './shipping-label'
import { PackageCheck, Printer } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkspace } from '@/hooks/use-workspace'
import { useToast } from '@/hooks/use-toast'
import { ShippingLog } from './shipping-log'
import { ShippingLabelPreviewModal } from './shipping-label-preview-modal'

const countryList = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'AE', name: 'United Arab Emirates' },
];

const phonePrefixes = [
    { value: '+1', label: 'US/CA (+1)' },
    { value: '+44', label: 'UK (+44)' },
    { value: '+61', label: 'AU (+61)' },
    { value: '+49', label: 'DE (+49)' },
    { value: '+33', label: 'FR (+33)' },
    { value: '+91', label: 'IN (+91)' },
    { value: '+86', label: 'CN (+86)' },
    { value: '+81', label: 'JP (+81)' },
    { value: '+971', label: 'AE (+971)' },
]

const sampleOrders: ShippingInfo[] = [
    {
        from: { name: 'Pryysm Inc.', company: 'Pryysm', line1: '123 Maker Lane', hasLine2: true, line2: 'Suite 100', city: 'Innovation City', state: 'TX', zip: '75001', country: 'US', phone: { prefix: '+1', number: '555-123-4567' } },
        to: { name: 'John Smith', company: '', line1: '456 Customer Ave', hasLine2: false, line2: '', city: 'Techville', state: 'CA', zip: '90210', country: 'US', phone: { prefix: '+1', number: '555-987-6543' } },
        orderId: 'ORD-001',
        barcode: 'PV0123456789US',
        itemNumber: 'ITEM-84321',
        packageDetails: { trackingNumber: '1Z9999W99999999999', weight: '2.5', weightUnit: 'kg', length: '30', width: '20', height: '10', dimensionUnit: 'cm', contents: '3D Printed Parts' }
    },
    {
        from: { name: 'Pryysm Inc.', company: 'Pryysm', line1: '123 Maker Lane', hasLine2: true, line2: 'Suite 100', city: 'Innovation City', state: 'TX', zip: '75001', country: 'US', phone: { prefix: '+1', number: '555-123-4567' } },
        to: { name: 'Sarah Johnson', company: 'Design Co.', line1: '789 Prototype Rd', hasLine2: false, line2: '', city: 'Design District', state: 'FL', zip: '33137', country: 'US', phone: { prefix: '+1', number: '555-555-5555' } },
        orderId: 'ORD-002',
        barcode: 'PV9876543210US',
        itemNumber: 'ITEM-19876',
        packageDetails: { trackingNumber: '1Z9999W88888888888', weight: '1.2', weightUnit: 'kg', length: '25', width: '15', height: '8', dimensionUnit: 'cm', contents: 'Custom Prototype' }
    },
    {
        from: { name: 'Pryysm Inc.', company: 'Pryysm', line1: '123 Maker Lane', hasLine2: true, line2: 'Suite 100', city: 'Innovation City', state: 'TX', zip: '75001', country: 'US', phone: { prefix: '+1', number: '555-123-4567' } },
        to: { name: 'Mike Williams', company: '', line1: '101 Component Blvd', hasLine2: true, line2: 'Apt 5B', city: 'Engineering Hub', state: 'MA', zip: '02139', country: 'US', phone: { prefix: '+1', number: '555-111-2222' } },
        orderId: 'ORD-003',
        barcode: 'PV5432109876US',
        itemNumber: 'ITEM-55432',
        packageDetails: { trackingNumber: '1Z9999W77777777777', weight: '5', weightUnit: 'lb', length: '12', width: '10', height: '6', dimensionUnit: 'in', contents: 'Replacement Parts' }
    }
];

const getBlankShippingInfo = (): ShippingInfo => ({
    from: { name: 'Pryysm Inc.', company: 'Pryysm', line1: '123 Maker Lane', hasLine2: true, line2: 'Suite 100', city: 'Innovation City', state: 'TX', zip: '75001', country: 'US', phone: { prefix: '+1', number: '555-123-4567' } },
    to: { name: '', company: '', line1: '', hasLine2: false, line2: '', city: '', state: '', zip: '', country: 'US', phone: { prefix: '+1', number: '' } },
    orderId: `CUST-${Date.now()}`,
    barcode: 'N/A',
    itemNumber: 'N/A',
    packageDetails: { trackingNumber: '', weight: '', weightUnit: 'kg', length: '', width: '', height: '', dimensionUnit: 'cm', contents: '' }
});


export function OrderDispatchClient() {
    const { shippingLogs, addShippingLog } = useWorkspace();
    const { toast } = useToast();

    const [mode, setMode] = useState<'list' | 'custom'>('list');
    const [selectedOrderId, setSelectedOrderId] = useState<string>(sampleOrders[0].orderId);
    const [editableInfo, setEditableInfo] = useState<ShippingInfo>(() => JSON.parse(JSON.stringify(sampleOrders[0])));
    const [previewInfo, setPreviewInfo] = useState<ShippingInfo | null>(null);

    useEffect(() => {
        if (mode === 'list') {
            const order = sampleOrders.find(o => o.orderId === selectedOrderId) || sampleOrders[0];
            setEditableInfo(JSON.parse(JSON.stringify(order)));
        } else {
            setEditableInfo(getBlankShippingInfo());
        }
    }, [selectedOrderId, mode]);


    const handleInputChange = (section: 'from' | 'to' | 'packageDetails', field: string, value: any) => {
        setEditableInfo(prev => {
            const newInfo = JSON.parse(JSON.stringify(prev));
            (newInfo[section] as any)[field] = value;
            return newInfo;
        });
    }
    
    const handlePhoneChange = (section: 'from' | 'to', field: 'prefix' | 'number', value: string) => {
        setEditableInfo(prev => {
            const newInfo = JSON.parse(JSON.stringify(prev));
            (newInfo[section] as any).phone[field] = value;
            return newInfo;
        });
    }

    const handleSaveAndPrint = () => {
        addShippingLog(editableInfo);
        toast({ title: "Label Logged", description: "The shipping label has been saved to the log." });
        window.print();
    }

    return (
        <>
            <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <PackageCheck className="text-primary h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Order Dispatch</h1>
                            <p className="text-sm text-muted-foreground">Generate and print shipping labels</p>
                        </div>
                    </div>
                    <Button onClick={handleSaveAndPrint}>
                        <Printer className="mr-2" />
                        Save & Print Label
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Select Order</CardTitle>
                                <CardDescription>Choose an order or create a custom label.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs value={mode} onValueChange={(value) => setMode(value as 'list' | 'custom')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="list">From List</TabsTrigger>
                                        <TabsTrigger value="custom">Custom</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="list" className="pt-4">
                                        <div>
                                            <Label htmlFor="order-select">Order ID</Label>
                                            <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                                                <SelectTrigger id="order-select">
                                                    <SelectValue placeholder="Select an order" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sampleOrders.map(order => (
                                                        <SelectItem key={order.orderId} value={order.orderId}>
                                                            {order.orderId} - {order.to.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="custom" className="pt-4">
                                        <p className="text-sm text-muted-foreground">Enter the shipping details manually below.</p>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Edit Forms */}
                        <Accordion type="multiple" defaultValue={['recipient', 'package']} className="w-full">
                            <Card>
                                <AccordionItem value="sender" className="border-b-0">
                                    <AccordionTrigger className="p-6">
                                        <CardTitle>Sender Information</CardTitle>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 px-6 pb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Name</Label><Input value={editableInfo.from.name} onChange={e => handleInputChange('from', 'name', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Company</Label><Input value={editableInfo.from.company} onChange={e => handleInputChange('from', 'company', e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-2"><Label>Address Line 1</Label><Input value={editableInfo.from.line1} onChange={e => handleInputChange('from', 'line1', e.target.value)} /></div>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Switch id="sender-line2-toggle" checked={editableInfo.from.hasLine2} onCheckedChange={(checked) => handleInputChange('from', 'hasLine2', checked)} />
                                            <Label htmlFor="sender-line2-toggle">Address Line 2</Label>
                                        </div>
                                        {editableInfo.from.hasLine2 && <div className="space-y-2"><Input value={editableInfo.from.line2} onChange={e => handleInputChange('from', 'line2', e.target.value)} /></div>}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>City</Label><Input value={editableInfo.from.city} onChange={e => handleInputChange('from', 'city', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>State</Label><Input value={editableInfo.from.state} onChange={e => handleInputChange('from', 'state', e.target.value)} /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>PIN/ZIP code</Label><Input value={editableInfo.from.zip} onChange={e => handleInputChange('from', 'zip', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Country</Label>
                                                <Select value={editableInfo.from.country} onValueChange={v => handleInputChange('from', 'country', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>{countryList.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2"><Label>Phone</Label>
                                            <div className="flex gap-2">
                                                <Select value={editableInfo.from.phone.prefix} onValueChange={v => handlePhoneChange('from', 'prefix', v)}>
                                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{phonePrefixes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input value={editableInfo.from.phone.number} onChange={e => handlePhoneChange('from', 'number', e.target.value)} />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                            <Card>
                                <AccordionItem value="recipient" className="border-b-0">
                                    <AccordionTrigger className="p-6">
                                        <CardTitle>Recipient Information</CardTitle>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 px-6 pb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Name</Label><Input value={editableInfo.to.name} onChange={e => handleInputChange('to', 'name', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Company</Label><Input value={editableInfo.to.company} onChange={e => handleInputChange('to', 'company', e.target.value)} /></div>
                                        </div>
                                        <div className="space-y-2"><Label>Address Line 1</Label><Input value={editableInfo.to.line1} onChange={e => handleInputChange('to', 'line1', e.target.value)} /></div>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Switch id="recipient-line2-toggle" checked={editableInfo.to.hasLine2} onCheckedChange={(checked) => handleInputChange('to', 'hasLine2', checked)} />
                                            <Label htmlFor="recipient-line2-toggle">Address Line 2</Label>
                                        </div>
                                        {editableInfo.to.hasLine2 && <div className="space-y-2"><Input value={editableInfo.to.line2} onChange={e => handleInputChange('to', 'line2', e.target.value)} /></div>}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>City</Label><Input value={editableInfo.to.city} onChange={e => handleInputChange('to', 'city', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>State</Label><Input value={editableInfo.to.state} onChange={e => handleInputChange('to', 'state', e.target.value)} /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>PIN/ZIP code</Label><Input value={editableInfo.to.zip} onChange={e => handleInputChange('to', 'zip', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Country</Label>
                                                <Select value={editableInfo.to.country} onValueChange={v => handleInputChange('to', 'country', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>{countryList.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2"><Label>Phone</Label>
                                            <div className="flex gap-2">
                                                <Select value={editableInfo.to.phone.prefix} onValueChange={v => handlePhoneChange('to', 'prefix', v)}>
                                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{phonePrefixes.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                                                </Select>
                                                <Input value={editableInfo.to.phone.number} onChange={e => handlePhoneChange('to', 'number', e.target.value)} />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                            <Card>
                            <AccordionItem value="package" className="border-b-0">
                                    <AccordionTrigger className="p-6">
                                        <CardTitle>Package Details</CardTitle>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 px-6 pb-6">
                                        <div className="space-y-2"><Label>Tracking #</Label><Input value={editableInfo.packageDetails.trackingNumber} onChange={e => handleInputChange('packageDetails', 'trackingNumber', e.target.value)} /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Weight</Label><Input value={editableInfo.packageDetails.weight} onChange={e => handleInputChange('packageDetails', 'weight', e.target.value)} /></div>
                                            <div className="space-y-2"><Label>Unit</Label>
                                                <Select value={editableInfo.packageDetails.weightUnit} onValueChange={v => handleInputChange('packageDetails', 'weightUnit', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lb">lb</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Box Dimensions (LxWxH)</Label>
                                            <div className="grid grid-cols-3 gap-2 mt-1">
                                                <Input placeholder="L" value={editableInfo.packageDetails.length} onChange={e => handleInputChange('packageDetails', 'length', e.target.value)} />
                                                <Input placeholder="W" value={editableInfo.packageDetails.width} onChange={e => handleInputChange('packageDetails', 'width', e.target.value)} />
                                                <div className="flex gap-2">
                                                    <Input placeholder="H" value={editableInfo.packageDetails.height} onChange={e => handleInputChange('packageDetails', 'height', e.target.value)} />
                                                    <Select value={editableInfo.packageDetails.dimensionUnit} onValueChange={v => handleInputChange('packageDetails', 'dimensionUnit', v)}>
                                                        <SelectTrigger className="min-w-[60px]"><SelectValue /></SelectTrigger>
                                                        <SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="in">in</SelectItem></SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2"><Label>Contents</Label><Input value={editableInfo.packageDetails.contents} onChange={e => handleInputChange('packageDetails', 'contents', e.target.value)} /></div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                        </Accordion>
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Label Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center p-4 md:p-6 lg:p-8 bg-muted/50 rounded-lg">
                            <div className="@container">
                                    <ShippingLabel info={editableInfo} />
                            </div>
                            </CardContent>
                        </Card>

                        <div className="mt-8">
                            <ShippingLog logs={shippingLogs} onPreview={setPreviewInfo} />
                        </div>
                    </div>
                </div>
                
                <style jsx global>{`
                    @media print {
                        body > *:not(.printable-label) {
                            display: none;
                        }
                        .printable-label {
                            display: block;
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                    }
                `}</style>
            </div>

            <ShippingLabelPreviewModal 
                info={previewInfo}
                onClose={() => setPreviewInfo(null)}
            />
        </>
    )
}
