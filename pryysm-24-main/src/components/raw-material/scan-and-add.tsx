
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
  DialogFooter
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
import { useWorkspace, type MaterialTypeDefinition } from '@/hooks/use-workspace';
import jsQR from 'jsqr';
import { QrCode, VideoOff, Layers3, Droplet, Sparkles, Upload, Camera } from 'lucide-react';
import { currencySymbols } from './raw-material-client';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CameraCaptureModal } from '../shared/camera-capture-modal';

const materialTypeSchema = z.object({
  barcode: z.string().min(1, "Barcode is required."),
  type: z.enum(['spool', 'resin', 'powder']),
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  material: z.string().min(1, "Material/Type is required"),
  color: z.string().optional(),
  finish: z.string().optional(),
  weight: z.coerce.number().optional(),
  volume: z.coerce.number().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  currency: z.enum(['USD', 'EUR', 'AED', 'INR']),
  minStock: z.coerce.number().min(0, "Min stock can't be negative."),
  minOrder: z.coerce.number().min(1, "Min order must be at least 1."),
  imageUrl: z.string().optional(),
});

const addStockSchema = z.object({
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

interface ScanAndAddProps {
    materialType: 'spool' | 'resin' | 'powder';
    onSpoolSave: (data: any, count: number) => void;
    onResinSave: (data: any, count: number) => void;
    onPowderSave: (data: any, count: number) => void;
}


export function ScanAndAdd({ materialType, onSpoolSave, onResinSave, onPowderSave }: ScanAndAddProps) {
    const { toast } = useToast();
    const { materialMasterList, addMaterialToMasterList } = useWorkspace();

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const [activeMaterial, setActiveMaterial] = useState<MaterialTypeDefinition | null>(null);
    const [view, setView] = useState<'scan' | 'add' | 'new'>('scan');

    const newMaterialForm = useForm<z.infer<typeof materialTypeSchema>>({
        resolver: zodResolver(materialTypeSchema),
        defaultValues: { type: materialType, currency: 'USD', minStock: 2, minOrder: 5 }
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
                newMaterialForm.setValue('imageUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCapture = (imageDataUrl: string) => {
        newMaterialForm.setValue('imageUrl', imageDataUrl);
        setIsCameraModalOpen(false);
    };

    useEffect(() => {
        if (scannedCode) {
            const existingMaterial = materialMasterList.find(m => m.barcode === scannedCode);
            if (existingMaterial) {
                if (existingMaterial.type !== materialType) {
                    toast({
                        variant: 'destructive',
                        title: 'Wrong Material Type',
                        description: `Scanned item is a ${existingMaterial.type}, but you are in the ${materialType} tab.`,
                    });
                    setScannedCode(null);
                    return;
                }
                setActiveMaterial(existingMaterial);
                setView('add');
            } else {
                newMaterialForm.reset({ barcode: scannedCode, type: materialType, currency: 'USD', name:'', brand:'', material:'', color:'', finish:'', weight:1000, volume:1000, price:25, minStock: 2, minOrder: 5, imageUrl: '' });
                setView('new');
            }
        } else {
            setView('scan');
            setActiveMaterial(null);
        }
    }, [scannedCode, materialMasterList, newMaterialForm, materialType, toast]);

    const handleScanSuccess = (code: string) => {
        setIsScannerOpen(false);
        setScannedCode(code);
    };
    
    const handleAddNewMaterialType = (data: z.infer<typeof materialTypeSchema>) => {
        addMaterialToMasterList(data);
        setActiveMaterial(data);
        setView('add');
        toast({ title: "New Material Type Saved", description: `${data.name} has been added to your master list.` });
    };
    
    const handleAddStock = (data: z.infer<typeof addStockSchema>) => {
        if (!activeMaterial) return;
        
        const saveData: any = {
            name: activeMaterial.name,
            brand: activeMaterial.brand,
            color: activeMaterial.color,
            price: activeMaterial.price,
            currency: activeMaterial.currency,
            purchaseDate: new Date().toISOString().split('T')[0],
            used: 0,
            minStock: activeMaterial.minStock,
            minOrder: activeMaterial.minOrder,
            imageUrl: activeMaterial.imageUrl,
        };

        if(activeMaterial.type === 'spool') {
            saveData.material = activeMaterial.material;
            saveData.finish = activeMaterial.finish;
            saveData.weight = activeMaterial.weight;
            onSpoolSave(saveData, data.quantity);
        } else if (activeMaterial.type === 'resin') {
            saveData.type = activeMaterial.material;
            saveData.volume = activeMaterial.volume;
            onResinSave(saveData, data.quantity);
        } else if (activeMaterial.type === 'powder') {
            saveData.material = activeMaterial.material;
            saveData.weight = activeMaterial.weight;
            onPowderSave(saveData, data.quantity);
        }
        
        toast({ title: 'Inventory Updated', description: `${data.quantity} unit(s) of ${activeMaterial.name} added.`});
        setScannedCode(null);
    };

    return (
        <div>
            <Button onClick={() => setIsScannerOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" /> Scan to Add
            </Button>

            <Dialog open={!!scannedCode} onOpenChange={(open) => !open && setScannedCode(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Scanned Stock</DialogTitle>
                        <DialogDescription>
                            {view === 'add' && `Adding stock for known item: ${activeMaterial?.name}.`}
                            {view === 'new' && `This is a new barcode. Please define the material type.`}
                        </DialogDescription>
                    </DialogHeader>
                     {view === 'add' && activeMaterial && (
                        <div className="space-y-4">
                            <form onSubmit={addStockForm.handleSubmit(handleAddStock)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity to Add</Label>
                                    <Input id="quantity" type="number" {...addStockForm.register('quantity')} />
                                    {addStockForm.formState.errors.quantity && <p className="text-sm text-destructive">{addStockForm.formState.errors.quantity.message}</p>}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setScannedCode(null)}>Cancel</Button>
                                    <Button type="submit">Add to Inventory</Button>
                                </DialogFooter>
                            </form>
                        </div>
                    )}
                    
                    {view === 'new' && (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                            <form onSubmit={newMaterialForm.handleSubmit(handleAddNewMaterialType)} className="space-y-4">
                                <Input type="hidden" {...newMaterialForm.register('barcode')} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Name</Label><Input {...newMaterialForm.register('name')} placeholder="e.g., PLA+ Black" /></div>
                                    <div className="space-y-2"><Label>Brand</Label><Input {...newMaterialForm.register('brand')} placeholder="e.g., eSun" /></div>
                                </div>
                                <div className="space-y-2"><Label>Material / Type</Label><Input {...newMaterialForm.register('material')} placeholder="e.g., PLA for spools, Standard for resins" /></div>
                                
                                <div className="space-y-2">
                                    <Label>Image</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                                            {newMaterialForm.watch('imageUrl') ? <Image src={newMaterialForm.watch('imageUrl')!} alt="Preview" width={96} height={96} className="object-cover rounded-md" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Input id="image-upload-scan" type="file" className="hidden" onChange={handleImageUpload} />
                                            <label htmlFor="image-upload-scan" className={cn(buttonVariants({ variant: 'outline' }), "cursor-pointer")}><Upload className="mr-2 h-4 w-4" /> Upload</label>
                                            <Button type="button" variant="outline" onClick={() => setIsCameraModalOpen(true)}><Camera className="mr-2 h-4 w-4"/> Camera</Button>
                                        </div>
                                    </div>
                                </div>

                                {materialType === 'spool' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Color</Label><Input type="color" {...newMaterialForm.register('color')} /></div>
                                        <div className="space-y-2"><Label>Finish</Label><Input {...newMaterialForm.register('finish')} placeholder="e.g., Matte" /></div>
                                        <div className="space-y-2"><Label>Weight (g)</Label><Input type="number" {...newMaterialForm.register('weight')} placeholder="1000" /></div>
                                    </div>
                                )}
                                {materialType === 'resin' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Color</Label><Input type="color" {...newMaterialForm.register('color')} /></div>
                                        <div className="space-y-2"><Label>Volume (ml)</Label><Input type="number" {...newMaterialForm.register('volume')} placeholder="1000" /></div>
                                    </div>
                                )}
                                {materialType === 'powder' && (
                                    <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" step="0.1" {...newMaterialForm.register('weight')} placeholder="10" /></div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" {...newMaterialForm.register('price')} /></div>
                                    <div className="space-y-2"><Label>Currency</Label>
                                         <Controller name="currency" control={newMaterialForm.control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>{Object.entries(currencySymbols).map(([code, symbol]) => <SelectItem key={code} value={code}>{symbol} ({code})</SelectItem>)}</SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Min Stock</Label><Input type="number" {...newMaterialForm.register('minStock')} /></div>
                                    <div className="space-y-2"><Label>Min Order Qty</Label><Input type="number" {...newMaterialForm.register('minOrder')} /></div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setScannedCode(null)}>Cancel</Button>
                                    <Button type="submit">Save & Add Stock</Button>
                                </DialogFooter>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
        </div>
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
                    <DialogDescription>Point your camera at the code on the material.</DialogDescription>
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

    