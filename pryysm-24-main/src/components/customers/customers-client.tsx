
"use client"

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Search, Users, FileText, ShoppingCart, Receipt, Edit, Eye, LogOut, User, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { DocumentPreviewModal } from './document-preview-modal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { EditCustomerForm } from './edit-customer-form'
import { NewCustomerForm } from './new-customer-form'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useWorkspace } from '@/hooks/use-workspace'
import type { Customer, Document, DocumentType } from '@/hooks/use-workspace'


const docTypeIcons: Record<DocumentType, React.ElementType> = {
  'Quotation': FileText,
  'Purchase Order': ShoppingCart,
  'Tax Invoice': Receipt,
}

export function CustomersClient() {
  const { toast } = useToast();
  const { customers, documents: allDocuments, addCustomer, updateCustomer } = useWorkspace();
  
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  
  const [docTypeFilter, setDocTypeFilter] = useState<'All' | DocumentType>('All');
  
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [previewDoc, setPreviewDoc] = useState<any>(null);


  const documents = useMemo(() => {
    let filteredDocs = allDocuments;

    if (selectedCustomer) {
        filteredDocs = filteredDocs.filter(doc => doc.customerId === selectedCustomer.id);
    }
    
    if (docTypeFilter !== 'All') {
        filteredDocs = filteredDocs.filter(doc => doc.type === docTypeFilter);
    }

    if (docSearchQuery) {
        const lowercasedQuery = docSearchQuery.toLowerCase();
        const customerMap = new Map(customers.map(c => [c.id, c.name]));
        filteredDocs = filteredDocs.filter(doc => {
            const customerName = customerMap.get(doc.customerId)?.toLowerCase() || '';
            return doc.orderNumber.toLowerCase().includes(lowercasedQuery) || customerName.includes(lowercasedQuery);
        });
    }
    
    return filteredDocs;

  }, [allDocuments, customers, selectedCustomer, docTypeFilter, docSearchQuery]);


  const handleAddNewCustomer = (customerData: Omit<Customer, 'id' | 'customerCode'>) => {
    addCustomer(customerData);
    setIsAddingCustomer(false);
    toast({ title: 'Customer Added', description: `${customerData.name} has been added.` });
  }
  
  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    updateCustomer(updatedCustomer);
    setCustomerToEdit(null);
    toast({ title: 'Customer Updated', description: `${updatedCustomer.name}'s info has been updated.` });
  }

  const handleSelectCustomer = (customer: Customer) => {
    if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
    } else {
        setSelectedCustomer(customer);
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
    );
  }, [customers, customerSearchQuery]);
  
  const handleEditDoc = (docId: string) => {
    toast({
      title: 'Edit Document (Placeholder)',
      description: `In a real app, you would now be taken to the editor for this document.`,
    });
  }

  const getCustomerById = (id: string) => customers.find(c => c.id === id);


  return (
    <>
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Users className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
            <p className="text-sm text-muted-foreground">Add, view, and manage your customers and their documents.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Document Log</CardTitle>
                        {selectedCustomer ? (
                             <CardDescription className="flex items-center gap-2 mt-1">
                                Showing documents for: <Badge>{selectedCustomer.name}</Badge>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedCustomer(null)}><X className="h-4 w-4" /></Button>
                            </CardDescription>
                        ) : (
                             <CardDescription>All financial documents for all customers.</CardDescription>
                        )}
                    </div>
                     <Tabs value={docTypeFilter} onValueChange={(value) => setDocTypeFilter(value as any)}>
                        <TabsList>
                            <TabsTrigger value="All">All</TabsTrigger>
                            <TabsTrigger value="Quotation">Quotations</TabsTrigger>
                            <TabsTrigger value="Purchase Order">PO</TabsTrigger>
                            <TabsTrigger value="Tax Invoice">Invoices</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                          placeholder="Search by order # or customer name..."
                          value={docSearchQuery}
                          onChange={(e) => setDocSearchQuery(e.target.value)}
                          className="pl-9"
                      />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length > 0 ? (
                        documents.map(doc => {
                          const Icon = docTypeIcons[doc.type as DocumentType];
                          const customer = getCustomerById(doc.customerId);
                          return (
                            <TableRow key={doc.id}>
                              <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1.5">
                                  <Icon className="h-3 w-3" />
                                  {doc.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{doc.orderNumber}</TableCell>
                              <TableCell>{customer?.name || 'N/A'}</TableCell>
                              <TableCell>{format(new Date(doc.date), 'dd-MM-yyyy')}</TableCell>
                              <TableCell>${doc.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => customer && setPreviewDoc(doc)}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditDoc(doc.id)}><Edit className="h-4 w-4" /></Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No documents found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>All Customers</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsAddingCustomer(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New
              </Button>
            </CardHeader>
            <CardContent>
              {isAddingCustomer ? (
                <NewCustomerForm isDialog={false} onSubmit={handleAddNewCustomer} onCancel={() => setIsAddingCustomer(false)} />
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by customer name..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ul className="space-y-2 h-96 overflow-y-auto pr-2">
                    {filteredCustomers.map(customer => (
                      <li key={customer.id}>
                        <div
                            role="button"
                            tabIndex={0}
                            className={cn(
                                "w-full text-left p-3 rounded-lg border flex justify-between items-center transition-colors cursor-pointer",
                                selectedCustomer?.id === customer.id ? "bg-muted ring-2 ring-primary" : "hover:bg-muted/50"
                            )}
                            onClick={() => handleSelectCustomer(customer)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSelectCustomer(customer)}
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{customer.name}</p>
                            {customer.company && <p className="text-sm text-muted-foreground">{customer.company}</p>}
                          </div>
                           <div className="flex items-center gap-2">
                            <Badge variant="outline">{customer.customerCode}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setCustomerToEdit(customer); }}><Edit className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </li>
                    ))}
                    {filteredCustomers.length === 0 && <p className="text-muted-foreground text-center pt-4">No customers found.</p>}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
    {previewDoc && (
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        customer={getCustomerById(previewDoc.customerId)!}
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
  )
}
