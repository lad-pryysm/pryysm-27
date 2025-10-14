
"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Customer } from '@/hooks/use-workspace'

interface EditCustomerFormProps {
    customer: Customer;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (customer: Customer) => void;
}

export function EditCustomerForm({ customer, isOpen, onClose, onSubmit }: EditCustomerFormProps) {
    const [customerCode, setCustomerCode] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [taxId, setTaxId] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (customer) {
            setCustomerCode(customer.customerCode);
            setName(customer.name);
            setCompany(customer.company || '');
            setEmail(customer.email);
            setPhone(customer.phone || '');
            setTaxId(customer.taxId || '');
            setAddress(customer.address || '');
        }
    }, [customer, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !customerCode) {
            alert('Customer Code, Name and Email are required.');
            return;
        }
        onSubmit({ id: customer.id, customerCode, name, company, email, phone, taxId, address });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Edit Customer: {customer.name}</DialogTitle>
                    <DialogDescription>
                        Update the details for this customer. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <Label htmlFor="edit-cust-code">Customer Code</Label>
                        <Input id="edit-cust-code" value={customerCode} onChange={e => setCustomerCode(e.target.value)} required placeholder="Enter customer code" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-cust-name">Customer Name</Label>
                        <Input id="edit-cust-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Enter customer name" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-cust-company">Company Name</Label>
                        <Input id="edit-cust-company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Enter company name" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-cust-email">Email</Label>
                        <Input id="edit-cust-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter email" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-cust-phone">Phone</Label>
                        <Input id="edit-cust-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-cust-tax-id">Tax ID</Label>
                        <Input id="edit-cust-tax-id" value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="Enter Tax ID" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="edit-cust-address">Address</Label>
                        <Textarea id="edit-cust-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter address" />
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
