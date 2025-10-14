
"use client"

import React, { useEffect, useState } from 'react'
import { useForm, Controller, useFieldArray, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { NewJobData, Job, ItemGroup } from './types'
import { Upload, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { useWorkspace } from '@/hooks/use-workspace'
import { Switch } from '../ui/switch'
import { cn } from '@/lib/utils'
import { Separator } from '../ui/separator'

interface SubmitJobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewJobData) => void;
  jobToEdit?: Job | null;
}

const materialSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Material Name is required."),
  material: z.string().min(1, 'Material is required'),
  color: z.string().min(1, 'Color is required'),
  finish: z.string().min(1, 'Finish is required'),
  useCustom: z.boolean(),
});

const itemGroupSchema = z.object({
    id: z.string(),
    quantity: z.coerce.number().min(1, "Qty must be at least 1"),
    materials: z.array(materialSchema).min(1, "At least one material is required for an item group.")
});


const jobSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  projectCode: z.string().min(1, 'Project code is required'),
  estHoursPerItem: z.coerce.number().min(0, 'Hours must be non-negative'),
  estMinutesPerItem: z.coerce.number().min(0, 'Minutes must be 60 or less').max(59, 'Minutes must be 60 or less'),
  priority: z.enum(['Low', 'Medium', 'High']),
  deadline: z.string().min(1, 'Deadline is required'),
  requiredTechnology: z.string().min(1, 'Technology is required'),
  imageUrl: z.string().optional(),
  itemGroups: z.array(itemGroupSchema).min(1, "At least one item group is required."),
}).refine(data => data.estHoursPerItem > 0 || data.estMinutesPerItem > 0, {
    message: "Estimated time must be greater than 0.",
    path: ["estHoursPerItem"],
});


