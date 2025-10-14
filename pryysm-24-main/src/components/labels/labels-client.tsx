
"use client";

import React, { useState, useRef, useMemo, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/hooks/use-workspace';
import { useToast } from '@/hooks/use-toast';
import { Tags, QrCode, Archive, Layers3, Droplet, Sparkles, FileDown, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectLabel } from './project-label';
import { PrinterLabel } from '../printer-labels/printer-label';
import { RawMaterialLabel } from '../raw-material-labels/raw-material-label';
import { InventoryLabel } from '../inventory-labels/inventory-label';
import type { Order } from '@/components/orders/orders-client';
import type { Printer as PrinterType, Spool, Resin, Powder, InventoryItem } from '@/hooks/use-workspace';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type MaterialItem = (Spool | Resin | Powder) & { itemType: 'spool' | 'resin' | 'powder' };

export function LabelsClient() {
    const { orders, customers, printers, schedule, spools, resins, powders, inventory } = useWorkspace();
    const { toast } = useToast();

    // State for Project Labels
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // State for Printer Labels
    const [selectedPrinters, setSelectedPrinters] = useState<string[]>([]);

    // State for Raw Material Labels
    const [selectedRawMaterials, setSelectedRawMaterials] = useState<string[]>([]);

    // State for Inventory Labels
    const [selectedInventoryItems, setSelectedInventoryItems] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const labelContainerRef = useRef<HTMLDivElement>(null);
    
    // --- Project Label Logic ---
    const handleProjectLabelDownload = async () => {
        if (!selectedOrder) {
            toast({ variant: 'destructive', title: 'No Order Selected' });
            return;
        }
        await generateGridPdf(
            'project',
            `project-labels-${selectedOrder.orderNumber}.pdf`,
            'project'
        );
    };

    // --- Printer Label Logic ---
    const isAllPrintersSelected = printers.length > 0 && selectedPrinters.length === printers.length;
    const handlePrinterSelect = (printerId: string, checked: boolean) => {
        setSelectedPrinters(prev => checked ? [...prev, printerId] : prev.filter(id => id !== printerId));
    };
    const handleSelectAllPrinters = (checked: boolean) => {
        setSelectedPrinters(checked ? printers.map(p => p.id) : []);
    };
    const handlePrinterLabelDownload = async () => {
        if (selectedPrinters.length === 0) {
            toast({ variant: 'destructive', title: 'No Printers Selected' });
            return;
        }
        await generateGridPdf(
            'printer',
            'printer-labels.pdf',
            'printers'
        );
    };

    // --- Raw Material Label Logic ---
    const allRawMaterials = useMemo((): MaterialItem[] => [
        ...spools.map(s => ({ ...s, itemType: 'spool' as const })),
        ...resins.map(r => ({ ...r, itemType: 'resin' as const })),
        ...powders.map(p => ({ ...p, itemType: 'powder' as const })),
    ], [spools, resins, powders]);
    
    const handleRawMaterialSelect = (itemId: string, checked: boolean) => {
        setSelectedRawMaterials(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
    };
    const handleSelectAllRawMaterials = (items: MaterialItem[], checked: boolean) => {
        const itemIds = items.map(i => `${i.itemType}-${i.id}`);
        if (checked) {
            setSelectedRawMaterials(prev => [...new Set([...prev, ...itemIds])]);
        } else {
            setSelectedRawMaterials(prev => prev.filter(id => !itemIds.includes(id)));
        }
    };
    const handleRawMaterialLabelDownload = async () => {
        if (selectedRawMaterials.length === 0) {
            toast({ variant: 'destructive', title: 'No Materials Selected' });
            return;
        }
         await generateGridPdf(
            'raw-material',
            'raw-material-labels.pdf',
            'raw materials'
        );
    };

    // --- Inventory Label Logic ---
    const isAllInventorySelected = inventory.length > 0 && selectedInventoryItems.length === inventory.length;
    const handleInventoryItemSelect = (itemId: string, checked: boolean) => {
        setSelectedInventoryItems(prev => checked ? [...prev, itemId] : prev.filter(id => id !== itemId));
    };
    const handleSelectAllInventory = (checked: boolean) => {
        setSelectedInventoryItems(checked ? inventory.map(i => i.id) : []);
    };
    const handleInventoryLabelDownload = async () => {
        if (selectedInventoryItems.length === 0) {
            toast({ variant: 'destructive', title: 'No Items Selected' });
            return;
        }
         await generateGridPdf(
            'inventory',
            'inventory-labels.pdf',
            'inventory items'
        );
    };

    // --- Generic Grid PDF Generator ---
    const generateGridPdf = async (labelType: string, filename: string, itemTypeName: string) => {
        setIsLoading(true);
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const labelWidthMM = 60;
        const labelHeightMM = 30;
        const pageMarginX = 10;
        const pageMarginY = 10;
        const pageWidth = 210;
        const pageHeight = 297;
        const gapX = 3;
        const gapY = 3;
        const labelsPerRow = Math.floor((pageWidth - (pageMarginX * 2) + gapX) / (labelWidthMM + gapX));
        const labelsPerCol = Math.floor((pageHeight - (pageMarginY * 2) + gapY) / (labelHeightMM + gapY));
        const labelsPerPage = labelsPerRow * labelsPerCol;
        
        const labelElements = Array.from(labelContainerRef.current?.querySelectorAll(`[data-label-type="${labelType}"]`) || []);

        for (let i = 0; i < labelElements.length; i++) {
            const element = labelElements[i] as HTMLElement;
            const pageIndex = Math.floor(i / labelsPerPage);
            if (i > 0 && i % labelsPerPage === 0) doc.addPage();
            doc.setPage(pageIndex + 1);

            const itemOnPage = i % labelsPerPage;
            const colIndex = itemOnPage % labelsPerRow;
            const rowIndex = Math.floor(itemOnPage / labelsPerRow);
            const x = pageMarginX + colIndex * (labelWidthMM + gapX);
            const y = pageMarginY + rowIndex * (labelHeightMM + gapY);
            
            try {
                const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', x, y, labelWidthMM, labelHeightMM);
            } catch (error) {
                console.error(`Error generating canvas for ${labelType} label:`, error);
                toast({ variant: "destructive", title: "PDF Generation Error", description: "Could not process an image for the PDF. Please try again." });
                setIsLoading(false);
                return;
            }
        }
        
        doc.save(filename);
        setIsLoading(false);
        toast({ title: "PDF Generated", description: `Your ${itemTypeName} label PDF has been downloaded.` });
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Tags className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Label Generation</h1>
                        <p className="text-sm text-muted-foreground">Generate and print tracking labels for projects, printers, and materials.</p>
                    </div>
                </div>
            </header>
            
            <Tabs defaultValue="project">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="project">Project Labels</TabsTrigger>
                    <TabsTrigger value="printer">Printer Labels</TabsTrigger>
                    <TabsTrigger value="raw_material">Raw Material Labels</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Labels</TabsTrigger>
                </TabsList>

                {/* Project Labels Tab */}
                <TabsContent value="project">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Label Configuration</CardTitle>
                                    <CardDescription>Select an order to generate its tracking labels.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="order-select">Select Order</Label>
                                        <Select onValueChange={(value) => setSelectedOrder(orders.find(o => o.id.toString() === value) || null)}>
                                            <SelectTrigger id="order-select"><SelectValue placeholder="Choose an order..." /></SelectTrigger>
                                            <SelectContent>{orders.map(order => (<SelectItem key={order.id} value={order.id.toString()}>{order.orderNumber} - {order.customer}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleProjectLabelDownload} disabled={!selectedOrder || isLoading} className="w-full">
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                        Download Project Labels PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                            <LabelPreviewContainer title="Project Label Previews" description={selectedOrder ? `Showing ${selectedOrder.items} label(s) for order ${selectedOrder.orderNumber}.` : 'Select an order to see previews.'}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={labelContainerRef}>
                                    {selectedOrder ? (
                                        Array.from({ length: selectedOrder.items }).map((_, index) => (
                                            <div data-label-type="project" key={`preview-${selectedOrder.id}-${index}`}>
                                                <ProjectLabel order={selectedOrder} currentItem={index + 1} totalItems={selectedOrder.items} />
                                            </div>
                                        ))
                                    ) : ( <NoSelectionPlaceholder text="Select an order to see its label previews."/> )}
                                </div>
                            </LabelPreviewContainer>
                        </div>
                    </div>
                </TabsContent>
                
                 {/* Printer Labels Tab */}
                <TabsContent value="printer">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
                        <div className="lg:col-span-1">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Printer Label Configuration</CardTitle>
                                    <CardDescription>Select printers to generate labels for.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="border rounded-md max-h-96 overflow-y-auto">
                                        <div className="flex items-center p-4 border-b sticky top-0 bg-background z-10">
                                            <Checkbox id="select-all-printers" checked={isAllPrintersSelected} onCheckedChange={(c) => handleSelectAllPrinters(Boolean(c))} />
                                            <label htmlFor="select-all-printers" className="ml-3 text-sm font-medium leading-none">Select All Printers</label>
                                        </div>
                                        {printers.map((printer) => (
                                            <div key={printer.id} className="flex items-center p-4 border-b last:border-b-0">
                                                <Checkbox id={`printer-${printer.id}`} checked={selectedPrinters.includes(printer.id)} onCheckedChange={(c) => handlePrinterSelect(printer.id, !!c)} />
                                                <div className="ml-3"><label htmlFor={`printer-${printer.id}`} className="text-sm font-medium">{printer.name}</label><p className="text-xs text-muted-foreground">{printer.location} - {printer.technology}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={handlePrinterLabelDownload} disabled={selectedPrinters.length === 0 || isLoading} className="w-full">
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                        Download Printer Labels PDF ({selectedPrinters.length})
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                             <LabelPreviewContainer title="Printer Label Previews" description={`Showing previews for ${selectedPrinters.length} selected printer(s).`}>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={labelContainerRef}>
                                    {printers.filter(p => selectedPrinters.includes(p.id)).map(printer => (
                                         <div data-label-type="printer" key={printer.id}><PrinterLabel printer={printer} /></div>
                                    ))}
                                    {selectedPrinters.length === 0 && <NoSelectionPlaceholder text="Select one or more printers to preview their labels." />}
                                 </div>
                             </LabelPreviewContainer>
                        </div>
                    </div>
                </TabsContent>

                 {/* Raw Material Labels Tab */}
                <TabsContent value="raw_material">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
                        <div className="lg:col-span-1">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Raw Material Label Configuration</CardTitle>
                                    <CardDescription>Select materials to generate labels for.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <Accordion type="multiple" defaultValue={['spools']} className="w-full">
                                        <RawMaterialList type="spool" title="Filaments" items={allRawMaterials.filter(m => m.itemType === 'spool')} onSelectAll={handleSelectAllRawMaterials} onSelectItem={handleRawMaterialSelect} selectedItems={selectedRawMaterials} />
                                        <RawMaterialList type="resin" title="Resins" items={allRawMaterials.filter(m => m.itemType === 'resin')} onSelectAll={handleSelectAllRawMaterials} onSelectItem={handleRawMaterialSelect} selectedItems={selectedRawMaterials} />
                                        <RawMaterialList type="powder" title="Powders" items={allRawMaterials.filter(m => m.itemType === 'powder')} onSelectAll={handleSelectAllRawMaterials} onSelectItem={handleRawMaterialSelect} selectedItems={selectedRawMaterials} />
                                    </Accordion>
                                    <Button onClick={handleRawMaterialLabelDownload} disabled={selectedRawMaterials.length === 0 || isLoading} className="w-full">
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                        Download Material Labels PDF ({selectedRawMaterials.length})
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                             <LabelPreviewContainer title="Raw Material Label Previews" description={`Showing previews for ${selectedRawMaterials.length} selected item(s).`}>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={labelContainerRef}>
                                    {allRawMaterials.filter(item => selectedRawMaterials.includes(`${item.itemType}-${item.id}`)).map((item, index) => (
                                        <div data-label-type="raw-material" key={`${item.itemType}-${item.id}`}>
                                            <RawMaterialLabel item={item} currentItem={index+1} totalItems={selectedRawMaterials.length} />
                                        </div>
                                    ))}
                                    {selectedRawMaterials.length === 0 && <NoSelectionPlaceholder text="Select one or more raw materials to preview their labels." />}
                                 </div>
                             </LabelPreviewContainer>
                        </div>
                    </div>
                </TabsContent>

                 {/* Inventory Labels Tab */}
                <TabsContent value="inventory">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
                        <div className="lg:col-span-1">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Label Configuration</CardTitle>
                                    <CardDescription>Select items to generate labels for.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="border rounded-md max-h-96 overflow-y-auto">
                                        <div className="flex items-center p-4 border-b sticky top-0 bg-background z-10">
                                            <Checkbox id="select-all-inventory" checked={isAllInventorySelected} onCheckedChange={(c) => handleSelectAllInventory(Boolean(c))} />
                                            <label htmlFor="select-all-inventory" className="ml-3 text-sm font-medium leading-none">Select All Inventory</label>
                                        </div>
                                        {inventory.map((item) => (
                                            <div key={item.id} className="flex items-center p-4 border-b last:border-b-0">
                                                <Checkbox id={`item-${item.id}`} checked={selectedInventoryItems.includes(item.id)} onCheckedChange={(c) => handleInventoryItemSelect(item.id, !!c)} />
                                                <div className="ml-3"><label htmlFor={`item-${item.id}`} className="text-sm font-medium">{item.name}</label><p className="text-xs text-muted-foreground">{item.barcode}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button onClick={handleInventoryLabelDownload} disabled={selectedInventoryItems.length === 0 || isLoading} className="w-full">
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                                        Download Inventory Labels PDF ({selectedInventoryItems.length})
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                             <LabelPreviewContainer title="Inventory Label Previews" description={`Showing previews for ${selectedInventoryItems.length} selected item(s).`}>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" ref={labelContainerRef}>
                                    {inventory.filter(p => selectedInventoryItems.includes(p.id)).map(item => (
                                         <div data-label-type="inventory" key={item.id}><InventoryLabel item={item} /></div>
                                    ))}
                                    {selectedInventoryItems.length === 0 && <NoSelectionPlaceholder text="Select one or more inventory items to preview their labels." />}
                                 </div>
                             </LabelPreviewContainer>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const LabelPreviewContainer = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 bg-muted/50 rounded-lg min-h-[200px]">
            {children}
        </CardContent>
    </Card>
);

const NoSelectionPlaceholder = ({ text }: { text: string }) => (
    <div className="col-span-full text-center text-muted-foreground flex items-center justify-center h-full min-h-[150px]">
        <p>{text}</p>
    </div>
);

const RawMaterialList = ({ type, title, items, onSelectAll, onSelectItem, selectedItems }: {type: string, title: string, items: MaterialItem[], onSelectAll: (items: MaterialItem[], checked: boolean) => void, onSelectItem: (itemId: string, checked: boolean) => void, selectedItems: string[]}) => {
    const isAllTypeSelected = items.length > 0 && items.every(item => selectedItems.includes(`${item.itemType}-${item.id}`));
    const Icon = type === 'spool' ? Layers3 : type === 'resin' ? Droplet : Sparkles;

    return (
        <AccordionItem value={type}>
            <AccordionTrigger><div className="flex items-center gap-2"><Icon className="h-4 w-4" /> {title} ({items.length})</div></AccordionTrigger>
            <AccordionContent>
                <div className="border rounded-md max-h-60 overflow-y-auto">
                    <div className="flex items-center p-2 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                        <Checkbox id={`select-all-${type}`} checked={isAllTypeSelected} onCheckedChange={(c) => onSelectAll(items, !!c)} />
                        <label htmlFor={`select-all-${type}`} className="ml-2 text-xs font-medium">Select All {title}</label>
                    </div>
                    {items.length > 0 ? items.map((item) => {
                        const itemId = `${item.itemType}-${item.id}`;
                        const displayId = (item as any).spoolId || (item as any).resinId || (item as any).powderId;
                        return (
                            <div key={itemId} className="flex items-center p-2 border-b last:border-b-0">
                                <Checkbox id={itemId} checked={selectedItems.includes(itemId)} onCheckedChange={(c) => onSelectItem(itemId, !!c)} />
                                <div className="ml-2"><label htmlFor={itemId} className="text-sm font-medium leading-none">{item.name}</label><p className="text-xs text-muted-foreground">ID: {displayId}</p></div>
                            </div>
                        )
                    }) : (<p className="text-xs text-muted-foreground text-center p-4">No {type}s available.</p>)}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

    