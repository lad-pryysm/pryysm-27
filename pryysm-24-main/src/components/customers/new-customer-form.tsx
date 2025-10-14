

"use client"

import React from 'react'
import { useToast } from '@/hooks/use-toast'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
    name: z.string().min(1, 'Customer Name is required'),
    company: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    taxId: z.string().optional(),
    address: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewCustomerFormProps {
    onSubmit: (data: Omit<Customer, 'id' | 'customerCode'>) => void,
    onCancel: () => void,
    isDialog?: boolean,
}

export function NewCustomerForm({ onSubmit, onCancel, isDialog = true }: NewCustomerFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '', company: '', email: '', phone: '', taxId: '', address: '',
    },
  })

  const { register, handleSubmit, formState: { errors } } = form;

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
        ...data,
        address: data.address || '',
        phone: data.phone || ''
    });
    form.reset();
  }

  const formContent = (
     <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1">
        <Label htmlFor="cust-name">Customer Name *</Label>
        <Input id="cust-name" {...register('name')} placeholder="Enter customer name" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="cust-company">Company Name</Label>
        <Input id="cust-company" {...register('company')} placeholder="Enter company name" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="cust-email">Email *</Label>
        <Input id="cust-email" type="email" {...register('email')} placeholder="Enter email" />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="cust-phone">Phone</Label>
        <Input id="cust-phone" type="tel" {...register('phone')} placeholder="Enter phone number" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="cust-tax-id">Tax ID</Label>
        <Input id="cust-tax-id" {...register('taxId')} placeholder="Enter Tax ID" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="cust-address">Address</Label>
        <Textarea id="cust-address" {...register('address')} placeholder="Enter address" />
      </div>
       <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Customer</Button>
      </div>
    </form>
  )

  if (!isDialog) {
    return formContent;
  }

  return (
     <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                    Enter the details for the new customer below.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                {formContent}
            </div>
        </DialogContent>
    </Dialog>
  )
}

  