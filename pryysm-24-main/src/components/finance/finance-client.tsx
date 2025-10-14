
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Landmark, FileText, ShoppingCart, Receipt, User, LogOut, Settings } from 'lucide-react'
import { QuotationGenerator } from './quotation-generator'
import { POGenerator } from './po-generator'
import { InvoiceGenerator } from './invoice-generator'
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import { useWorkspace } from '@/hooks/use-workspace';


export type Currency = 'USD' | 'EUR' | 'AED' | 'INR';

export interface CompanyDetails {
    name: string;
    address: string;
    email: string;
    phone: string;
    website: string;
    taxId: string;
    logo: string | null;
}

export interface BankDetails {
    beneficiary: string;
    accountNumber: string;
    iban: string;
    bankName: string;
    swift: string;
    bankAddress: string;
}

export function FinanceClient() {
  const { toast } = useToast();
  const { idService } = useWorkspace();
  const [activeTab, setActiveTab] = useState("quotation");
  const [currency, setCurrency] = useState<Currency>("USD");
  
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: 'Pryysm 3D',
    address: '123 Maker Lane, Innovation City, TX 75001, USA',
    email: 'sales@pryysm3d.com',
    phone: '+1-555-123-4567',
    website: 'www.pryysm3d.com',
    taxId: 'US-PV-123456789',
    logo: null,
  });

  const [bankDetails, setBankDetails] = useState<BankDetails>({
      beneficiary: 'Pryysm 3D Inc.',
      accountNumber: '9876543210',
      iban: 'US910000000001234567890',
      bankName: 'Global Innovations Bank',
      swift: 'GIBKUS33',
      bankAddress: '1 Financial Plaza, Innovation City, TX 75001'
  });
  
  const [showCompanyTaxId, setShowCompanyTaxId] = useState(true);

  const handleCompanyChange = (field: keyof CompanyDetails, value: any) => {
    setCompanyDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: keyof BankDetails, value: any) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                handleCompanyChange('logo', event.target.result as string);
                toast({ title: 'Logo updated successfully!' });
            }
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleSaveChanges = () => {
    // Here you would typically save to a backend
    toast({
        title: 'Settings Saved',
        description: 'Your financial settings have been updated.',
    });
  }


  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Landmark className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Finance</h1>
            <p className="text-sm text-muted-foreground">Generate quotations, purchase orders, and invoices.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-card border rounded-full p-1 shadow-sm">
            {(['USD', 'EUR', 'AED', 'INR'] as const).map((c) => (
                <Button
                key={c}
                variant={currency === c ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrency(c)}
                className="rounded-full px-4"
                >
                {c}
                </Button>
            ))}
            </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto rounded-full">
          <TabsTrigger value="quotation"><FileText className="mr-2 h-4 w-4"/>Quotation</TabsTrigger>
          <TabsTrigger value="po"><ShoppingCart className="mr-2 h-4 w-4"/>Purchase Order</TabsTrigger>
          <TabsTrigger value="invoice"><Receipt className="mr-2 h-4 w-4"/>Tax Invoice</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4"/>Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="quotation" className="mt-6">
          <QuotationGenerator currency={currency} companyDetails={companyDetails} bankDetails={bankDetails} showCompanyTaxId={showCompanyTaxId} idService={idService} />
        </TabsContent>
        <TabsContent value="po" className="mt-6">
          <POGenerator currency={currency} companyDetails={companyDetails} bankDetails={bankDetails} showCompanyTaxId={showCompanyTaxId} idService={idService}/>
        </TabsContent>
        <TabsContent value="invoice" className="mt-6">
          <InvoiceGenerator currency={currency} companyDetails={companyDetails} bankDetails={bankDetails} showCompanyTaxId={showCompanyTaxId} idService={idService}/>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                    <CardTitle>Your Company Details</CardTitle>
                    <CardDescription>This information will appear on your documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input value={companyDetails.name} onChange={e => handleCompanyChange('name', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Company Logo</Label>
                        <div className="flex items-center gap-4">
                            {companyDetails.logo && <img src={companyDetails.logo} alt="logo" className="h-16 w-16 object-contain border p-1 rounded-md" />}
                            <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            <Button asChild variant="outline">
                                <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2">
                                    <Upload className="h-4 w-4"/> {companyDetails.logo ? 'Change' : 'Upload'}
                                </label>
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Textarea value={companyDetails.address} onChange={e => handleCompanyChange('address', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Email</Label><Input type="email" value={companyDetails.email} onChange={e => handleCompanyChange('email', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={companyDetails.phone} onChange={e => handleCompanyChange('phone', e.target.value)} /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Website</Label><Input value={companyDetails.website} onChange={e => handleCompanyChange('website', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Tax ID</Label><Input value={companyDetails.taxId} onChange={e => handleCompanyChange('taxId', e.target.value)} /></div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="show-tax" checked={showCompanyTaxId} onCheckedChange={setShowCompanyTaxId} />
                        <Label htmlFor="show-tax">Show Tax ID on documents</Label>
                    </div>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                    <CardTitle>Bank Details</CardTitle>
                    <CardDescription>Your bank information for receiving payments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Beneficiary Name</Label><Input value={bankDetails.beneficiary} onChange={e => handleBankChange('beneficiary', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Account Number</Label><Input value={bankDetails.accountNumber} onChange={e => handleBankChange('accountNumber', e.target.value)} /></div>
                    <div className="space-y-2"><Label>IBAN</Label><Input value={bankDetails.iban} onChange={e => handleBankChange('iban', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Bank Name</Label><Input value={bankDetails.bankName} onChange={e => handleBankChange('bankName', e.target.value)} /></div>
                    <div className="space-y-2"><Label>SWIFT Code</Label><Input value={bankDetails.swift} onChange={e => handleBankChange('swift', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Bank Address</Label><Textarea value={bankDetails.bankAddress} onChange={e => handleBankChange('bankAddress', e.target.value)} /></div>
                </CardContent>
              </Card>
            </div>
             <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveChanges}>Save Financial Settings</Button>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
