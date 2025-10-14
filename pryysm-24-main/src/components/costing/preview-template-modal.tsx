
"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SavedCalculation } from '@/hooks/use-workspace';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

interface PreviewTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: SavedCalculation | null;
}

const currencySymbols = { USD: '$', EUR: '€', AED: 'AED', INR: '₹' };

const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-right">{value}</span>
    </div>
);

export function PreviewTemplateModal({ isOpen, onClose, template }: PreviewTemplateModalProps) {
    if (!template) return null;

    const { inputs, pricingInputs } = template;
    const currencySymbol = currencySymbols[inputs.currency];

    const totalLaborTime =
        Number(inputs.designTime) +
        Number(inputs.setupTime) +
        Number(inputs.postProcessingTime) +
        Number(inputs.qcTime);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Preview: {template.name}</DialogTitle>
                    <DialogDescription>
                        A read-only view of the saved template settings.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="py-4 space-y-6 pr-4">
                        {inputs.productImage && (
                            <div className="flex justify-center">
                                <Image src={inputs.productImage} alt={inputs.jobName} width={128} height={128} className="rounded-lg object-cover" />
                            </div>
                        )}
                        <h4 className="font-semibold text-primary border-b pb-1">Print Info</h4>
                        <DetailRow label="Job Name" value={inputs.jobName || 'N/A'} />
                        <DetailRow label="Print Time" value={`${inputs.printHours}h ${inputs.printMinutes}m`} />
                        <DetailRow label="Filament Weight" value={`${inputs.filamentWeight}g`} />
                        
                        <h4 className="font-semibold text-primary border-b pb-1">Filament</h4>
                        <DetailRow label="Filament Type" value={inputs.filamentType.toUpperCase()} />
                        <DetailRow label="Spool Price" value={`${currencySymbol}${inputs.spoolPrice}`} />
                        <DetailRow label="Spool Weight" value={`${inputs.spoolWeight}g`} />
                        <DetailRow label="Wastage" value={`${inputs.wastage}%`} />
                        
                        <h4 className="font-semibold text-primary border-b pb-1">Electricity</h4>
                        <DetailRow label="Printer Power" value={`${inputs.printerPower}W`} />
                        <DetailRow label="Electricity Cost" value={`${currencySymbol}${inputs.electricityCost}/kWh`} />

                        <h4 className="font-semibold text-primary border-b pb-1">Labor Cost</h4>
                        <DetailRow label="Labor Rate" value={`${currencySymbol}${inputs.laborRate}/hour`} />
                        <DetailRow label="Total Labor Time" value={`${totalLaborTime} min`} />

                        <h4 className="font-semibold text-primary border-b pb-1">Machine & Upkeep</h4>
                        <DetailRow label="Printer Cost" value={`${currencySymbol}${inputs.printerCost}`} />
                        <DetailRow label="Investment Return" value={`${inputs.investmentReturn} years`} />
                        <DetailRow label="Daily Usage" value={`${inputs.dailyUsage}h`} />
                        <DetailRow label="Repair Cost" value={`${inputs.repairCostPercentage}%`} />
                        
                        {inputs.extraCosts.length > 0 && (
                            <>
                                <h4 className="font-semibold text-primary border-b pb-1">Extra Costs</h4>
                                {inputs.extraCosts.map((cost, index) => (
                                    <DetailRow key={index} label={cost.name} value={`${currencySymbol}${cost.baseAmount} @ ${cost.percentage}%`} />
                                ))}
                            </>
                        )}
                        
                         {inputs.packagingItems.length > 0 && inputs.packagingItems[0].name && (
                            <>
                                <h4 className="font-semibold text-primary border-b pb-1">Packaging</h4>
                                {inputs.packagingItems.map((item, index) => (
                                    <DetailRow key={index} label={item.name} value={`${item.quantity} x ${currencySymbol}${item.unitPrice}`} />
                                ))}
                            </>
                        )}

                        <h4 className="font-semibold text-primary border-b pb-1">Consumer Pricing</h4>
                        <DetailRow label="Target Profit" value={`${pricingInputs.consumer.targetProfit}%`} />
                        <DetailRow label="Tax" value={`${pricingInputs.consumer.tax}%`} />
                        <DetailRow label="Credit Card Fee" value={`${pricingInputs.consumer.creditCardFee}%`} />
                        <DetailRow label="Ads Cost" value={`${pricingInputs.consumer.adsCost}%`} />

                        <h4 className="font-semibold text-primary border-b pb-1">Reseller Pricing</h4>
                        <DetailRow label="Target Profit" value={`${pricingInputs.reseller.targetProfit}%`} />
                        <DetailRow label="Tax" value={`${pricingInputs.reseller.tax}%`} />
                        <DetailRow label="Credit Card Fee" value={`${pricingInputs.reseller.creditCardFee}%`} />

                    </div>
                </ScrollArea>
                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
