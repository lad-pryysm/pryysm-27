
"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/use-workspace';
import type { InventoryItem, InventoryItemMaster } from '@/hooks/use-workspace';
import jsQR from 'jsqr';
import { QrCode, VideoOff, Camera, Upload } from 'lucide-react';
import { CameraCaptureModal } from '../shared/camera-capture-modal';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const newItemMasterSchema = z.object({
  barcode: z.string().min(1, "Barcode is required."),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(["Packing Material", "Electronics", "Tools", "Miscellaneous"]),
  minStock: z.coerce.number().min(0, "Min stock can't be negative."),
  minOrder: z.coerce.number().min(1, "Min order must be at least 1."),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
});

const addStockSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

interface ScanAndAddProps {
    onAddItem: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
}

export function ScanAndAdd({ onAddItem }: ScanAndAddProps) {
    const { toast } = useToast();
    const { inventoryMasterList, addInventoryItemToMasterList } = useWorkspace();

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<InventoryItemMaster | null>(null);
    const [view, setView] = useState<'scan' | 'add' | 'new'>('scan');

    const newMasterItemForm = useForm<z.infer<typeof newItemMasterSchema>>({
        resolver: zodResolver(newItemMasterSchema),
        defaultValues: {
            barcode: '', name: '', description: '', category: 'Miscellaneous',
            minStock: 10, minOrder: 20, location: '', imageUrl: ''
        }
    });

    const addStockForm = useForm<z.infer<typeof addStockSchema>>({
        resolver: zodResolver(addStockSchema),
        defaultValues: { quantity: 1 }
    });
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                newMasterItemForm.setValue('imageUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCapture = (imageDataUrl: string) => {
        newMasterItemForm.setValue('imageUrl', imageDataUrl);
        setIsCameraModalOpen(false);
    };


    useEffect(() => {
        if (scannedCode) {
            const existingItem = inventoryMasterList.find(m => m.barcode === scannedCode);
            if (existingItem) {
                setActiveItem(existingItem);
                setView('add');
            } else {
                newMasterItemForm.reset({
                    barcode: scannedCode, name: '', description: '', category: 'Miscellaneous',
                    minStock: 10, minOrder: 20, location: '', imageUrl: ''
                });
                setView('new');
            }
        } else {
            setView('scan');
            setActiveItem(null);
        }
    }, [scannedCode, inventoryMasterList, newMasterItemForm]);

    const handleScanSuccess = (code: string) => {
        setIsScannerOpen(false);
        setScannedCode(code);
    };
    
    const handleAddNewItemType = (data: z.infer<typeof newItemMasterSchema>) => {
        addInventoryItemToMasterList(data);
        setActiveItem(data);
        setView('add');
        toast({ title: "New Item Type Saved", description: `${data.name} has been added to your master list.` });
    };
    
    const handleAddStock = (data: z.infer<typeof addStockSchema>) => {
        if (!activeItem) return;
        
        onAddItem({
            ...activeItem,
            quantity: data.quantity
        });
        
        toast({ title: 'Inventory Updated', description: `${data.quantity} unit(s) of ${activeItem.name} added.`});
        setScannedCode(null);
        addStockForm.reset({ quantity: 1 });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Scan to Add Stock</CardTitle>
                <CardDescription>Use a barcode or QR code to quickly add new or existing items to your inventory.</CardDescription>
            </CardHeader>
            <CardContent>
                {view === 'scan' && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">Scan a barcode to quickly add stock.</p>
                        <Button onClick={() => setIsScannerOpen(true)}>
                            <QrCode className="mr-2" /> Start Scanner
                        </Button>
                    </div>
                )}

                {view === 'add' && activeItem && (
                    <div className="space-y-4">
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-base">{activeItem.name}</CardTitle>
                                <CardDescription>Category: {activeItem.category} | Barcode: {activeItem.barcode}</CardDescription>
                            </CardHeader>
                        </Card>
                        <form onSubmit={addStockForm.handleSubmit(handleAddStock)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity to Add</Label>
                                <Input id="quantity" type="number" {...addStockForm.register('quantity')} />
                                {addStockForm.formState.errors.quantity && <p className="text-sm text-destructive">{addStockForm.formState.errors.quantity.message}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setScannedCode(null)}>Cancel</Button>
                                <Button type="submit">Add to Inventory</Button>
                            </div>
                        </form>
                    </div>
                )}
                
                {view === 'new' && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">New Barcode Scanned: <span className="font-mono text-primary">{scannedCode}</span></h3>
                        <p className="text-sm text-muted-foreground">This barcode isn't in your master list. Please add its details below.</p>
                        <form onSubmit={newMasterItemForm.handleSubmit(handleAddNewItemType)} className="space-y-4">
                            <Input type="hidden" {...newMasterItemForm.register('barcode')} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Name</Label><Input {...newMasterItemForm.register('name')} placeholder="e.g., Packing Boxes (Small)" /></div>
                                <div className="space-y-2"><Label>Category</Label>
                                    <Controller name="category" control={newMasterItemForm.control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Packing Material">Packing Material</SelectItem>
                                                <SelectItem value="Electronics">Electronics</SelectItem>
                                                <SelectItem value="Tools">Tools</SelectItem>
                                                <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Item Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                                        {newMasterItemForm.watch('imageUrl') ? (
                                            <Image src={newMasterItemForm.watch('imageUrl')!} alt="Item Preview" width={96} height={96} className="object-cover rounded-md" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} />
                                        <label htmlFor="image-upload" className={cn(buttonVariants({ variant: 'outline' }), "cursor-pointer")}>
                                           <Upload className="mr-2 h-4 w-4" /> Upload Image
                                        </label>
                                         <Button type="button" variant="outline" onClick={() => setIsCameraModalOpen(true)}>
                                            <Camera className="mr-2 h-4 w-4"/> Use Camera
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Description</Label><Textarea {...newMasterItemForm.register('description')} placeholder="A brief description of the item" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Minimum Stock</Label><Input type="number" {...newMasterItemForm.register('minStock')} /></div>
                                <div className="space-y-2"><Label>Minimum Reorder Qty</Label><Input type="number" {...newMasterItemForm.register('minOrder')} /></div>
                            </div>
                            <div className="space-y-2"><Label>Storage Location</Label><Input {...newMasterItemForm.register('location')} placeholder="e.g., Shelf A-1" /></div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => setScannedCode(null)}>Cancel</Button>
                                <Button type="submit">Save New Item Type</Button>
                            </div>
                        </form>
                    </div>
                )}

                <ScannerModal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onScanSuccess={handleScanSuccess}
                />
                 <CameraCaptureModal
                    isOpen={isCameraModalOpen}
                    onClose={() => setIsCameraModalOpen(false)}
                    onCapture={handleCapture}
                />
            </CardContent>
        </Card>
    )
}

function ScannerModal({ isOpen, onClose, onScanSuccess }: { isOpen: boolean, onClose: () => void, onScanSuccess: (code: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean|null>(null);
    const { toast } = useToast();
    
    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        onScanSuccess(code.data);
                        return; // Stop scanning
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };
        
        const startScan = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    animationFrameId = requestAnimationFrame(tick);
                }
            } catch (err) {
                setHasPermission(false);
                toast({ variant: 'destructive', title: 'Camera access denied' });
            }
        };

        if (isOpen) {
            startScan();
        } else {
            stopCamera();
        }
        
        return () => {
            stopCamera();
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isOpen, onScanSuccess, stopCamera, toast]);


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Scan Barcode/QR Code</DialogTitle>
                    <DialogDescription>Point your camera at the code on the item.</DialogDescription>
                </DialogHeader>
                <div className="relative mt-4 aspect-video bg-black rounded-lg overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasPermission === false && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/70">
                            <VideoOff className="h-10 w-10 mb-2"/>
                            <p>Camera permission denied.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

    