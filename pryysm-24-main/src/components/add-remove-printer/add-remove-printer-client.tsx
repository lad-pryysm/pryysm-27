
"use client"

import React, { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2, PlusCircle, Printer as PrinterIcon, CalendarIcon, Server, Zap, Wrench, XCircle, ShieldOff, CheckCircle, Droplets, Sparkles, Diamond } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReplacementAnalysis } from './replacement-analysis'
import { useWorkspace } from '@/hooks/use-workspace'
import type { Printer, PrinterStatus, PrinterTechnology } from '@/hooks/use-workspace'
import { Progress } from '../ui/progress'

const technologyTypes: PrinterTechnology[] = ['FDM', 'SLA', 'SLS', 'DLP', 'MJF', 'EBM', 'DMLS'];
const filterStatusOptions: ('printing' | 'idle' | 'maintenance' | 'offline')[] = ['printing', 'idle', 'maintenance', 'offline'];

const statusBorderColors: { [key in PrinterStatus]: string } = {
    printing: 'border-l-4 border-green-500',
    idle: 'border-l-4 border-blue-500',
    offline: 'border-l-4 border-red-500',
    maintenance: 'border-l-4 border-yellow-500',
    running: 'border-l-4 border-green-500', // Fallback
};
const statusTextColors: { [key in PrinterStatus]: string } = {
    printing: 'text-green-600 bg-green-100',
    idle: 'text-blue-600 bg-blue-100',
    offline: 'text-red-600 bg-red-100',
    maintenance: 'text-yellow-600 bg-yellow-100',
    running: 'text-green-600 bg-green-100', // Fallback
};
const technologyIcons: { [key in PrinterTechnology]: React.ElementType } = {
    'FDM': PrinterIcon,
    'SLA': Droplets,
    'DLP': Droplets,
    'SLS': Sparkles,
    'MJF': Sparkles,
    'EBM': Diamond,
    'DMLS': Diamond,
};


