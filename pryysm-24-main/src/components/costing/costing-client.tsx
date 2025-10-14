

"use client"

import React, { useState, useMemo, useRef } from 'react';
import { CostInputs, type CostInputsState, type ExtraCostItem } from './cost-inputs';
import { CostBreakdown } from './cost-breakdown';
import { Calculator, Download, User, LogOut, PanelLeft, Save, Upload, Library, BookCopy, BookMarked, HardDrive, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace, type SavedCalculation, type LoggedCalculation } from '@/hooks/use-workspace';
import { SavedCalculations } from './saved-calculations';
import { CalculationLog } from './calculation-log';
import { EditTemplateModal } from './edit-template-modal';
import { PreviewTemplateModal } from './preview-template-modal';


export interface CostCalculationResult {
    filamentCost: number;
    electricityCost: number;
    machineCost: number;
    laborCost: number;
    repairCost: number;
    packagingCost: number;
    extraCosts: { name: string, value: number }[];
    extraCostsTotal: number;
    subtotal: number;
    consumerPrice: number;
    consumerGrossProfit: number;
    consumerNetProfit: number;
    resellerPrice: number;
    resellerGrossProfit: number;
    resellerNetProfit: number;
}

export interface PricingInputs {
    consumer: {
        tax: number;
        creditCardFee: number;
        adsCost: number;
        targetProfit: number;
    };
    reseller: {
        tax: number;
        creditCardFee: number;
        targetProfit: number;
    }
}