export function SubmitJobForm({ isOpen, onClose, onSubmit, jobToEdit }: SubmitJobFormProps) {
  const { toast } = useToast()
  
  const methods = useForm<Omit<NewJobData, 'items'>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: '',
      projectCode: '',
      estHoursPerItem: 0,
      estMinutesPerItem: 0,
      priority: 'Medium',
      deadline: format(new Date(), 'yyyy-MM-dd'),
      requiredTechnology: 'FDM',
      imageUrl: '',
      itemGroups: [{ 
          id: 'group-1', 
          quantity: 1, 
          materials: [{ id: 'mat-1', name: '', material: '', color: '', finish: '', useCustom: false }]
      }]
    },
  });

  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itemGroups"
  });

  useEffect(() => {
    if (jobToEdit) {
      const items = jobToEdit.items || 1;
      const timePerItemMinutes = jobToEdit.estimatedTime ? jobToEdit.estimatedTime / items : 0;
      const hours = Math.floor(timePerItemMinutes / 60);
      const minutes = Math.round(timePerItemMinutes % 60);
      
      reset({
        name: jobToEdit.name,
        projectCode: jobToEdit.projectCode,
        estHoursPerItem: hours,
        estMinutesPerItem: minutes,
        priority: jobToEdit.priority,
        deadline: format(new Date(jobToEdit.deadline), 'yyyy-MM-dd'),
        requiredTechnology: jobToEdit.requiredTechnology,
        imageUrl: jobToEdit.imageUrl || '',
        itemGroups: (jobToEdit.itemGroups && jobToEdit.itemGroups.length > 0) 
            ? jobToEdit.itemGroups 
            : [{ id: 'group-1', quantity: jobToEdit.items || 1, materials: []}]
      });
    } else {
      reset({
        name: '',
        projectCode: '',
        estHoursPerItem: 0,
        estMinutesPerItem: 0,
        priority: 'Medium',
        deadline: format(new Date(), 'yyyy-MM-dd'),
        requiredTechnology: 'FDM',
        imageUrl: '',
        itemGroups: [{ 
            id: 'group-1', 
            quantity: 1, 
            materials: [{ id: 'mat-1', name: '', material: '', color: '', finish: '', useCustom: false }]
        }]
      });
    }
  }, [jobToEdit, reset, isOpen]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setValue('imageUrl', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = (data: Omit<NewJobData, 'items'>) => {
    const totalItems = data.itemGroups.reduce((sum, group) => sum + group.quantity, 0);
    onSubmit({ ...data, items: totalItems });
  };

  const onTechnologyChange = (tech: string) => {
    setValue('requiredTechnology', tech);
    const groups = watch('itemGroups');
    groups.forEach((group, groupIndex) => {
        group.materials.forEach((_, materialIndex) => {
             setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.material`, '');
             setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.finish`, '');
             setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.name`, '');
             setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.color`, '');
        })
    });
  }

  const handleAddGroup = () => {
    append({ 
        id: `group-${Date.now()}`, 
        quantity: 1, 
        materials: [{ id: `mat-${Date.now()}`, name: '', material: '', finish: '', color: '', useCustom: false }] 
    });
  };
  
  const totalItems = watch('itemGroups').reduce((sum, group) => sum + (group.quantity || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{jobToEdit ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {jobToEdit ? 'update the' : 'add a new'} project to the queue.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="image-upload-job">Image</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                              {watch('imageUrl') ? (
                                  <Image src={watch('imageUrl')!} alt="Project Preview" width={80} height={80} className="object-cover rounded-md" />
                              ) : (
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                              )}
                          </div>
                          <Input id="image-upload-job" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          <Button asChild variant="outline">
                              <label htmlFor="image-upload-job" className="cursor-pointer">Upload Image</label>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="name">Project Name</Label>
                          <Input id="name" {...register('name')} />
                          {errors.name && <p className="text-sm text-destructive text-right">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="projectCode">Project Code</Label>
                          <Input id="projectCode" {...register('projectCode')} />
                          {errors.projectCode && <p className="text-sm text-destructive text-right">{errors.projectCode.message}</p>}
                      </div>
                  </div>

                  {/* Right Column */}
                   <div className="space-y-4">
                      <div className="space-y-2">
                          <Label>Est. Time per Item</Label>
                          <div className="grid grid-cols-2 gap-2">
                              <div>
                                  <Input id="estHoursPerItem" type="number" {...register('estHoursPerItem')} placeholder="Hours"/>
                              </div>
                              <div>
                                  <Input id="estMinutesPerItem" type="number" {...register('estMinutesPerItem')} placeholder="Minutes"/>
                              </div>
                          </div>
                          {(errors.estHoursPerItem || errors.estMinutesPerItem) && <p className="text-sm text-destructive">{errors.estHoursPerItem?.message || errors.estMinutesPerItem?.message}</p>}
                          <p className="text-xs text-muted-foreground">A 5% buffer will be automatically added to the start of the print.</p>
                      </div>

                       <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Controller name="priority" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select>)} />
                      </div>
                  </div>
              </div>

              <Separator/>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                   <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input id="deadline" type="date" {...register('deadline')} />
                      {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="technology">Technology</Label>
                      <Controller name="requiredTechnology" control={control} render={({ field }) => (<Select onValueChange={(v) => onTechnologyChange(v)} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="FDM">FDM</SelectItem><SelectItem value="SLA">SLA</SelectItem><SelectItem value="SLS">SLS</SelectItem><SelectItem value="DLP">DLP</SelectItem><SelectItem value="MJF">MJF</SelectItem></SelectContent></Select>)}/>
                  </div>
              </div>
              
              <Separator/>

              <div>
                  <div className="flex items-center justify-between mb-4">
                      <div>
                          <Label className="text-lg font-semibold">Project Items & Materials</Label>
                           {errors.itemGroups && !errors.itemGroups.message && <p className="text-sm text-destructive">Please check errors in the item groups below.</p>}
                          {errors.itemGroups && errors.itemGroups.message && <p className="text-sm text-destructive">{errors.itemGroups.message}</p>}
                      </div>
                      <p className="text-sm font-medium">Total Items in Project: <span className="text-primary font-bold">{totalItems}</span></p>
                  </div>
                  
                  <div className="space-y-4">
                      {fields.map((field, index) => (
                          <ItemGroupBlock 
                              key={field.id} 
                              groupIndex={index}
                              removeGroup={remove}
                              showRemoveButton={fields.length > 1}
                              errors={errors.itemGroups?.[index]}
                          />
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddGroup} className="mt-2">
                          <Plus className="mr-2 h-4 w-4"/> Add Item Group
                      </Button>
                  </div>
              </div>
              
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{jobToEdit ? 'Save Changes' : 'Add Project'}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

const ItemGroupBlock = ({ groupIndex, removeGroup, showRemoveButton, errors }: any) => {
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `itemGroups.${groupIndex}.materials`
    });

    const handleAddMaterial = () => {
        append({ id: `mat-${Date.now()}`, name: '', material: '', finish: '', color: '', useCustom: false });
    }

    return (
        <div className="p-4 border rounded-lg relative bg-muted/30">
             {showRemoveButton && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeGroup(groupIndex)}>
                    <Trash2 className="h-4 w-4"/>
                </Button>
            )}
             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                 <div className="space-y-2 md:col-span-1">
                    <Label>Item Quantity</Label>
                    <Input type="number" {...register(`itemGroups.${groupIndex}.quantity`)} />
                    {errors?.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-4 md:col-span-4">
                    {errors?.materials && !errors.materials.message && <p className="text-sm text-destructive">Please check errors in the materials below.</p>}
                    {errors?.materials && errors.materials.message && <p className="text-sm text-destructive">{errors.materials.message}</p>}
                    {fields.map((field, materialIndex) => (
                        <MaterialConfigBlock 
                            key={field.id}
                            groupIndex={groupIndex}
                            materialIndex={materialIndex}
                            removeMaterial={remove}
                            showRemoveButton={fields.length > 1}
                            errors={errors?.materials?.[materialIndex]}
                        />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddMaterial}>
                        <Plus className="mr-2 h-4 w-4"/> Add Material to this Item
                    </Button>
                </div>
             </div>
        </div>
    )
}

const MaterialConfigBlock = ({ groupIndex, materialIndex, removeMaterial, showRemoveButton, errors }: any) => {
    const { getAvailableMaterialsForTechnology, getAvailableFinishesForMaterial, getAvailableMaterialNames, getMaterialColor } = useWorkspace();
    const { watch, setValue, control, register } = useFormContext();

    const selectedTechnology = watch('requiredTechnology');
    const useCustomMaterial = watch(`itemGroups.${groupIndex}.materials.${materialIndex}.useCustom`);
    const selectedMaterialType = watch(`itemGroups.${groupIndex}.materials.${materialIndex}.material`);
    const selectedFinish = watch(`itemGroups.${groupIndex}.materials.${materialIndex}.finish`);

    const availableMaterials = getAvailableMaterialsForTechnology(selectedTechnology);
    const availableFinishes = getAvailableFinishesForMaterial(selectedTechnology, selectedMaterialType);
    const availableNames = getAvailableMaterialNames(selectedTechnology, selectedMaterialType, selectedFinish);

    const onMaterialTypeChange = (v: string) => {
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.material`, v);
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.finish`, '');
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.name`, '');
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.color`, '');
    }

    const onFinishChange = (v: string) => {
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.finish`, v);
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.name`, '');
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.color`, '');
    }

    const onNameChange = (v: string) => {
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.name`, v);
        const color = getMaterialColor(v);
        setValue(`itemGroups.${groupIndex}.materials.${materialIndex}.color`, color || '');
    }

    return (
        <div className="p-3 border rounded-md relative bg-background">
            {showRemoveButton && (
                <Button type="button" variant="ghost" size="icon" className="absolute -top-1 -right-1 h-6 w-6 text-destructive" onClick={() => removeMaterial(materialIndex)}>
                    <Trash2 className="h-3 w-3"/>
                </Button>
            )}
            <div className="space-y-2">
                <div className="flex items-center justify-end">
                    <div className="flex items-center space-x-2">
                        <Label htmlFor={`customToggle-${groupIndex}-${materialIndex}`} className="text-xs">Custom Material</Label>
                        <Controller name={`itemGroups.${groupIndex}.materials.${materialIndex}.useCustom`} control={control} render={({ field }) => <Switch id={`customToggle-${groupIndex}-${materialIndex}`} checked={field.value} onCheckedChange={field.onChange} />} />
                    </div>
                </div>
                {!useCustomMaterial ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Controller name={`itemGroups.${groupIndex}.materials.${materialIndex}.material`} control={control} render={({ field }) => ( <Select onValueChange={(v) => onMaterialTypeChange(v)} value={field.value}><SelectTrigger><SelectValue placeholder="Material Type" /></SelectTrigger><SelectContent>{availableMaterials.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select> )}/>
                        <Controller name={`itemGroups.${groupIndex}.materials.${materialIndex}.finish`} control={control} render={({ field }) => ( <Select onValueChange={(v) => onFinishChange(v)} value={field.value} disabled={!selectedMaterialType}><SelectTrigger><SelectValue placeholder="Finish" /></SelectTrigger><SelectContent>{availableFinishes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select> )}/>
                        <Controller name={`itemGroups.${groupIndex}.materials.${materialIndex}.name`} control={control} render={({ field }) => (
                            <Select onValueChange={(v) => onNameChange(v)} value={field.value} disabled={!selectedFinish}>
                                <SelectTrigger><SelectValue placeholder="Material Name" /></SelectTrigger>
                                <SelectContent>
                                    {availableNames.map(n => <SelectItem key={n.name} value={n.name}>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: n.color }} />
                                            {n.name} ({n.stock})
                                        </div>
                                    </SelectItem>)}
                                </SelectContent>
                            </Select> 
                        )}/>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <Input {...register(`itemGroups.${groupIndex}.materials.${materialIndex}.material`)} placeholder="Material Type"/>
                        <Input {...register(`itemGroups.${groupIndex}.materials.${materialIndex}.finish`)} placeholder="Finish"/>
                        <Input {...register(`itemGroups.${groupIndex}.materials.${materialIndex}.name`)} placeholder="Material Name"/>
                        <Input type="color" {...register(`itemGroups.${groupIndex}.materials.${materialIndex}.color`)} placeholder="Color"/>
                    </div>
                )}
                {(errors?.material || errors?.finish || errors?.name || errors?.color) && 
                    <p className="text-sm text-destructive">All material fields are required.</p>
                }
            </div>
        </div>
    )
}