export function AddRemovePrinterClient() {
  const { toast } = useToast();
  const { printers, addPrinter, deletePrinter, updatePrinterStatus, idService } = useWorkspace();
  
  const [name, setName] = useState('Prusa i3 MK3S+');
  const [model, setModel] = useState('i3 MK3S+');
  const [codeName, setCodeName] = useState('');
  const [location, setLocation] = useState('Lab 1');
  const [technology, setTechnology] = useState<PrinterTechnology>('FDM');
  const [initializationDate, setInitializationDate] = useState<Date | undefined>(new Date());
  const [capacity, setCapacity] = useState('Standard');
  const [material, setMaterial] = useState('PLA');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'printing' | 'idle' | 'maintenance' | 'offline'>('all');
  
  React.useEffect(() => {
    if (isAddModalOpen && !codeName) {
        setCodeName(idService.getNextId('printer'));
    }
  }, [idService, codeName, isAddModalOpen]);

  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !model || !location || !technology || !initializationDate || !codeName || !capacity || !material) {
        toast({ title: "Missing Fields", description: "Please fill out all fields to add a printer.", variant: "destructive" });
        return;
    }
    const newPrinter: Omit<Printer, 'id' | 'status' | 'completionEstimate' | 'idleSince' | 'utilization' | 'currentJob' | 'currentJobImage'> = {
      name,
      model,
      codeName,
      location,
      technology,
      initializationDate,
      capacity,
      material,
    }
    addPrinter(newPrinter);
    toast({ title: "Printer Added", description: `${name} has been added to the fleet.`});
    
    // Reset form
    setName('');
    setModel('');
    setCodeName('');
    setLocation('');
    setInitializationDate(new Date());
    setCapacity('Standard');
    setMaterial('PLA');
    setIsAddModalOpen(false);
  }

  const handleRemovePrinter = (id: string) => {
    const printerToRemove = printers.find(p => p.id === id);
    deletePrinter(id);
    toast({ title: "Printer Removed", description: `${printerToRemove?.name} has been removed from the fleet.`, variant: 'destructive'});
  }

  const handleStatusChange = (id: string, newStatus: PrinterStatus) => {
    const printer = printers.find(p => p.id === id);
    if (!printer) return;
    
    if (printer.status === 'printing' && (newStatus === 'maintenance' || newStatus === 'offline')) {
        toast({
            variant: "destructive",
            title: "Action Denied",
            description: "Cannot change status while printer is active.",
        });
        return;
    }

    updatePrinterStatus(id, newStatus);
    toast({
      title: 'Status Updated',
      description: `${printer.name} is now ${newStatus}.`,
    });
  };
  
  const filteredPrinters = useMemo(() => {
    if (statusFilter === 'all') {
      return printers;
    }
    return printers.filter(printer => {
      if (statusFilter === 'printing') {
        return printer.status === 'printing' || printer.status === 'running';
      }
      return printer.status === statusFilter;
    });
  }, [printers, statusFilter]);


  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
       <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
            <PrinterIcon className="h-10 w-10" /> Printer Fleet Management
        </h1>
      </div>
      
      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
          <TabsTrigger value="manage">Manage Fleet</TabsTrigger>
          <TabsTrigger value="replace">Replacement Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="mt-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <PrinterIcon className="text-primary" />
                                Printer Fleet ({printers.length})
                            </CardTitle>
                            <CardDescription className="mt-1">Your current list of printers.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {filterStatusOptions.map(status => (
                                        <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={() => setIsAddModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add Printer
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPrinters.map(printer => {
                            const TechIcon = technologyIcons[printer.technology] || PrinterIcon;
                            return (
                            <Card key={printer.id} className={`${statusBorderColors[printer.status]}`}>
                                <CardHeader className="p-4">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <TechIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate">{printer.name}</span>
                                        </CardTitle>
                                        <div className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${statusTextColors[printer.status]}`}>
                                            {printer.status}
                                        </div>
                                    </div>
                                    {printer.currentJob && (
                                        <div className="text-xs text-muted-foreground pt-1 truncate">
                                            Printing: <span className="font-semibold text-foreground">{printer.currentJob.name}</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="px-4 pb-3 text-xs text-muted-foreground space-y-1">
                                    {printer.currentJob && printer.currentJob.progress !== null && (
                                        <div className="space-y-1">
                                            <Progress value={printer.currentJob.progress} className="h-1.5" />
                                            <p className="text-xs text-right">{printer.currentJob.progress.toFixed(0)}% complete</p>
                                        </div>
                                    )}
                                    <p><span className="font-medium text-foreground">Code:</span> {printer.codeName} | <span className="font-medium text-foreground">Location:</span> {printer.location}</p>
                                    <div className="flex items-center pt-1 text-xs">
                                        <CalendarIcon className="mr-2 h-3 w-3 opacity-70" />
                                        <span className="font-medium text-foreground mr-1">Initialized:</span> {format(new Date(printer.initializationDate), "dd-MM-yyyy")}
                                    </div>
                                </CardContent>
                                <div className="px-4 pb-3 grid grid-cols-2 gap-2 mt-auto">
                                    {printer.status === 'idle' || printer.status === 'printing' ? (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(printer.id, 'maintenance')}><Wrench className="mr-1 h-3 w-3 text-yellow-500" />Maint.</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(printer.id, 'offline')}><ShieldOff className="mr-1 h-3 w-3 text-red-500" />Offline</Button>
                                        </>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(printer.id, 'idle')} className="col-span-2"><CheckCircle className="mr-1 h-3 w-3 text-green-500" />Set to Idle</Button>
                                    )}
                                    <Button variant="destructive" size="sm" onClick={() => handleRemovePrinter(printer.id)} className="col-span-2"><Trash2 className="mr-2 h-4 w-4" />Remove</Button>
                                </div>
                            </Card>
                        )})}
                        {filteredPrinters.length === 0 && (
                            <div className="col-span-full text-center text-muted-foreground py-12">
                                <p>No printers match the selected status.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="replace" className="mt-6">
            <ReplacementAnalysis />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Add New Printer</DialogTitle>
                <DialogDescription>Enter the details for the new printer.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPrinter}>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="printer-name">Printer Name</Label>
                        <Input id="printer-name" placeholder="e.g., Prusa i3 MK3S+" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printer-model">Model</Label>
                        <Input id="printer-model" placeholder="e.g., i3 MK3S+" value={model} onChange={e => setModel(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printer-codename">Code Name</Label>
                        <Input id="printer-codename" placeholder="e.g., PRUSA02" value={codeName} onChange={e => setCodeName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printer-location">Location</Label>
                        <Input id="printer-location" placeholder="e.g., Lab 1" value={location} onChange={e => setLocation(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printer-type">Printer Type</Label>
                        <Select onValueChange={(v) => setTechnology(v as PrinterTechnology)} value={technology} required>
                            <SelectTrigger id="printer-type">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {technologyTypes.map(tech => (
                                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="printer-capacity">Capacity</Label>
                        <Input id="printer-capacity" placeholder="e.g., Standard" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="printer-material">Default Material</Label>
                        <Input id="printer-material" placeholder="e.g., PLA" value={material} onChange={e => setMaterial(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="initialization-date">Initialization Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="initialization-date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !initializationDate && "text-muted-foreground"
                                    )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {initializationDate ? format(initializationDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={initializationDate}
                                onSelect={setInitializationDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Printer</Button>
                </DialogFooter>
              </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

    