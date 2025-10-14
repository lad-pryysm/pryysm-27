
"use client"

import React, { forwardRef, Dispatch, SetStateAction } from 'react';
import type { PricingInputs, CostCalculationResult } from './costing-client';
import type { CostInputsState } from './cost-inputs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FileText, Users, Building, Percent } from 'lucide-react';

interface CostBreakdownProps {
    inputs: CostInputsState;
    results: CostCalculationResult;
    pricingInputs: PricingInputs;
    setPricingInputs: Dispatch<SetStateAction<PricingInputs>>;
}

const currencySymbols = {
  USD: '$',
  EUR: '€',
  AED: 'AED',
  INR: '₹',
};

export const CostBreakdown = forwardRef<HTMLDivElement, CostBreakdownProps>(({ inputs, results, pricingInputs, setPricingInputs }, ref) => {
    const formatCurrency = (value: number) => {
        return `${currencySymbols[inputs.currency]}${value.toFixed(2)}`;
    };

    const handlePricingChange = (
      type: 'consumer' | 'reseller',
      field: keyof PricingInputs['consumer'] | keyof PricingInputs['reseller'],
      value: string
    ) => {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            setPricingInputs(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    [field]: numValue
                }
            }));
        }
    };

    return (
        <Card ref={ref} className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground sticky top-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText/> Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-lg">Total Cost</p>
                    <p className="text-4xl font-bold">{formatCurrency(results.subtotal)}</p>
                </div>

                <div className="bg-white/10 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between"><span className="opacity-80">Filament Cost</span><span className="font-medium">{formatCurrency(results.filamentCost)}</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Electricity Cost</span><span className="font-medium">{formatCurrency(results.electricityCost)}</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Machine Depreciation</span><span className="font-medium">{formatCurrency(results.machineCost)}</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Labor Cost</span><span className="font-medium">{formatCurrency(results.laborCost)}</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Repair Cost</span><span className="font-medium">{formatCurrency(results.repairCost)}</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Packaging</span><span className="font-medium">{formatCurrency(results.packagingCost)}</span></div>
                    {results.extraCosts.map((cost, index) => (
                        <div key={index} className="flex justify-between"><span className="opacity-80">{cost.name}</span><span className="font-medium">{formatCurrency(cost.value)}</span></div>
                    ))}
                    <hr className="border-white/20 my-2" />
                    <div className="flex justify-between font-bold text-base"><span>Subtotal</span><span>{formatCurrency(results.subtotal)}</span></div>
                </div>

                <Accordion type="multiple" defaultValue={['consumer-pricing', 'reseller-pricing']} className="w-full">
                    <AccordionItem value="consumer-pricing" className="border-b-white/20">
                        <AccordionTrigger className="text-base font-semibold hover:no-underline">
                            <div className="flex items-center gap-2"><Users/> Pricing for Consumer</div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-white/10 p-4 rounded-b-lg space-y-3">
                           <div className="space-y-4 pt-2 text-sm">
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <Label>Target Profit (%)</Label>
                                    <Input type="number" value={pricingInputs.consumer.targetProfit} onChange={e => handlePricingChange('consumer', 'targetProfit', e.target.value)} className="bg-background/20 h-8" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <Label>Tax (%)</Label>
                                    <Input type="number" value={pricingInputs.consumer.tax} onChange={e => handlePricingChange('consumer', 'tax', e.target.value)} className="bg-background/20 h-8" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <Label>Credit Card Fee (%)</Label>
                                    <Input type="number" value={pricingInputs.consumer.creditCardFee} onChange={e => handlePricingChange('consumer', 'creditCardFee', e.target.value)} className="bg-background/20 h-8" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <Label>Ads Cost (%)</Label>
                                    <Input type="number" value={pricingInputs.consumer.adsCost} onChange={e => handlePricingChange('consumer', 'adsCost', e.target.value)} className="bg-background/20 h-8" />
                                </div>
                           </div>
                            <div className="pt-2 space-y-1 text-sm mt-4 border-t border-white/20">
                                <hr className="border-white/20 my-2" />
                                <div className="flex justify-between font-bold text-xl"><p>Consumer Price</p><p>{formatCurrency(results.consumerPrice)}</p></div>
                                <div className="flex justify-between opacity-80"><p>Gross Profit</p><p>{formatCurrency(results.consumerGrossProfit)}</p></div>
                                <div className="flex justify-between font-semibold"><p>Net Profit</p><p>{formatCurrency(results.consumerNetProfit)}</p></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="reseller-pricing" className="border-b-0">
                        <AccordionTrigger className="text-base font-semibold hover:no-underline">
                             <div className="flex items-center gap-2"><Building/> Pricing for Reseller</div>
                        </AccordionTrigger>
                         <AccordionContent className="bg-white/10 p-4 rounded-b-lg space-y-3">
                             <div className="space-y-4 pt-2 text-sm">
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <Label>Target Profit (%)</Label>
                                    <Input type="number" value={pricingInputs.reseller.targetProfit} onChange={e => handlePricingChange('reseller', 'targetProfit', e.target.value)} className="bg-background/20 h-8" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <Label>Tax (%)</Label>
                                    <Input type="number" value={pricingInputs.reseller.tax} onChange={e => handlePricingChange('reseller', 'tax', e.target.value)} className="bg-background/20 h-8" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <Label>Credit Card Fee (%)</Label>
                                    <Input type="number" value={pricingInputs.reseller.creditCardFee} onChange={e => handlePricingChange('reseller', 'creditCardFee', e.target.value)} className="bg-background/20 h-8" />
                                </div>
                            </div>
                            <div className="pt-2 space-y-1 text-sm mt-4 border-t border-white/20">
                                <hr className="border-white/20 my-2" />
                                <div className="flex justify-between font-bold text-xl"><p>Reseller Price</p><p>{formatCurrency(results.resellerPrice)}</p></div>
                                <div className="flex justify-between opacity-80"><p>Gross Profit</p><p>{formatCurrency(results.resellerGrossProfit)}</p></div>
                                <div className="flex justify-between font-semibold"><p>Net Profit</p><p>{formatCurrency(results.resellerNetProfit)}</p></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="bg-white/10 p-4 rounded-lg space-y-2 text-xs opacity-80">
                     <h4 className="font-semibold text-sm mb-2">Pricing Formula Explanation</h4>
                     <p>The selling price (P) is calculated to achieve your target net profit margin after all costs and fees are deducted.</p>
                     <p className="font-mono p-2 bg-black/20 rounded-md">P = Subtotal / (1 - Fees% - Target Profit%)</p>
                </div>
            </CardContent>
        </Card>
    );
});

CostBreakdown.displayName = "CostBreakdown";
