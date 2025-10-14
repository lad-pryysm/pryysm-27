
"use client"

import React, { Dispatch, SetStateAction, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { FileUp, Cog, Zap, Clock, Wrench, Package, Plus, Trash2, DollarSign, Camera, Upload } from 'lucide-react';
import { CameraCaptureModal } from '../shared/camera-capture-modal';
import { Switch } from '../ui/switch';


export interface PackagingItem {
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface ExtraCostItem {
    name: string;
    baseAmount: number;
    percentage: number;
}

export interface CostInputsState {
    jobName: string;
    productImage: string;
    currency: 'USD' | 'EUR' | 'AED' | 'INR';
    printHours: number | string;
    printMinutes: number | string;
    filamentWeight: number | string;
    filamentType: 'pla' | 'abs' | 'petg' | 'tpu' | 'resin';
    spoolPrice: number | string;
    spoolWeight: number | string;
    wastage: number;
    printerPower: number | string;
    electricityCost: number | string;
    laborRate: number | string;
    designTime: number | string;
    setupTime: number | string;
    postProcessingTime: number | string;
    qcTime: number | string;
    printerCost: number | string;
    investmentReturn: number | string;
    dailyUsage: number;
    repairCostPercentage: number;
    packagingItems: PackagingItem[];
    extraCosts: ExtraCostItem[];
}

interface CostInputsProps {
    inputs: CostInputsState;
    setInputs: Dispatch<SetStateAction<CostInputsState>>;
}

export function CostInputs({ inputs, setInputs }: CostInputsProps) {
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    
    const handleNumericInputChange = (field: keyof CostInputsState, value: string) => {
        const numericValue = value === '' ? '' : Number(value);
        if (numericValue !== '' && isNaN(numericValue as number)) return;
        setInputs(prev => ({ ...prev, [field]: numericValue }));
    };
    
    const handleBlur = (field: keyof CostInputsState) => {
        if (inputs[field] === '') {
            setInputs(prev => ({ ...prev, [field]: 0 }));
        }
    }


    const handleInputChange = (field: keyof CostInputsState, value: any) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSliderChange = (field: keyof CostInputsState, value: number[]) => {
        setInputs(prev => ({ ...prev, [field]: value[0] }));
    };

    const handlePackagingChange = (index: number, field: keyof PackagingItem, value: any) => {
        const newItems = [...inputs.packagingItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setInputs(prev => ({ ...prev, packagingItems: newItems }));
    };

    const addPackagingItem = () => {
        setInputs(prev => ({
            ...prev,
            packagingItems: [...prev.packagingItems, { name: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const removePackagingItem = (index: number) => {
        setInputs(prev => ({
            ...prev,
            packagingItems: prev.packagingItems.filter((_, i) => i !== index)
        }));
    };

    const handleExtraCostChange = (index: number, field: keyof ExtraCostItem, value: any) => {
        const newItems = [...inputs.extraCosts];
        newItems[index] = { ...newItems[index], [field]: value };
        setInputs(prev => ({ ...prev, extraCosts: newItems }));
    };

    const addExtraCostItem = () => {
        setInputs(prev => ({
            ...prev,
            extraCosts: [...prev.extraCosts, { name: 'Royalty Fee', baseAmount: 100, percentage: 10 }]
        }));
    };

    const removeExtraCostItem = (index: number) => {
        setInputs(prev => ({
            ...prev,
            extraCosts: prev.extraCosts.filter((_, i) => i !== index)
        }));
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    handleInputChange('productImage', event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCapture = (imageDataUrl: string) => {
        handleInputChange('productImage', imageDataUrl);
        setIsCameraModalOpen(false);
    };


    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileUp className="text-primary"/> Print Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="jobName">Job Name</Label>
                    <Input id="jobName" placeholder="Enter job name" value={inputs.jobName} onChange={e => handleInputChange('jobName', e.target.value)} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="productImage">Product Image</Label>
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg gap-4">
                        {inputs.productImage ? (
                            <img src={inputs.productImage} alt="Product Preview" className="h-40 w-40 object-cover rounded-lg" />
                        ) : (
                             <div className="h-40 w-40 bg-muted rounded-lg flex items-center justify-center">
                                <FileUp className="h-12 w-12 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input id="productImage" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <Button asChild variant="outline">
                                <label htmlFor="productImage" className="cursor-pointer flex items-center gap-2">
                                    <Upload className="h-4 w-4"/> Upload Image
                                </label>
                            </Button>
                             <Button type="button" variant="outline" onClick={() => setIsCameraModalOpen(true)}>
                                <Camera className="mr-2 h-4 w-4"/> Use Camera
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="currency">Select Currency</Label>
                    <Select value={inputs.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                        <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">$ (USD)</SelectItem>
                            <SelectItem value="AED">AED (Dirham)</SelectItem>
                            <SelectItem value="INR">₹ (INR)</SelectItem>
                            <SelectItem value="EUR">€ (Euro)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="printHours">Print Time (hours)</Label>
                        <Input id="printHours" type="number" min="0" step="0.1" value={inputs.printHours} onChange={e => handleNumericInputChange('printHours', e.target.value)} onBlur={() => handleBlur('printHours')}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="printMinutes">Print Time (minutes)</Label>
                        <Input id="printMinutes" type="number" min="0" max="59" step="1" value={inputs.printMinutes} onChange={e => handleNumericInputChange('printMinutes', e.target.value)} onBlur={() => handleBlur('printMinutes')}/>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="filamentWeight">Filament Weight (grams)</Label>
                    <Input id="filamentWeight" type="number" min="0" step="1" value={inputs.filamentWeight} onChange={e => handleNumericInputChange('filamentWeight', e.target.value)} onBlur={() => handleBlur('filamentWeight')} />
                </div>
                
                {/* Filament Section */}
                <Card className="pt-4">
                     <CardHeader className="pt-0">
                        <CardTitle className="flex items-center gap-2 text-base"><Cog className="text-primary"/> Filament</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="filamentType">Filament Type</Label>
                            <Select value={inputs.filamentType} onValueChange={(v) => handleInputChange('filamentType', v)}>
                                <SelectTrigger id="filamentType"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pla">PLA</SelectItem>
                                    <SelectItem value="abs">ABS</SelectItem>
                                    <SelectItem value="petg">PETG</SelectItem>
                                    <SelectItem value="tpu">TPU</SelectItem>
                                    <SelectItem value="resin">Resin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="spoolPrice">Spool Price</Label>
                                <Input id="spoolPrice" type="number" min="0" step="0.01" value={inputs.spoolPrice} onChange={e => handleNumericInputChange('spoolPrice', e.target.value)} onBlur={() => handleBlur('spoolPrice')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spoolWeight">Spool Weight (g)</Label>
                                <Input id="spoolWeight" type="number" min="0" step="1" value={inputs.spoolWeight} onChange={e => handleNumericInputChange('spoolWeight', e.target.value)} onBlur={() => handleBlur('spoolWeight')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="wastage">Wastage Percentage ({inputs.wastage}%)</Label>
                             <Slider id="wastage" min={0} max={50} step={1} value={[inputs.wastage]} onValueChange={(v) => handleSliderChange('wastage', v)} />
                        </div>
                    </CardContent>
                </Card>

                 {/* Electricity Section */}
                <Card className="pt-4">
                     <CardHeader className="pt-0">
                        <CardTitle className="flex items-center gap-2 text-base"><Zap className="text-primary"/> Electricity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="printerPower">Printer Power (Watts)</Label>
                                <Input id="printerPower" type="number" min="0" step="1" value={inputs.printerPower} onChange={e => handleNumericInputChange('printerPower', e.target.value)} onBlur={() => handleBlur('printerPower')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="electricityCost">Electricity Cost ({inputs.currency}/kWh)</Label>
                                <Input id="electricityCost" type="number" min="0" step="0.01" value={inputs.electricityCost} onChange={e => handleNumericInputChange('electricityCost', e.target.value)} onBlur={() => handleBlur('electricityCost')} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 {/* Labor Cost Section */}
                <Card className="pt-4">
                     <CardHeader className="pt-0">
                        <CardTitle className="flex items-center gap-2 text-base"><Clock className="text-primary"/> Labor Cost</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="laborRate">Labor Rate ({inputs.currency}/hour)</Label>
                            <Input id="laborRate" type="number" min="0" step="0.01" value={inputs.laborRate} onChange={e => handleNumericInputChange('laborRate', e.target.value)} onBlur={() => handleBlur('laborRate')} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Design Time (min)</Label><Input type="number" min="0" value={inputs.designTime} onChange={e => handleNumericInputChange('designTime', e.target.value)} onBlur={() => handleBlur('designTime')} /></div>
                            <div className="space-y-2"><Label>Setup Time (min)</Label><Input type="number" min="0" value={inputs.setupTime} onChange={e => handleNumericInputChange('setupTime', e.target.value)} onBlur={() => handleBlur('setupTime')} /></div>
                            <div className="space-y-2"><Label>Post-Processing (min)</Label><Input type="number" min="0" value={inputs.postProcessingTime} onChange={e => handleNumericInputChange('postProcessingTime', e.target.value)} onBlur={() => handleBlur('postProcessingTime')} /></div>
                            <div className="space-y-2"><Label>QC Time (min)</Label><Input type="number" min="0" value={inputs.qcTime} onChange={e => handleNumericInputChange('qcTime', e.target.value)} onBlur={() => handleBlur('qcTime')} /></div>
                        </div>
                    </CardContent>
                </Card>

                {/* Machine & Upkeep Section */}
                <Card className="pt-4">
                     <CardHeader className="pt-0">
                        <CardTitle className="flex items-center gap-2 text-base"><Wrench className="text-primary"/> Machine & Upkeep</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="printerCost">Printer Cost ({inputs.currency})</Label>
                                <Input id="printerCost" type="number" min="0" value={inputs.printerCost} onChange={e => handleNumericInputChange('printerCost', e.target.value)} onBlur={() => handleBlur('printerCost')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="investmentReturn">Return (years)</Label>
                                <Input id="investmentReturn" type="number" min="0" value={inputs.investmentReturn} onChange={e => handleNumericInputChange('investmentReturn', e.target.value)} onBlur={() => handleBlur('investmentReturn')} />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="dailyUsage">Daily Commercial Usage ({inputs.dailyUsage}h)</Label>
                             <Slider id="dailyUsage" min={0} max={24} step={1} value={[inputs.dailyUsage]} onValueChange={(v) => handleSliderChange('dailyUsage', v)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="repairCost">Repair Cost ({inputs.repairCostPercentage}%)</Label>
                            <Slider id="repairCost" min={0} max={20} step={1} value={[inputs.repairCostPercentage]} onValueChange={(v) => handleSliderChange('repairCostPercentage', v)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Extra Costs Section */}
                <Card className="pt-4">
                     <CardHeader className="pt-0">
                        <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="text-primary"/> Extra Costs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {inputs.extraCosts.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor={`extraCostName${index}`}>Cost Name</Label>
                                    <Input id={`extraCostName${index}`} placeholder="e.g., Royalty Fee" value={item.name} onChange={e => handleExtraCostChange(index, 'name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`extraCostBaseAmount${index}`}>Base ({inputs.currency})</Label>
                                    <Input id={`extraCostBaseAmount${index}`} type="number" className="w-24" value={item.baseAmount} onChange={e => handleExtraCostChange(index, 'baseAmount', Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`extraCostPercentage${index}`}>Percent (%)</Label>
                                    <Input id={`extraCostPercentage${index}`} type="number" className="w-20" value={item.percentage} onChange={e => handleExtraCostChange(index, 'percentage', Number(e.target.value))} />
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeExtraCostItem(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addExtraCostItem}><Plus className="mr-2 h-4 w-4"/>Add Extra Cost</Button>
                    </CardContent>
                </Card>

                {/* Packaging Section */}
                <Card className="pt-4">
                     <CardHeader className="pt-0">
                        <CardTitle className="flex items-center gap-2 text-base"><Package className="text-primary"/> Packaging / Accessories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {inputs.packagingItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor={`accessory${index}`}>Item Name</Label>
                                    <Input id={`accessory${index}`} value={item.name} onChange={e => handlePackagingChange(index, 'name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`quantity${index}`}>Quantity</Label>
                                    <Input id={`quantity${index}`} type="number" className="w-20" min="0" value={item.quantity} onChange={e => handlePackagingChange(index, 'quantity', Number(e.target.value))} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`unitPrice${index}`}>Unit Price</Label>
                                    <Input id={`unitPrice${index}`} type="number" className="w-24" min="0" step="0.01" value={item.unitPrice} onChange={e => handlePackagingChange(index, 'unitPrice', Number(e.target.value))} />
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removePackagingItem(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addPackagingItem}><Plus className="mr-2 h-4 w-4"/>Add Item</Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
        <CameraCaptureModal 
            isOpen={isCameraModalOpen}
            onClose={() => setIsCameraModalOpen(false)}
            onCapture={handleCapture}
        />
        </>
    );
}
