
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import type { Currency, CompanyDetails, BankDetails } from './finance-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, Download, Upload, Pencil, Edit } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DescriptionEditorModal } from './description-editor-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { useWorkspace } from '@/hooks/use-workspace';
import type { Customer, CodeSettings } from '@/hooks/use-workspace';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditCustomerForm } from '../customers/edit-customer-form';
import { NewCustomerForm } from '../customers/new-customer-form';


interface LineItem {
  id: number;
  itemCode: string;
  image: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

const currencySymbols = { USD: '$', EUR: '€', AED: 'AED', INR: '₹' };

interface POGeneratorProps {
  currency: Currency;
  companyDetails: CompanyDetails;
  bankDetails: BankDetails;
  showCompanyTaxId: boolean;
  idService: { getNextId: (type: keyof CodeSettings) => string };
}

export function POGenerator({ currency, companyDetails, bankDetails, showCompanyTaxId, idService }: POGeneratorProps) {
  const { customers, addCustomer, updateCustomer } = useWorkspace();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: 1, itemCode: '', image: null, description: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [poNumber, setPoNumber] = useState<string>('');
  const [date, setDate] = useState('');
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState('Payment upon receipt of goods.');
  const [notes, setNotes] = useState('Please include the PO number on all correspondence.');
  
  const [isDescriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [editingDescriptionIndex, setEditingDescriptionIndex] = useState<number | null>(null);
  
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const selectedVendor = useMemo(() => customers.find(c => c.id === selectedVendorId), [customers, selectedVendorId]);


  useEffect(() => {
    // Generate number and date on client-side to avoid hydration mismatch
    setPoNumber(idService.getNextId('purchaseOrder'));
    setDate(new Date().toISOString().split('T')[0]);
  }, [idService]);


  const handleAddNewCustomer = (customerData: Omit<Customer, 'id' | 'customerCode'>) => {
    const newCustomer = addCustomer(customerData);
    setIsAddingCustomer(false);
    setSelectedVendorId(newCustomer.id);
  };

  const handleUpdateCustomer = (customerData: Customer) => {
    updateCustomer(customerData);
    setCustomerToEdit(null);
  };


  const updateLineItem = (index: number, newValues: Partial<LineItem>) => {
    setLineItems(prevItems => {
        const updatedItems = [...prevItems];
        const item = { ...updatedItems[index], ...newValues };
        const discountValue = showDiscounts ? (item.discount || 0) : 0;
        const priceAfterDiscount = item.unitPrice * (1 - discountValue / 100);
        item.total = item.quantity * priceAfterDiscount;
        updatedItems[index] = item;
        return updatedItems;
    });
  };

  const handleItemChange = (index: number, field: keyof Omit<LineItem, 'total' | 'id'>, value: string | number | null) => {
    updateLineItem(index, { [field]: value });
  };
  
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    handleItemChange(index, 'image', event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };


  const addItem = () => {
    setLineItems([...lineItems, { id: Date.now(), itemCode: '', image: null, description: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const formatCurrency = (value: number) => {
    return `${currencySymbols[currency]}${value.toFixed(2)}`;
  };
  
  const openDescriptionEditor = (index: number) => {
    setEditingDescriptionIndex(index);
    setDescriptionModalOpen(true);
  };

  const handleSaveDescription = (newDescription: string) => {
      if (editingDescriptionIndex !== null) {
          handleItemChange(editingDescriptionIndex, 'description', newDescription);
      }
  };


  const generatePDF = () => {
     if (!selectedVendor) {
        alert("Please select a vendor first.");
        return;
    }
    const doc = new jsPDF();

    if (companyDetails.logo) {
      try {
        const imgData = companyDetails.logo;
         if (imgData.startsWith('data:image')) {
            const imgProps = doc.getImageProperties(imgData);
            const aspectRatio = imgProps.width / imgProps.height;
            const pdfWidth = 30;
            const pdfHeight = pdfWidth / aspectRatio;
            const format = imgData.substring(imgData.indexOf('/') + 1, imgData.indexOf(';'));
            doc.addImage(imgData, format, 14, 15, pdfWidth, pdfHeight);
        }
      } catch (e) {
        console.error("Error adding logo to PDF:", e);
      }
    }

    doc.setFontSize(20);
    doc.text("Purchase Order", doc.internal.pageSize.getWidth() - 14, 22, { align: 'right' });
    doc.setFontSize(12);
    doc.text(`PO #: ${poNumber}`, doc.internal.pageSize.getWidth() - 14, 32, { align: 'right' });
    doc.text(`Date: ${format(new Date(date), 'dd-MM-yyyy')}`, doc.internal.pageSize.getWidth() - 14, 38, { align: 'right' });
    
    doc.setFontSize(10);
    const shipToLines = [
        `Ship To: ${companyDetails.name}`,
        companyDetails.address,
        companyDetails.email,
        companyDetails.phone,
        showCompanyTaxId ? `Tax ID: ${companyDetails.taxId}` : ''
    ].filter(Boolean);
    doc.text(shipToLines, 14, 50);

     let vendorLines = [
        `Vendor: ${selectedVendor.name}`,
        selectedVendor.company || '',
        selectedVendor.address || '',
        selectedVendor.email,
        selectedVendor.phone || '',
        selectedVendor.taxId ? `Tax ID: ${selectedVendor.taxId}` : ''
    ].filter(Boolean);

    doc.text(vendorLines, 120, 50);
    
    const head = [['Sr.No', 'Image', 'Description', 'Quantity', `Unit Price (${currencySymbols[currency]})`]];
    const body = lineItems.map((item, index) => [
        index + 1,
        '', // Placeholder for image
        item.description,
        item.quantity,
        item.unitPrice.toFixed(2),
    ]);

    if (showDiscounts) {
        head[0].push('Discount %', `Total (${currencySymbols[currency]})`);
        body.forEach((row, index) => {
            row.push(lineItems[index].discount.toFixed(2), lineItems[index].total.toFixed(2));
        });
    } else {
        head[0].push(`Total (${currencySymbols[currency]})`);
        body.forEach((row, index) => {
            row.push(lineItems[index].total.toFixed(2));
        });
    }
    
    autoTable(doc, {
      startY: 80,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [0, 75, 141] },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1 && lineItems[data.row.index].image) {
            try {
                const imgData = lineItems[data.row.index].image;
                if (imgData && imgData.startsWith('data:image')) {
                    const imgWidth = 15;
                    const imgHeight = 15;
                    const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                    const y = data.cell.y + (data.cell.height - imgHeight) / 2;
                    doc.addImage(imgData, '', x, y, imgWidth, imgHeight);
                }
            } catch (e) {
                console.error("Error adding line item image to PDF:", e);
            }
        }
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY || 10;
    
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, finalY + 10);
    if(taxRate > 0) doc.text(`Tax (${taxRate}%): ${formatCurrency(taxAmount)}`, 140, finalY + 15);
    doc.setFontSize(14);
    doc.text(`Total: ${formatCurrency(total)}`, 140, finalY + 25);
    
    finalY += 35;
    
    doc.setFontSize(12);
    doc.text("Bank Details for Payment", 14, finalY);
    doc.setFontSize(10);
    const bankDetailsLines = [
        `Beneficiary: ${bankDetails.beneficiary}`,
        `Account Number: ${bankDetails.accountNumber}`,
        `IBAN: ${bankDetails.iban}`,
        `Bank: ${bankDetails.bankName}`,
        `SWIFT: ${bankDetails.swift}`,
        `Bank Address: ${bankDetails.bankAddress}`,
    ];
    autoTable(doc, {
        startY: finalY + 5,
        body: bankDetailsLines.map(line => [line]),
        theme: 'plain',
        styles: { fontSize: 9 }
    });

    finalY = (doc as any).lastAutoTable.finalY || finalY + 40;

    doc.setFontSize(12);
    doc.text("Additional Information", 14, finalY + 10);
    doc.setFontSize(10);
    const additionalInfoLines = [
        `Payment Terms: ${paymentTerms}`,
        `Notes: ${notes}`
    ];
    autoTable(doc, {
        startY: finalY + 15,
        body: additionalInfoLines.map(line => [line]),
        theme: 'plain',
        styles: { fontSize: 9 }
    });

    doc.save(`PO-${poNumber}.pdf`);
  };

  if (!poNumber) {
    return null; // Or a loading skeleton
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Create Purchase Order</CardTitle>
          <CardDescription>Generate a new PO to send to your vendors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>PO Number</Label>
              <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle className="text-base">Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-end gap-2">
                    <div className="flex-grow space-y-2">
                      <Label htmlFor="vendor-select-po">Select Vendor</Label>
                      <Select onValueChange={setSelectedVendorId} value={selectedVendorId || ''}>
                          <SelectTrigger id="vendor-select-po">
                              <SelectValue placeholder="Select a vendor..." />
                          </SelectTrigger>
                          <SelectContent>
                              {customers.map(customer => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                      {customer.name} ({customer.customerCode})
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsAddingCustomer(true)}>Add New</Button>
                    <Button variant="outline" size="sm" onClick={() => selectedVendor && setCustomerToEdit(selectedVendor)} disabled={!selectedVendor}>
                        <Edit className="h-4 w-4"/>
                    </Button>
                </div>
                 {selectedVendor && (
                    <div className="p-4 border rounded-lg bg-muted/50 text-sm">
                        <p><strong>Company:</strong> {selectedVendor.company || 'N/A'}</p>
                        <p><strong>Email:</strong> {selectedVendor.email}</p>
                        <p><strong>Phone:</strong> {selectedVendor.phone || 'N/A'}</p>
                        <p><strong>Address:</strong> {selectedVendor.address || 'N/A'}</p>
                        <p><strong>Tax ID:</strong> {selectedVendor.taxId || 'N/A'}</p>
                    </div>
                )}
            </CardContent>
          </Card>

          <div>
            <div className="flex justify-between items-center mb-2">
                <Label className="text-lg font-semibold">Items to Order</Label>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="show-discounts-po">Show Discounts</Label>
                    <Switch id="show-discounts-po" checked={showDiscounts} onCheckedChange={setShowDiscounts} />
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead style={{minWidth: '40px'}}>#</TableHead>
                    <TableHead style={{minWidth: '120px'}}>Item Code</TableHead>
                    <TableHead style={{minWidth: '100px'}}>Image</TableHead>
                    <TableHead style={{minWidth: '250px'}}>Description</TableHead>
                    <TableHead style={{minWidth: '80px'}}>Qty</TableHead>
                    <TableHead style={{minWidth: '120px'}}>Unit Price</TableHead>
                    {showDiscounts && <TableHead style={{minWidth: '100px'}}>Discount</TableHead>}
                    <TableHead style={{minWidth: '120px'}} className="text-right">Total</TableHead>
                    <TableHead style={{minWidth: '50px'}}></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lineItems.map((item, index) => (
                    <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell><Input placeholder="ITEM-001" value={item.itemCode} onChange={e => handleItemChange(index, 'itemCode', e.target.value)} /></TableCell>
                        <TableCell>
                            <Button asChild variant="outline" size="sm" className="w-full h-16 relative">
                                <label htmlFor={`img-upload-po-${index}`} className="cursor-pointer flex items-center justify-center">
                                    {item.image ? <img src={item.image} alt="upload" className="object-cover w-full h-full" /> : <Upload className="h-4 w-4" />}
                                    <input id={`img-upload-po-${index}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(index, e)}/>
                                </label>
                            </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openDescriptionEditor(index)} className="w-full justify-start text-left">
                              <Pencil className="mr-2 h-3 w-3" />
                              <span className="truncate">{item.description || "Add Description"}</span>
                          </Button>
                        </TableCell>
                        <TableCell><Input type="number" min="0" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} /></TableCell>
                        <TableCell><Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} /></TableCell>
                        {showDiscounts && <TableCell><Input type="number" min="0" max="100" value={item.discount} onChange={e => handleItemChange(index, 'discount', Number(e.target.value))} /></TableCell>}
                        <TableCell className="font-medium text-right">{formatCurrency(item.total)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            <Button variant="outline" size="sm" onClick={addItem} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-24 h-8" />
            </div>
             <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="e.g., Payment due upon receipt." />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Notes / Additional Information</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Please include PO number on all correspondence." />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="sticky top-8">
          <Card>
            <CardHeader>
                <CardTitle>Preview & Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-6 border rounded-lg bg-muted/20 space-y-4">
                    <div className="flex justify-between items-start">
                        {companyDetails.logo && <img src={companyDetails.logo} alt="Company Logo" className="h-12 object-contain" />}
                        <h3 className="text-xl font-bold text-right">PURCHASE ORDER</h3>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>PO #: {poNumber}</span>
                        <span>Date: {date ? format(new Date(date), 'dd-MM-yyyy') : ''}</span>
                    </div>
                     <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="text-sm">
                            <p className="font-bold">Ship To: {companyDetails.name || "..."}</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{companyDetails.address || "..."}</p>
                        </div>
                        <div className="text-sm text-right">
                            <p className="font-bold">To: {selectedVendor?.name || "..."}</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{selectedVendor?.address || "..."}</p>
                        </div>
                    </div>
                     <div className="border-t pt-2 mt-2">
                        {lineItems.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm py-1">
                                <span>{item.description || "Item"}</span>
                                <span>{formatCurrency(item.total)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-2 mt-2 space-y-1 text-right">
                        <p className="text-sm">Subtotal: {formatCurrency(subtotal)}</p>
                        <p className="text-sm">Tax ({taxRate}%): {formatCurrency(taxAmount)}</p>
                        <p className="text-lg font-bold">Total: {formatCurrency(total)}</p>
                    </div>
                </div>
                 <Button className="w-full mt-6" onClick={generatePDF}>
                    <Download className="mr-2 h-4 w-4" /> Download PO as PDF
                </Button>
            </CardContent>
          </Card>
      </div>
    </div>
    {isDescriptionModalOpen && (
        <DescriptionEditorModal
            isOpen={isDescriptionModalOpen}
            onClose={() => setDescriptionModalOpen(false)}
            initialDescription={editingDescriptionIndex !== null ? lineItems[editingDescriptionIndex].description : ''}
            onSave={handleSaveDescription}
        />
    )}
     {isAddingCustomer && (
        <NewCustomerForm
            isDialog={true}
            onSubmit={handleAddNewCustomer}
            onCancel={() => setIsAddingCustomer(false)}
        />
    )}
    {customerToEdit && (
        <EditCustomerForm
            customer={customerToEdit}
            isOpen={!!customerToEdit}
            onClose={() => setCustomerToEdit(null)}
            onSubmit={handleUpdateCustomer}
        />
    )}
    </>
  );
}