export function CostingClient() {
    const { toast } = useToast();
    const { 
        saveCostingTemplate, 
        loadCostingTemplate, 
        deleteCostingTemplate, 
        updateCostingTemplate,
        costingTemplates,
        addLoggedCalculation,
        loggedCalculations,
        deleteLoggedCalculation
    } = useWorkspace();
    
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<SavedCalculation | null>(null);
    const [templateToPreview, setTemplateToPreview] = useState<SavedCalculation | null>(null);

    const [saveName, setSaveName] = useState("");

    const [inputs, setInputs] = useState<CostInputsState>({
        jobName: '',
        productImage: '',
        currency: 'USD',
        printHours: 5,
        printMinutes: 30,
        filamentWeight: 120,
        filamentType: 'pla',
        spoolPrice: 25.00,
        spoolWeight: 1000,
        wastage: 5,
        printerPower: 200,
        electricityCost: 0.15,
        laborRate: 20.00,
        designTime: 30,
        setupTime: 30,
        postProcessingTime: 15,
        qcTime: 10,
        printerCost: 500,
        investmentReturn: 3,
        dailyUsage: 4,
        repairCostPercentage: 5,
        packagingItems: [{ name: '', quantity: 1, unitPrice: 0 }],
        extraCosts: [],
    });

    const [pricingInputs, setPricingInputs] = useState<PricingInputs>({
        consumer: { tax: 5, creditCardFee: 3, adsCost: 20, targetProfit: 25 },
        reseller: { tax: 5, creditCardFee: 2, targetProfit: 15 }
    });

    const calculation = useMemo((): CostCalculationResult => {
        // Ensure all numeric inputs are treated as numbers, defaulting to 0 if empty/invalid
        const getNum = (val: string | number) => (val === '' || isNaN(Number(val)) ? 0 : Number(val));

        const printTimeHours = getNum(inputs.printHours) + (getNum(inputs.printMinutes) / 60);
        const filamentWeight = getNum(inputs.filamentWeight);
        const spoolWeight = getNum(inputs.spoolWeight);
        const spoolPrice = getNum(inputs.spoolPrice);
        const printerPower = getNum(inputs.printerPower);
        const electricityCostKwh = getNum(inputs.electricityCost);
        const printerCost = getNum(inputs.printerCost);
        const investmentReturnYears = getNum(inputs.investmentReturn);
        const dailyUsageHours = inputs.dailyUsage;
        const laborRate = getNum(inputs.laborRate);
        const designTime = getNum(inputs.designTime);
        const setupTime = getNum(inputs.setupTime);
        const postProcessingTime = getNum(inputs.postProcessingTime);
        const qcTime = getNum(inputs.qcTime);


        const filamentCost = spoolWeight > 0 ? (filamentWeight / spoolWeight) * spoolPrice * (1 + inputs.wastage / 100) : 0;
        const electricityCost = (printerPower / 1000) * printTimeHours * electricityCostKwh;
        const machineDepreciation = dailyUsageHours > 0 && investmentReturnYears > 0 ? (printerCost / (investmentReturnYears * 365 * dailyUsageHours)) * printTimeHours : 0;
        const laborCost = ((designTime + setupTime + postProcessingTime + qcTime) / 60) * laborRate;
        const repairCost = machineDepreciation * (inputs.repairCostPercentage / 100);
        const packagingCost = inputs.packagingItems.reduce((acc, item) => acc + (getNum(item.quantity) * getNum(item.unitPrice)), 0);

        const coreSubtotal = filamentCost + electricityCost + machineDepreciation + laborCost + repairCost + packagingCost;

        const calculatedExtraCosts = inputs.extraCosts.map(cost => {
            const value = (getNum(cost.baseAmount) * getNum(cost.percentage)) / 100;
            return { name: cost.name, value };
        });

        const extraCostsTotal = calculatedExtraCosts.reduce((acc, cost) => acc + cost.value, 0);

        const subtotal = coreSubtotal + extraCostsTotal;

        // Consumer Pricing
        const consumerTaxDecimal = pricingInputs.consumer.tax / 100;
        const consumerCreditCardFeeDecimal = pricingInputs.consumer.creditCardFee / 100;
        const consumerAdsCostDecimal = pricingInputs.consumer.adsCost / 100;
        const consumerTargetProfitDecimal = pricingInputs.consumer.targetProfit / 100;
        
        const consumerDenominator = 1 - consumerAdsCostDecimal - consumerTaxDecimal - consumerCreditCardFeeDecimal - consumerTargetProfitDecimal;
        const consumerPrice = consumerDenominator > 0 ? subtotal / consumerDenominator : subtotal;
        const consumerGrossProfit = consumerPrice - subtotal;
        const consumerNetProfit = consumerPrice * consumerTargetProfitDecimal;

        // Reseller Pricing
        const resellerTaxDecimal = pricingInputs.reseller.tax / 100;
        const resellerCreditCardFeeDecimal = pricingInputs.reseller.creditCardFee / 100;
        const resellerTargetProfitDecimal = pricingInputs.reseller.targetProfit / 100;
        const resellerDenominator = 1 - resellerTaxDecimal - resellerCreditCardFeeDecimal - resellerTargetProfitDecimal;
        const resellerPrice = resellerDenominator > 0 ? subtotal / resellerDenominator : subtotal;
        const resellerGrossProfit = resellerPrice - subtotal;
        const resellerNetProfit = resellerPrice * resellerTargetProfitDecimal;

        return {
            filamentCost, electricityCost, machineCost: machineDepreciation, laborCost, repairCost, packagingCost,
            extraCosts: calculatedExtraCosts,
            extraCostsTotal,
            subtotal,
            consumerPrice,
            consumerGrossProfit,
            consumerNetProfit,
            resellerPrice,
            resellerGrossProfit,
            resellerNetProfit,
        };
    }, [inputs, pricingInputs]);

    const breakdownRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const currencySymbols = { USD: '$', EUR: '€', AED: 'AED', INR: '₹' };
        const currencySymbol = currencySymbols[inputs.currency];

        const formatCurrency = (value: number) => `${currencySymbol}${value.toFixed(2)}`;

        // Add title
        doc.setFontSize(22);
        doc.text('Costing Report', 14, 22);
        doc.setFontSize(16);
        doc.text(`Job: ${inputs.jobName || 'Untitled Job'}`, 14, 32);
        
        if (inputs.productImage) {
            try {
                doc.addImage(inputs.productImage, 'PNG', 150, 15, 45, 45, undefined, 'FAST');
            } catch(e) {
                console.error("Error adding image to PDF:", e);
            }
        }
        
        doc.setFontSize(12);
        doc.text(`Total Cost: ${formatCurrency(calculation.subtotal)}`, 14, 42);

        // Breakdown Table
        const breakdownBody: (string | number)[][] = [
            ['Filament Cost', formatCurrency(calculation.filamentCost)],
            ['Electricity Cost', formatCurrency(calculation.electricityCost)],
            ['Machine Depreciation', formatCurrency(calculation.machineCost)],
            ['Labor Cost', formatCurrency(calculation.laborCost)],
            ['Repair Cost', formatCurrency(calculation.repairCost)],
            ['Packaging', formatCurrency(calculation.packagingCost)],
        ];

        calculation.extraCosts.forEach(cost => {
            breakdownBody.push([cost.name, formatCurrency(cost.value)]);
        });

        autoTable(doc, {
            startY: 50,
            head: [['Component', 'Cost']],
            body: breakdownBody,
            foot: [[{ content: 'Subtotal', styles: { fontStyle: 'bold' } }, { content: formatCurrency(calculation.subtotal), styles: { fontStyle: 'bold' } }]],
            theme: 'striped',
            headStyles: { fillColor: [67, 97, 238] },
        });

        const lastTableY = (doc as any).lastAutoTable.finalY;

        // Pricing Table
        autoTable(doc, {
            startY: lastTableY + 15,
            head: [['Pricing Tier', 'Price', 'Gross Profit', 'Net Profit']],
            body: [
                ['Consumer', formatCurrency(calculation.consumerPrice), formatCurrency(calculation.consumerGrossProfit), formatCurrency(calculation.consumerNetProfit)],
                ['Reseller', formatCurrency(calculation.resellerPrice), formatCurrency(calculation.resellerGrossProfit), formatCurrency(calculation.resellerNetProfit)],
            ],
             theme: 'grid',
             headStyles: { fillColor: [67, 97, 238] },
        });

        doc.save(`cost-report-${inputs.jobName || 'untitled'}.pdf`);
    };

    const handleSaveCurrentCalculation = () => {
        if (!saveName.trim()) {
            toast({ variant: 'destructive', title: 'Name required', description: 'Please enter a name for this template.' });
            return;
        }
        saveCostingTemplate(saveName, inputs, pricingInputs);
        toast({ title: 'Template Saved', description: `"${saveName}" has been saved.` });
        setIsSaveModalOpen(false);
        setSaveName("");
    }

    const handleSaveToLog = () => {
        if (!inputs.jobName.trim()) {
            toast({ variant: 'destructive', title: 'Job Name Required', description: 'Please enter a job name before logging.' });
            return;
        }
        addLoggedCalculation(inputs, pricingInputs, calculation);
        toast({ title: 'Calculation Logged', description: `Costing for "${inputs.jobName}" has been logged.` });
    };
    
    const handleLoadCalculation = (id: string) => {
        const loaded = loadCostingTemplate(id);
        if (loaded) {
            setInputs(loaded.inputs);
            setPricingInputs(loaded.pricingInputs);
            toast({ title: 'Template Loaded', description: `"${loaded.name}" has been loaded into the form.` });
        }
    }
    
    const handleLoadLog = (log: LoggedCalculation) => {
        setInputs(log.inputs);
        setPricingInputs(log.pricingInputs);
        toast({ title: 'Log Loaded', description: `Calculation for "${log.inputs.jobName}" has been loaded.` });
    };

    const handleOpenEdit = (template: SavedCalculation) => {
        setTemplateToEdit(template);
        setIsEditModalOpen(true);
    };

    const handleUpdateTemplate = (id: string, newName: string) => {
        updateCostingTemplate(id, newName);
        setIsEditModalOpen(false);
        toast({ title: "Template Renamed", description: `Template has been renamed to "${newName}".` });
    };

    const handleOpenPreview = (template: SavedCalculation | LoggedCalculation) => {
        const isSavedCalc = 'name' in template;
        
        let previewData: SavedCalculation;
    
        if (isSavedCalc) {
            previewData = template as SavedCalculation;
        } else {
            const loggedCalc = template as LoggedCalculation;
            // The issue is here. We are trying to assign a LoggedCalculation to a SavedCalculation state
            // Let's make the data compatible before setting it.
            previewData = {
                id: loggedCalc.id,
                name: loggedCalc.inputs.jobName, // Use jobName as the 'name' for preview
                createdAt: loggedCalc.createdAt,
                inputs: loggedCalc.inputs,
                pricingInputs: loggedCalc.pricingInputs,
            };
        }
        
        setTemplateToPreview(previewData);
        setIsPreviewModalOpen(true);
    };


    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Calculator className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Cost Calculator</h1>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Select onValueChange={handleLoadCalculation}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Load from Template..." />
                        </SelectTrigger>
                        <SelectContent>
                            {costingTemplates.length > 0 ? (
                                costingTemplates.map(calc => (
                                    <SelectItem key={calc.id} value={calc.id}>
                                        {calc.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>No saved templates</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="space-y-8 lg:col-span-2">
                    <CostInputs inputs={inputs} setInputs={setInputs} />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button onClick={handleDownloadPdf} className="w-full">
                            <Download className="mr-2" />
                            Download PDF
                        </Button>
                         <Button onClick={() => setIsSaveModalOpen(true)} className="w-full" variant="outline">
                            <Save className="mr-2" />
                            Save as Template
                        </Button>
                        <Button onClick={handleSaveToLog} className="w-full" variant="secondary">
                            <BookMarked className="mr-2"/>
                            Save to Log
                        </Button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <CostBreakdown ref={breakdownRef} inputs={inputs} results={calculation} pricingInputs={pricingInputs} setPricingInputs={setPricingInputs} />
                </div>
            </div>

            <div className="mt-8">
                 <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="templates">
                            <HardDrive className="mr-2 h-4 w-4" /> Saved Templates
                        </TabsTrigger>
                        <TabsTrigger value="log">
                            <BookCopy className="mr-2 h-4 w-4" /> Calculation Log
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="templates" className="mt-4">
                        <SavedCalculations
                            calculations={costingTemplates}
                            onLoad={handleLoadCalculation}
                            onDelete={deleteCostingTemplate}
                            onEdit={handleOpenEdit}
                            onPreview={handleOpenPreview}
                        />
                    </TabsContent>
                    <TabsContent value="log" className="mt-4">
                        <CalculationLog
                            calculations={loggedCalculations}
                            onDelete={deleteLoggedCalculation}
                            onPreview={handleOpenPreview}
                            onLoad={handleLoadLog}
                        />
                    </TabsContent>
                </Tabs>
            </div>


            <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Calculation as Template</DialogTitle>
                        <DialogDescription>Give this template a name for easy retrieval later.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="save-name">Template Name</Label>
                        <Input id="save-name" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="e.g., Standard PLA Part, 10-hour print" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveCurrentCalculation}>Save Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {templateToEdit && (
                <EditTemplateModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    template={templateToEdit}
                    onSave={handleUpdateTemplate}
                />
            )}

            {templateToPreview && (
                <PreviewTemplateModal
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    template={templateToPreview}
                />
            )}
        </div>
    );
}
