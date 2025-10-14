
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
import { BookOpen, Trash2, Box, Eye, Upload } from 'lucide-react';
import { format } from 'date-fns';
import type { LoggedCalculation } from '@/hooks/use-workspace';
import Image from 'next/image';

interface CalculationLogProps {
    calculations: LoggedCalculation[];
    onDelete: (id: string) => void;
    onPreview: (log: LoggedCalculation) => void;
    onLoad: (log: LoggedCalculation) => void;
}

const currencySymbols = { USD: '$', EUR: '€', AED: 'AED', INR: '₹' };

export function CalculationLog({ calculations, onDelete, onPreview, onLoad }: CalculationLogProps) {
    
    const formatCurrency = (value: number, currency: keyof typeof currencySymbols) => `${currencySymbols[currency]}${value.toFixed(2)}`;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-primary"/>
                    Calculation Log
                </CardTitle>
                <CardDescription>
                    A historical record of all your finalized cost calculations. Double-click to load.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-[30rem] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Job Name</TableHead>
                                <TableHead>Logged On</TableHead>
                                <TableHead>Total Cost</TableHead>
                                <TableHead>Consumer Price</TableHead>
                                <TableHead>Reseller Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {calculations.length > 0 ? (
                                calculations.map(log => {
                                    return (
                                        <TableRow key={log.id} onDoubleClick={() => onLoad(log)} className="cursor-pointer">
                                            <TableCell>
                                                <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-muted flex-shrink-0">
                                                    {log.inputs.productImage ? (
                                                        <Image src={log.inputs.productImage} alt={log.inputs.jobName} width={64} height={64} className="object-cover rounded-md" />
                                                    ) : (
                                                        <Box className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{log.inputs.jobName}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{format(new Date(log.createdAt), "dd-MM-yy, h:mm a")}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(log.results.subtotal, log.inputs.currency)}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(log.results.consumerPrice, log.inputs.currency)}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(log.results.resellerPrice, log.inputs.currency)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(log)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onLoad(log)}>
                                                        <Upload className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => onDelete(log.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No logged calculations yet. Use the 'Save to Log' button to get started.
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
