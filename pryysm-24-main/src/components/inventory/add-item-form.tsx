
"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { InventoryItem } from '@/hooks/use-workspace'
import Image from 'next/image'

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Upload, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CameraCaptureModal } from '../shared/camera-capture-modal'

interface AddItemFormProps {
    onSubmit: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.enum(["Packing Material", "Electronics", "Tools", "Miscellaneous"]),
  quantity: z.coerce.number().min(0, { message: "Quantity can't be negative." }),
  minStock: z.coerce.number().min(0, { message: "Min Stock can't be negative." }),
  location: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
})

export function AddItemForm({ onSubmit }: AddItemFormProps) {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "Miscellaneous",
      quantity: 0,
      minStock: 0,
      location: "",
      description: "",
      imageUrl: "",
    },
  })

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values as any);
    form.reset();
  }
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        fieldChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imageDataUrl: string) => {
    form.setValue('imageUrl', imageDataUrl);
    setIsCameraModalOpen(false);
  };


  return (
    <>
    <div className="grid grid-cols-1">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Manually Add New Inventory Item</CardTitle>
                    <CardDescription>Use this form to add items that do not have a barcode.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Item Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter item name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Category *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Packing Material">Packing Material</SelectItem>
                                            <SelectItem value="Electronics">Electronics</SelectItem>
                                            <SelectItem value="Tools">Tools</SelectItem>
                                            <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                           </div>

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Image</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                                                    {field.value ? (
                                                        <Image src={field.value} alt="Item Preview" width={96} height={96} className="object-cover rounded-md" />
                                                    ) : (
                                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Input id="image-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e, field.onChange)} />
                                                    <label htmlFor="image-upload" className={cn(buttonVariants({ variant: 'outline' }), "cursor-pointer")}>
                                                       <Upload className="mr-2 h-4 w-4" /> Upload Image
                                                    </label>
                                                     <Button type="button" variant="outline" onClick={() => setIsCameraModalOpen(true)}>
                                                        <Camera className="mr-2 h-4 w-4"/> Use Camera
                                                    </Button>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Quantity *</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <FormField
                                control={form.control}
                                name="minStock"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Minimum Stock Level</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                           </div>
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Shelf A-1, Drawer B-2" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                           <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter a brief description of the item" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                          <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
                            <Button type="submit">Add Item to Inventory</Button>
                          </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
    <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCapture}
    />
    </>
  )
}

    