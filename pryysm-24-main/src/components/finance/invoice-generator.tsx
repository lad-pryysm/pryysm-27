
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
import { PlusCircle, Trash2, Download, Upload, Pencil, Edit, CreditCard } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DescriptionEditorModal } from './description-editor-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import Link from 'next/link';

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

interface InvoiceGeneratorProps {
  currency: Currency;
  companyDetails: CompanyDetails;
  bankDetails: BankDetails;
  showCompanyTaxId: boolean;
  idService: { getNextId: (type: keyof CodeSettings) => string };
}

export function InvoiceGenerator({ currency, companyDetails, bankDetails, showCompanyTaxId, idService }: InvoiceGeneratorProps) {
  const { customers, addCustomer, updateCustomer } = useWorkspace();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: 1, itemCode: '', image: null, description: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }]);
  const [taxRate, setTaxRate] = useState(5);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days.');
  const [notes, setNotes] = useState('Thank you for your business!');
  
  const [isDescriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [editingDescriptionIndex, setEditingDescriptionIndex] = useState<number | null>(null);
  
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const selectedCustomer = useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId]);


  useEffect(() => {
    // Generate number and dates on client-side to avoid hydration mismatch
    setInvoiceNumber(idService.getNextId('taxInvoice'));
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDueDate(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  }, [idService]);

  const handleAddNewCustomer = (customerData: Omit<Customer, 'id' | 'customerCode'>) => {
    const newCustomer = addCustomer(customerData);
    setIsAddingCustomer(false);
    setSelectedCustomerId(newCustomer.id);
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
    if (!selectedCustomer) {
        alert("Please select a customer first.");
        return;
    }

    const doc = new jsPDF();
    
    // Header
    if (companyDetails.logo) {
        try {
            const imgData = companyDetails.logo;
            if (imgData.startsWith('data:image')) {
                doc.addImage(imgData, 'PNG', 14, 15, 30, 15, undefined, 'FAST');
            }
        } catch (e) {
            console.error("Error adding logo to PDF:", e);
        }
    }

    doc.setFontSize(20);
    doc.text("Tax Invoice", doc.internal.pageSize.getWidth() - 14, 22, { align: 'right' });

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoiceNumber}`, doc.internal.pageSize.getWidth() - 14, 32, { align: 'right' });
    doc.text(`Date: ${format(new Date(date), 'dd-MM-yyyy')}`, doc.internal.pageSize.getWidth() - 14, 38, { align: 'right' });
    doc.text(`Due Date: ${format(new Date(dueDate), 'dd-MM-yyyy')}`, doc.internal.pageSize.getWidth() - 14, 44, { align: 'right' });
    
    // Addresses
    doc.setFontSize(10);
    doc.text(`From:`, 14, 55)
    doc.text(companyDetails.name, 14, 60);
    const fromAddressLines = doc.splitTextToSize(companyDetails.address, 80);
    doc.text(fromAddressLines, 14, 65);

    doc.text(`Bill To:`, 110, 55);
    doc.text(selectedCustomer.name, 110, 60);
    const toAddressLines = doc.splitTextToSize(selectedCustomer.address || '', 80);
    doc.text(toAddressLines, 110, 65);

    
    // Table
    const head = [['Sr.No', 'Image', 'Description', 'Quantity', `Unit Price (${currencySymbols[currency]})`]];
    if (showDiscounts) {
        head[0].push('Discount %', `Total (${currencySymbols[currency]})`);
    } else {
        head[0].push(`Total (${currencySymbols[currency]})`);
    }

    const body = lineItems.map((item, index) => {
        const row = [
            index + 1,
            '', // Placeholder for image
            item.description,
            item.quantity,
            item.unitPrice.toFixed(2),
        ];
        if (showDiscounts) {
            row.push(item.discount.toFixed(2), item.total.toFixed(2));
        } else {
            row.push(item.total.toFixed(2));
        }
        return row;
    });

    autoTable(doc, {
        startY: 90,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [0, 75, 141] },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 1 && lineItems[data.row.index].image) {
                try {
                    const imgData = lineItems[data.row.index].image;
                    if (imgData && imgData.startsWith('data:image')) {
                        const imgWidth = 10; 
                        const imgHeight = 10;
                        const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                        const y = data.cell.y + (data.cell.height - imgHeight) / 2;
                        doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
                    }
                } catch (e) {
                    console.error("Error adding line item image to PDF:", e);
                }
            }
        }
    });
    
    // Totals
    let finalY = (doc as any).lastAutoTable.finalY || 10;
    doc.setFontSize(10)
    doc.text(`Subtotal:`, 140, finalY + 10);
    doc.text(formatCurrency(subtotal), 200, finalY + 10, {align: 'right'});
    doc.text(`Tax (${taxRate}%):`, 140, finalY + 15);
    doc.text(formatCurrency(taxAmount), 200, finalY + 15, {align: 'right'});
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold')
    doc.text(`Total Due:`, 140, finalY + 25);
    doc.text(formatCurrency(total), 200, finalY + 25, {align: 'right'});
    doc.setFont('helvetica', 'normal')

    finalY += 35;
    
    // Footer
    doc.setFontSize(12);
    doc.text("Bank Details", 14, finalY);
    doc.setFontSize(9);
    autoTable(doc, {
        startY: finalY + 5,
        body: [
            ['Beneficiary', bankDetails.beneficiary],
            ['Account Number', bankDetails.accountNumber],
            ['IBAN', bankDetails.iban],
            ['Bank', bankDetails.bankName],
            ['SWIFT', bankDetails.swift],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1 }
    });

    finalY = (doc as any).lastAutoTable.finalY || finalY + 40;

    doc.setFontSize(10);
    doc.text(`Notes: ${notes}`, 14, finalY + 10)
    doc.text(`Payment Terms: ${paymentTerms}`, 14, finalY + 15)

    doc.save(`Invoice-${invoiceNumber}.pdf`);
  };

  if (!invoiceNumber) {
    return null; // Or a loading skeleton
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Create Tax Invoice</CardTitle>
          <CardDescription>Generate a new invoice for a customer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Invoice #</Label>
              <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle className="text-base">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                    <div className="flex-grow space-y-2">
                      <Label htmlFor="customer-select-invoice">Select Customer</Label>
                      <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId || ''}>
                          <SelectTrigger id="customer-select-invoice">
                              <SelectValue placeholder="Select a customer..." />
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
                    <Button variant="outline" size="sm" onClick={() => selectedCustomer && setCustomerToEdit(selectedCustomer)} disabled={!selectedCustomer}>
                        <Edit className="h-4 w-4"/>
                    </Button>
                </div>
                 {selectedCustomer && (
                    <div className="p-4 border rounded-lg bg-muted/50 text-sm">
                        <p><strong>Company:</strong> {selectedCustomer.company || 'N/A'}</p>
                        <p><strong>Email:</strong> {selectedCustomer.email}</p>
                        <p><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</p>
                        <p><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</p>
                        <p><strong>Tax ID:</strong> {selectedCustomer.taxId || 'N/A'}</p>
                    </div>
                )}
            </CardContent>
          </Card>


          <div>
            <div className="flex justify-between items-center mb-2">
                <Label className="text-lg font-semibold">Invoice Items</Label>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="show-discounts">Show Discounts</Label>
                    <Switch id="show-discounts" checked={showDiscounts} onCheckedChange={setShowDiscounts} />
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
                                <label htmlFor={`img-upload-invoice-${index}`} className="cursor-pointer flex items-center justify-center">
                                    {item.image ? <img src={item.image} alt="upload" className="object-cover w-full h-full" /> : <Upload className="h-4 w-4" />}
                                    <input id={`img-upload-invoice-${index}`} type="file" accept="image/*" className="sr-only" onChange={(e) => handleImageUpload(index, e)}/>
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
                <Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="e.g., Payment due within 30 days." />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Notes / Additional Information</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Thank you for your business!" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="sticky top-8">
        <Card>
            <CardHeader>
                <CardTitle>Preview & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-6 border rounded-lg bg-muted/20 space-y-4">
                    <div className="flex justify-between items-start">
                        {companyDetails.logo && <img src={companyDetails.logo} alt="Company Logo" className="h-12 object-contain" />}
                        <h3 className="text-xl font-bold text-right">TAX INVOICE</h3>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Invoice #: {invoiceNumber}</span>
                        <span>Date: {date ? format(new Date(date), 'dd-MM-yyyy') : ''}</span>
                    </div>
                     <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="text-sm">
                            <p className="font-bold">From: {companyDetails.name || "..."}</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{companyDetails.address || "..."}</p>
                        </div>
                        <div className="text-sm text-right">
                            <p className="font-bold">Bill To: {selectedCustomer?.name || "..."}</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{selectedCustomer?.address || "..."}</p>
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
                        <p className="text-lg font-bold">Total Due: {formatCurrency(total)}</p>
                    </div>
                </div>
                 <Button className="w-full" onClick={generatePDF}>
                    <Download className="mr-2 h-4 w-4" /> Download Invoice
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/payment/${invoiceNumber}`} target="_blank">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Go to Payment Page
                    </Link>
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
