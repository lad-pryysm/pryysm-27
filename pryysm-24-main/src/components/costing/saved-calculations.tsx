
"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HardDrive, Trash2, Box, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import type { SavedCalculation } from '@/hooks/use-workspace';
import Image from 'next/image';
import type { CostInputsState } from './cost-inputs';

interface SavedCalculationsProps {
    calculations: SavedCalculation[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (template: SavedCalculation) => void;
    onPreview: (template: SavedCalculation) => void;
}

const currencySymbols = { USD: '$', EUR: '€', AED: 'AED', INR: '₹' };

const calculateSubtotal = (inputs: CostInputsState): number => {
    const getNum = (val: string | number) => (val === '' || isNaN(Number(val)) ? 0 : Number(val));

    const printTimeHours = getNum(inputs.printHours) + (getNum(inputs.printMinutes) / 60);
    const filamentCost = getNum(inputs.spoolWeight) > 0 ? (getNum(inputs.filamentWeight) / getNum(inputs.spoolWeight)) * getNum(inputs.spoolPrice) : 0;
    const electricityCost = (getNum(inputs.printerPower) / 1000) * printTimeHours * getNum(inputs.electricityCost);
    const machineDepreciation = getNum(inputs.dailyUsage) > 0 && getNum(inputs.investmentReturn) > 0 ? (getNum(inputs.printerCost) / (getNum(inputs.investmentReturn) * 365 * getNum(inputs.dailyUsage))) * printTimeHours : 0;
    const laborCost = ((getNum(inputs.designTime) + getNum(inputs.setupTime) + getNum(inputs.postProcessingTime) + getNum(inputs.qcTime)) / 60) * getNum(inputs.laborRate);
    const repairCost = machineDepreciation * (getNum(inputs.repairCostPercentage) / 100);
    const packagingCost = inputs.packagingItems.reduce((acc, item) => acc + (getNum(item.quantity) * getNum(item.unitPrice)), 0);

    const extraCostsTotal = inputs.extraCosts.reduce((acc, cost) => {
        const costValue = (getNum(cost.baseAmount) * getNum(cost.percentage)) / 100;
        return acc + costValue;
    }, 0);
    
    return filamentCost + electricityCost + machineDepreciation + laborCost + repairCost + packagingCost + extraCostsTotal;
};

export function SavedCalculations({ calculations, onLoad, onDelete, onEdit, onPreview }: SavedCalculationsProps) {
    
    const formatCurrency = (value: number, currency: keyof typeof currencySymbols) => `${currencySymbols[currency]}${value.toFixed(2)}`;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDrive className="text-primary"/>
                    Saved Templates
                </CardTitle>
                <CardDescription>
                    Double-click a row to load a template. Use the actions to preview, edit, or delete.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-[30rem] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Template Name</TableHead>
                                <TableHead>Saved On</TableHead>
                                <TableHead>Total Cost</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {calculations.length > 0 ? (
                                calculations.map(calc => {
                                    const totalCost = calculateSubtotal(calc.inputs);
                                    return (
                                        <TableRow key={calc.id} onDoubleClick={() => onLoad(calc.id)} className="cursor-pointer">
                                            <TableCell>
                                                <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-muted flex-shrink-0">
                                                    {calc.inputs.productImage ? (
                                                        <Image src={calc.inputs.productImage} alt={calc.name} width={64} height={64} className="object-cover rounded-md" />
                                                    ) : (
                                                        <Box className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{calc.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{format(new Date(calc.createdAt), "dd-MM-yy, h:mm a")}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(totalCost, calc.inputs.currency)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(calc)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(calc)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => onDelete(calc.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No saved templates yet. Use the 'Save as Template' button to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
