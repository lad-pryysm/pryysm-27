
"use client"

import React, { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Upload } from 'lucide-react'
import type { Order } from './orders-client'
import Image from 'next/image'
import type { Customer } from '@/hooks/use-workspace'
import { useWorkspace } from '@/hooks/use-workspace'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const newOrderSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  orderNumber: z.string().min(1, 'Order Number is required'),
  projectCode: z.string().min(1, 'Project Code is required'),
  items: z.coerce.number().min(1, 'Items must be at least 1'),
  printerTech: z.string().min(1, 'Printer Technology is required'),
  orderDate: z.string().min(1, 'Order Date is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(['low', 'medium', 'high']),
  salesPerson: z.string().min(1, 'Sales Person is required'),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
})

type NewOrderFormValues = z.infer<typeof newOrderSchema>

interface NewOrderFormProps {
  onSubmit: (order: Omit<Order, 'id' | 'status'>) => void
  onCancel: () => void
  customers: Customer[]
}

export function NewOrderForm({
  onSubmit,
  onCancel,
  customers,
}: NewOrderFormProps) {
  const { idService } = useWorkspace()
  const today = format(new Date(), 'yyyy-MM-dd')

  const form = useForm<NewOrderFormValues>({
    resolver: zodResolver(newOrderSchema),
    defaultValues: {
      customer: '',
      orderNumber: '',
      projectCode: '',
      items: 1,
      printerTech: '',
      orderDate: today,
      deadline: today,
      priority: 'medium',
      salesPerson: '',
      notes: '',
      imageUrl: '',
    },
  })

  useEffect(() => {
    form.setValue('orderNumber', idService.getNextId('purchaseOrder'))
    form.setValue('projectCode', idService.getNextId('project'))
  }, [idService, form])

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          fieldChange(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = (data: NewOrderFormValues) => {
    onSubmit({
      ...data,
      priority: data.priority as 'low' | 'medium' | 'high',
    })
    form.reset();
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Plus className="text-primary h-5 w-5" />
          </div>
          <CardTitle>Create New Order</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.name}>
                              {customer.name} ({customer.company || 'Individual'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter order number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter unique project code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Items *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="printerTech"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>3D Printer Technology *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select printer technology" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FDM">
                            FDM (Fused Deposition Modeling)
                          </SelectItem>
                          <SelectItem value="SLA">
                            SLA (Stereolithography)
                          </SelectItem>
                          <SelectItem value="DLP">
                            DLP (Digital Light Processing)
                          </SelectItem>
                          <SelectItem value="SLS">
                            SLS (Selective Laser Sintering)
                          </SelectItem>
                          <SelectItem value="MJF">MJF (Multi Jet Fusion)</SelectItem>
                          <SelectItem value="EBM">EBM (Electron Beam Melting)</SelectItem>
                          <SelectItem value="DMLS">
                            DMLS (Direct Metal Laser Sintering)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sales Person *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sales person" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="John Smith">John Smith</SelectItem>
                          <SelectItem value="Sarah Johnson">
                            Sarah Johnson
                          </SelectItem>
                          <SelectItem value="Mike Davis">Mike Davis</SelectItem>
                          <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                          <SelectItem value="David Wilson">David Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <div className="mt-2 flex items-center gap-4">
                    {field.value ? (
                      <Image
                        src={field.value}
                        alt="Product"
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <FormControl>
                      <div>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, field.onChange)}
                        />
                        <label
                          htmlFor="image-upload"
                          className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'cursor-pointer'
                          )}
                        >
                          Upload Image
                        </label>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-8 flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Create Order</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
