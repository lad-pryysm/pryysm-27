
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter as ModalFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Pencil, ClipboardList, Repeat, Layers3, Droplet, Sparkles, LayoutDashboard } from 'lucide-react';
import { useWorkspace, type Spool, type Resin, type Powder, type MaterialStatus, type Currency } from '@/hooks/use-workspace';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RawMaterialDashboard } from './raw-material-dashboard';
import { ReorderManagement } from './reorder-management';
import { ScanAndAdd } from './scan-and-add';

const exchangeRates: Record<Currency, number> = { 'USD': 1, 'EUR': 0.93, 'AED': 3.67, 'INR': 83.33 };
export const currencySymbols: Record<Currency, string> = { 'USD': '$', 'EUR': '€', 'AED': 'AED', 'INR': '₹' };

const calculateStatus = (used: number, total: number): MaterialStatus => {
    if (total <= 0) return 'Empty';
    if (used >= total) return 'Empty';
    const remainingPercent = ((total - used) / total) * 100;
    if (remainingPercent <= 10) return 'Critical';
    if (remainingPercent <= 30) return 'Low';
    if (used === 0) return 'New';
    return 'Active';
}

const statusBadgeColors: Record<MaterialStatus, string> = {
    "New": "bg-sky-100 text-sky-800",
    "Active": "bg-green-100 text-green-800",
    "Low": "bg-yellow-100 text-yellow-800",
    "Critical": "bg-red-100 text-red-800",
    "Empty": "bg-gray-100 text-gray-800",
    "Need Reorder": "bg-pink-100 text-pink-800",
};

interface GroupedSpool {
    key: string;
    name: string;
    brand: string;
    material: string;
    color: string;
    finish: string;
    count: number;
    totalWeight: number;
    totalUsed: number;
    status: MaterialStatus;
    spools: Spool[];
}
interface GroupedResin {
    key: string;
    name: string;
    brand: string;
    type: string;
    color: string;
    count: number;
    totalVolume: number;
    totalUsed: number;
    status: MaterialStatus;
    resins: Resin[];
}
interface GroupedPowder {
    key: string;
    name: string;
    brand: string;
    material: string;
    color: string;
    count: number;
    totalWeight: number;
    totalUsed: number;
    status: MaterialStatus;
    powders: Powder[];
}


export function RawMaterialClient() {
    const { toast } = useToast();
    const { 
        spools, setSpools,
        resins, setResins,
        powders, setPowders,
        idService,
    } = useWorkspace();
    
    const [activeTab, setActiveTab] = useState("dashboard");

    const [isSpoolModalOpen, setSpoolModalOpen] = useState(false);
    const [isResinModalOpen, setResinModalOpen] = useState(false);
    const [isPowderModalOpen, setPowderModalOpen] = useState(false);
    
    const [editingSpool, setEditingSpool] = useState<GroupedSpool | null>(null);
    const [editingResin, setEditingResin] = useState<GroupedResin | null>(null);
    const [editingPowder, setEditingPowder] = useState<GroupedPowder | null>(null);
    
    const [filters, setFilters] = useState({
        filaments: { search: '', material: 'all', brand: 'all', finish: 'all' },
        resins: { search: '', type: 'all', brand: 'all' },
        powders: { search: '', material: 'all', brand: 'all' }
    });
    const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
    
    const formatCurrency = (amount: number, fromCurrency: keyof typeof exchangeRates) => {
        const amountInUSD = amount / exchangeRates[fromCurrency];
        const convertedAmount = amountInUSD * exchangeRates[displayCurrency];
        return `${currencySymbols[displayCurrency]}${convertedAmount.toFixed(2)}`;
    };

     const handleFilterChange = (tab: 'filaments' | 'resins' | 'powders', filterName: string, value: string) => {
        setFilters(prev => ({ 
            ...prev, 
            [tab]: {
                ...prev[tab],
                [filterName]: value
            }
        }));
    };
    
    const openSpoolModal = (spoolGroup: GroupedSpool | null) => { setEditingSpool(spoolGroup); setSpoolModalOpen(true); };
    const openResinModal = (resinGroup: GroupedResin | null) => { setEditingResin(resinGroup); setResinModalOpen(true); };
    const openPowderModal = (powderGroup: GroupedPowder | null) => { setEditingPowder(powderGroup); setPowderModalOpen(true); };

    const handleSaveSpool = (data: Omit<Spool, 'id' | 'spoolId' | 'status' | 'assignedToPrinterId' | 'assignedToJobId'>, count: number) => {
        if (editingSpool) {
            const updatedSpools = spools.map(s => {
                const groupKey = `${s.name}-${s.brand}-${s.material}-${s.color}-${s.finish}`;
                if (groupKey === editingSpool.key) {
                    return { ...s, ...data };
                }
                return s;
            });
            setSpools(updatedSpools);
            toast({ title: "Spool Group Updated", description: `${data.name} has been updated.`});
        } else {
             const newSpools: Spool[] = [];
            for (let i = 0; i < count; i++) {
                const newSpool: Spool = {
                    ...data, id: Date.now() + i, spoolId: idService.getNextId('spool'), status: 'New', assignedToPrinterId: undefined, assignedToJobId: undefined
                };
                newSpools.push(newSpool);
            }
            setSpools(prev => [...prev, ...newSpools]);
            toast({ title: "Spool(s) Added", description: `${count} new spool(s) of ${data.name} have been added.`});
        }
        setSpoolModalOpen(false);
        setEditingSpool(null);
    };

    const handleSaveResin = (data: Omit<Resin, 'id' | 'resinId' | 'status' | 'assignedToPrinterId' | 'assignedToJobId'>, count: number) => {
        if (editingResin) {
            const updatedResins = resins.map(r => {
                const groupKey = `${r.name}-${r.brand}-${r.type}-${r.color}`;
                if (groupKey === editingResin.key) {
                     return { ...r, ...data };
                }
                return r;
            });
            setResins(updatedResins);
            toast({ title: 'Resin Group Updated' });
        } else {
            const newResins: Resin[] = [];
            for (let i = 0; i < count; i++) {
                const newResin: Resin = {
                    ...data, id: Date.now() + i, resinId: idService.getNextId('resin'), status: 'New', assignedToPrinterId: undefined, assignedToJobId: undefined
                };
                newResins.push(newResin);
            }
            setResins(prev => [...prev, ...newResins]);
            toast({ title: 'Resin(s) Added' });
        }
        setResinModalOpen(false);
        setEditingResin(null);
    };

    const handleSavePowder = (data: Omit<Powder, 'id' | 'powderId' | 'status' | 'assignedToPrinterId' | 'assignedToJobId'>, count: number) => {
       if (editingPowder) {
            const updatedPowders = powders.map(p => {
                const groupKey = `${p.name}-${p.brand}-${p.material}-${p.color}`;
                if (groupKey === editingPowder.key) {
                    return { ...p, ...data };
                }
                return p;
            });
            setPowders(updatedPowders);
            toast({ title: "Powder Group Updated", description: `${data.name} has been updated.`});
        } else {
             const newPowders: Powder[] = [];
            for (let i = 0; i < count; i++) {
                const newPowder: Powder = {
                    ...data, id: Date.now() + i, powderId: idService.getNextId('powder'), status: 'New', assignedToPrinterId: undefined, assignedToJobId: undefined
                };
                newPowders.push(newPowder);
            }
            setPowders(prev => [...prev, ...newPowders]);
            toast({ title: "Powder(s) Added", description: `${count} new powder batch(es) of ${data.name} have been added.`});
        }
        setPowderModalOpen(false);
        setEditingPowder(null);
    };
    
    const handleDeleteSpoolGroup = (groupKey: string) => {
        setSpools(prev => prev.filter(s => {
            const key = `${s.name}-${s.brand}-${s.material}-${s.color}-${s.finish}`;
            return key !== groupKey;
        }));
        toast({ title: 'Spool Group Deleted', variant: 'destructive' });
    }
    
    const handleDeleteResinGroup = (groupKey: string) => {
        setResins(prev => prev.filter(r => {
             const key = `${r.name}-${r.brand}-${r.type}-${r.color}`;
             return key !== groupKey;
        }));
        toast({ title: 'Resin Group Deleted', variant: 'destructive' });
    }
    
    const handleDeletePowderGroup = (groupKey: string) => {
         setPowders(prev => prev.filter(p => {
            const key = `${p.name}-${p.brand}-${p.material}-${p.color}`;
            return key !== groupKey;
        }));
        toast({ title: 'Powder Group Deleted', variant: 'destructive' });
    }
    
    const handleMarkGroupForReorder = (type: 'spool' | 'resin' | 'powder', groupKey: string) => {
        const updater = (items: any[]) => items.map(item => {
            let key;
            if (type === 'spool') key = `${item.name}-${item.brand}-${item.material}-${item.color}-${item.finish}`;
            else if (type === 'resin') key = `${item.name}-${item.brand}-${item.type}-${item.color}`;
            else key = `${item.name}-${item.brand}-${item.material}-${item.color}`;

            if (key === groupKey) return { ...item, status: 'Need Reorder' as MaterialStatus };
            return item;
        });

        if (type === 'spool') setSpools(updater);
        else if (type === 'resin') setResins(updater);
        else if (type === 'powder') setPowders(updater);
        
        toast({ title: "Marked for Reorder", description: "The item group has been added to the reorder list." });
    };

    const uniqueValues = (key: keyof Spool | keyof Resin | keyof Powder, materialType: 'spool' | 'resin' | 'powder') => {
        const items = materialType === 'spool' ? spools : materialType === 'resin' ? resins : powders;
        if (!items) return [];
        return [...new Set(items.map(s => String(s[key as keyof typeof s])))];
    };

    const groupedSpools = useMemo(() => {
        const groups: { [key: string]: GroupedSpool } = {};
        spools.forEach(spool => {
            if (!spool || !spool.name || !spool.brand || !spool.material || !spool.color || !spool.finish) return;
            const key = `${spool.name}-${spool.brand}-${spool.material}-${spool.color}-${spool.finish}`;
            if (!groups[key]) {
                groups[key] = { key, name: spool.name, brand: spool.brand, material: spool.material, color: spool.color, finish: spool.finish, count: 0, totalWeight: 0, totalUsed: 0, status: 'New', spools: [] };
            }
            groups[key].count++;
            groups[key].totalWeight += spool.weight;
            groups[key].totalUsed += spool.used;
            groups[key].spools.push(spool);
        });
        Object.values(groups).forEach(group => {
            const avgStatus = calculateStatus(group.totalUsed, group.totalWeight);
            const needsReorder = group.spools.some(s => s.status === 'Need Reorder');
            group.status = needsReorder ? 'Need Reorder' : avgStatus;
        });
        return Object.values(groups).filter(g => {
            const f = filters.filaments;
            if (!f) return true;
            const search = f.search.toLowerCase();
            return (
                (g.name?.toLowerCase().includes(search) || g.brand?.toLowerCase().includes(search)) &&
                (f.material === 'all' || g.material === f.material) &&
                (f.brand === 'all' || g.brand === f.brand) &&
                (f.finish === 'all' || g.finish === f.finish)
            );
        });
    }, [spools, filters.filaments]);

     const groupedResins = useMemo(() => {
        const groups: { [key: string]: GroupedResin } = {};
        resins.forEach(resin => {
            if (!resin || !resin.name || !resin.brand || !resin.type || !resin.color) return;
            const key = `${resin.name}-${resin.brand}-${resin.type}-${resin.color}`;
            if (!groups[key]) {
                groups[key] = { key, name: resin.name, brand: resin.brand, type: resin.type, color: resin.color, count: 0, totalVolume: 0, totalUsed: 0, status: 'New', resins: [] };
            }
            groups[key].count++;
            groups[key].totalVolume += resin.volume;
            groups[key].totalUsed += resin.used;
            groups[key].resins.push(resin);
        });
        Object.values(groups).forEach(group => {
            const avgStatus = calculateStatus(group.totalUsed, group.totalVolume);
            const needsReorder = group.resins.some(s => s.status === 'Need Reorder');
            group.status = needsReorder ? 'Need Reorder' : avgStatus;
        });
        return Object.values(groups).filter(g => {
            const f = filters.resins;
            if (!f) return true;
            const search = f.search.toLowerCase();
            return (
                (g.name?.toLowerCase().includes(search) || g.brand?.toLowerCase().includes(search)) &&
                (f.brand === 'all' || g.brand === f.brand) &&
                (f.type === 'all' || g.type === f.type)
            );
        });
    }, [resins, filters.resins]);

     const groupedPowders = useMemo(() => {
        const groups: { [key: string]: GroupedPowder } = {};
        powders.forEach(powder => {
            if (!powder || !powder.name || !powder.brand || !powder.material || !powder.color) return;
            const key = `${powder.name}-${powder.brand}-${powder.material}-${powder.color}`;
            if (!groups[key]) {
                groups[key] = { key, name: powder.name, brand: powder.brand, material: powder.material, color: powder.color, count: 0, totalWeight: 0, totalUsed: 0, status: 'New', powders: [] };
            }
            groups[key].count++;
            groups[key].totalWeight += powder.weight;
            groups[key].totalUsed += powder.used;
            groups[key].powders.push(powder);
        });
        Object.values(groups).forEach(group => {
            const avgStatus = calculateStatus(group.totalUsed, group.totalWeight);
            const needsReorder = group.powders.some(s => s.status === 'Need Reorder');
            group.status = needsReorder ? 'Need Reorder' : avgStatus;
        });
        return Object.values(groups).filter(g => {
            const f = filters.powders;
            if (!f) return true;
            const search = f.search.toLowerCase();
            return (
                (g.name?.toLowerCase().includes(search) || g.brand?.toLowerCase().includes(search)) &&
                (f.brand === 'all' || g.brand === f.brand) &&
                (f.material === 'all' || g.material === f.material)
            );
        });
    }, [powders, filters.powders]);


    const stats = useMemo(() => {
        const getStats = (type: 'spool'|'resin'|'powder') => {
            let groups: any[];
            if (type === 'spool') groups = groupedSpools;
            else if (type === 'resin') groups = groupedResins;
            else groups = groupedPowders;

            const totalValue = groups.reduce((acc, g) => {
                const items = g.spools || g.resins || g.powders;
                return acc + items.reduce((sum: number, item: any) => sum + item.price, 0);
            }, 0);

            return {
                total: groups.length,
                value: totalValue,
                remaining: groups.filter(g => g.status !== 'Empty').length,
                critical: groups.filter(g => g.status === 'Critical').length,
            };
        };
        return {
            filaments: getStats('spool'),
            resins: getStats('resin'),
            powders: getStats('powder'),
        };
    }, [groupedSpools, groupedResins, groupedPowders]);

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg"><ClipboardList className="text-primary h-6 w-6" /></div>
                    <div><h1 className="text-2xl font-bold text-foreground">Raw Material Inventory</h1><p className="text-sm text-muted-foreground">Manage all your 3D printing materials</p></div>
                </div>
                 <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-card border rounded-full p-1 shadow-sm">
                      {(['USD', 'EUR', 'AED', 'INR'] as const).map((c) => (
                        <Button
                          key={c}
                          variant={displayCurrency === c ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setDisplayCurrency(c)}
                          className="rounded-full px-4"
                        >
                          {c}
                        </Button>
                      ))}
                    </div>
                </div>
            </header>

             <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                    <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2"/>Dashboard</TabsTrigger>
                    <TabsTrigger value="filaments"><Layers3 className="mr-2"/>Filaments</TabsTrigger>
                    <TabsTrigger value="resins"><Droplet className="mr-2"/>Resins</TabsTrigger>
                    <TabsTrigger value="powders"><Sparkles className="mr-2"/>Powders</TabsTrigger>
                    <TabsTrigger value="reorder"><Repeat className="mr-2"/>Reorder</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6"><RawMaterialDashboard spools={spools} resins={resins} powders={powders} displayCurrency={displayCurrency} formatCurrency={formatCurrency} onReorderRequest={(type, id) => { setActiveTab('reorder'); }}/></TabsContent>
                
                <TabsContent value="filaments" className="mt-6">
                    <StatsCards stats={stats.filaments} />
                    <Card className="mt-6">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <CardTitle>Filament Groups</CardTitle>
                                <div className="flex items-center gap-2">
                                    <ScanAndAdd materialType="spool" onSpoolSave={handleSaveSpool} onResinSave={()=>{}} onPowderSave={()=>{}}/>
                                    <Button onClick={() => openSpoolModal(null)}><Plus className="mr-2 h-4 w-4"/> Add Manually</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Input placeholder="Search name or brand..." value={filters.filaments.search} onChange={e => handleFilterChange('filaments', 'search', e.target.value)} />
                                <Select value={filters.filaments.material} onValueChange={v => handleFilterChange('filaments', 'material', v)}><SelectTrigger><SelectValue placeholder="Material" /></SelectTrigger><SelectContent><SelectItem value="all">All Materials</SelectItem>{uniqueValues('material', 'spool').map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.filaments.brand} onValueChange={v => handleFilterChange('filaments', 'brand', v)}><SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger><SelectContent><SelectItem value="all">All Brands</SelectItem>{uniqueValues('brand', 'spool').map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.filaments.finish} onValueChange={v => handleFilterChange('filaments', 'finish', v)}><SelectTrigger><SelectValue placeholder="Finish" /></SelectTrigger><SelectContent><SelectItem value="all">All Finishes</SelectItem>{uniqueValues('finish', 'spool').map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
                            </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {groupedSpools.map(g => <GroupedSpoolCard key={g.key} group={g} onEdit={() => openSpoolModal(g)} onDelete={() => handleDeleteSpoolGroup(g.key)} onReorder={() => handleMarkGroupForReorder('spool', g.key)} />)}
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="resins" className="mt-6">
                     <StatsCards stats={stats.resins} />
                     <Card className="mt-6">
                        <CardHeader>
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <CardTitle>Resin Groups</CardTitle>
                                <div className="flex items-center gap-2">
                                    <ScanAndAdd materialType="resin" onSpoolSave={() => {}} onResinSave={handleSaveResin} onPowderSave={() => {}} />
                                    <Button onClick={() => openResinModal(null)}><Plus className="mr-2 h-4 w-4"/> Add Manually</Button>
                                </div>
                            </div>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input placeholder="Search name or brand..." value={filters.resins.search} onChange={e => handleFilterChange('resins', 'search', e.target.value)} />
                                <Select value={filters.resins.brand} onValueChange={v => handleFilterChange('resins', 'brand', v)}><SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger><SelectContent><SelectItem value="all">All Brands</SelectItem>{uniqueValues('brand', 'resin').map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.resins.type} onValueChange={v => handleFilterChange('resins', 'type', v)}><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{uniqueValues('type', 'resin').map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {groupedResins.map(g => <GroupedResinCard key={g.key} group={g} onEdit={() => openResinModal(g)} onDelete={() => handleDeleteResinGroup(g.key)} onReorder={() => handleMarkGroupForReorder('resin', g.key)} />)}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="powders" className="mt-6">
                     <StatsCards stats={stats.powders} />
                      <Card className="mt-6">
                        <CardHeader>
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <CardTitle>Powder Groups</CardTitle>
                                <div className="flex items-center gap-2">
                                     <ScanAndAdd materialType="powder" onSpoolSave={() => {}} onResinSave={() => {}} onPowderSave={handleSavePowder} />
                                     <Button onClick={() => openPowderModal(null)}><Plus className="mr-2 h-4 w-4"/> Add Manually</Button>
                                </div>
                            </div>
                        </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input placeholder="Search name or brand..." value={filters.powders.search} onChange={e => handleFilterChange('powders', 'search', e.target.value)} />
                                <Select value={filters.powders.brand} onValueChange={v => handleFilterChange('powders', 'brand', v)}><SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger><SelectContent><SelectItem value="all">All Brands</SelectItem>{uniqueValues('brand', 'powder').map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
                                <Select value={filters.powders.material} onValueChange={v => handleFilterChange('powders', 'material', v)}><SelectTrigger><SelectValue placeholder="Material" /></SelectTrigger><SelectContent><SelectItem value="all">All Materials</SelectItem>{uniqueValues('material', 'powder').map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                            </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {groupedPowders.map(g => <GroupedPowderCard key={g.key} group={g} onEdit={() => openPowderModal(g)} onDelete={() => handleDeletePowderGroup(g.key)} onReorder={() => handleMarkGroupForReorder('powder', g.key)} />)}
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reorder" className="mt-6">
                    <ReorderManagement allSpools={spools} allResins={resins} allPowders={powders} />
                </TabsContent>
            </Tabs>
            
            {isSpoolModalOpen && <SpoolModal isOpen={isSpoolModalOpen} onClose={() => setSpoolModalOpen(false)} group={editingSpool} onSave={handleSaveSpool} />}
            {isResinModalOpen && <ResinModal isOpen={isResinModalOpen} onClose={() => setResinModalOpen(false)} group={editingResin} onSave={handleSaveResin} />}
            {isPowderModalOpen && <PowderModal isOpen={isPowderModalOpen} onClose={() => setPowderModalOpen(false)} group={editingPowder} onSave={handleSavePowder} />}

        </div>
    )
}

const StatsCards = ({ stats }: { stats: any }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Groups</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Total Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${stats.value.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Spools Remaining</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.remaining}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium">Critical Stock</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{stats.critical}</div></CardContent></Card>
    </div>
);

const GroupedSpoolCard = ({ group, onEdit, onDelete, onReorder }: { group: GroupedSpool, onEdit: any, onDelete: any, onReorder: any }) => (
    <Card className="flex flex-col"><CardHeader><div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-full border-2 border-black" style={{backgroundColor: group.color, opacity: 0.3}}></div>
                <div className="absolute inset-1 rounded-full bg-background border border-black/10"></div>
                <div className="absolute inset-2 rounded-full border-2 border-black" style={{backgroundColor: group.color}}></div>
            </div>
            <div><CardTitle className="text-base">{group.name}</CardTitle><CardDescription>{group.brand}</CardDescription></div>
        </div>
        <Badge className={statusBadgeColors[group.status]}>{group.status}</Badge>
    </div></CardHeader><CardContent className="flex-grow space-y-3">
        <div className="text-xs text-muted-foreground flex justify-between"><span>Material: <strong>{group.material}</strong></span><span>Finish: <strong>{group.finish}</strong></span></div>
        <div className="text-center"><Badge variant="secondary">{group.count} Spools</Badge></div>
        <div><Label className="text-xs">Usage</Label><Progress value={(group.totalWeight - group.totalUsed) / group.totalWeight * 100} className="h-3"/>
        <p className="text-xs text-right text-muted-foreground">Remaining: {group.totalWeight - group.totalUsed}g / {group.totalWeight}g</p></div>
    </CardContent><CardFooter className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={onReorder}><Repeat className="mr-2 h-4 w-4"/> Reorder</Button><Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4"/></Button></CardFooter></Card>
);
const GroupedResinCard = ({ group, onEdit, onDelete, onReorder }: { group: GroupedResin, onEdit: any, onDelete: any, onReorder: any }) => (
    <Card className="flex flex-col"><CardHeader><div className="flex items-start justify-between">
        <div className="flex items-center gap-3"><Droplet className="h-10 w-10 stroke-black stroke-1" style={{fill: group.color, opacity: 0.7}}/><div><CardTitle className="text-base">{group.name}</CardTitle><CardDescription>{group.brand}</CardDescription></div></div>
        <Badge className={statusBadgeColors[group.status]}>{group.status}</Badge>
    </div></CardHeader><CardContent className="flex-grow space-y-3">
        <div className="text-xs text-muted-foreground">Type: <strong>{group.type}</strong></div>
        <div className="text-center"><Badge variant="secondary">{group.count} Bottles</Badge></div>
        <div><Label className="text-xs">Usage</Label><Progress value={(group.totalVolume - group.totalUsed) / group.totalVolume * 100} className="h-3"/>
        <p className="text-xs text-right text-muted-foreground">Remaining: {group.totalVolume - group.totalUsed}ml / {group.totalVolume}ml</p></div>
    </CardContent><CardFooter className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={onReorder}><Repeat className="mr-2 h-4 w-4"/> Reorder</Button><Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4"/></Button></CardFooter></Card>
);
const GroupedPowderCard = ({ group, onEdit, onDelete, onReorder }: { group: GroupedPowder, onEdit: any, onDelete: any, onReorder: any }) => (
    <Card className="flex flex-col"><CardHeader><div className="flex items-start justify-between">
        <div className="flex items-center gap-3"><Sparkles className="h-10 w-10"/><div className="h-6 w-6 rounded-full border border-black" style={{backgroundColor: group.color}}></div><div><CardTitle className="text-base">{group.name}</CardTitle><CardDescription>{group.brand}</CardDescription></div></div>
        <Badge className={statusBadgeColors[group.status]}>{group.status}</Badge>
    </div></CardHeader><CardContent className="flex-grow space-y-3">
        <div className="text-xs text-muted-foreground">Material: <strong>{group.material}</strong></div>
        <div className="text-center"><Badge variant="secondary">{group.count} Batches</Badge></div>
        <div><Label className="text-xs">Usage</Label><Progress value={(group.totalWeight - group.totalUsed) / group.totalWeight * 100} className="h-3"/>
        <p className="text-xs text-right text-muted-foreground">Remaining: {(group.totalWeight - group.totalUsed).toFixed(2)}kg / {group.totalWeight.toFixed(2)}kg</p></div>
    </CardContent><CardFooter className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={onReorder}><Repeat className="mr-2 h-4 w-4"/> Reorder</Button><Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4"/></Button></CardFooter></Card>
);

type SpoolFormData = Omit<Spool, 'id' | 'spoolId' | 'status' | 'assignedToPrinterId' | 'assignedToJobId'>;
const SpoolModal = ({ isOpen, onClose, group, onSave }: { isOpen: boolean, onClose: () => void, group: GroupedSpool | null, onSave: (data: SpoolFormData, count: number) => void }) => {
    const [formData, setFormData] = useState<SpoolFormData>({ name: '', brand: '', color: '#3B82F6', material: 'PLA', finish: 'Matte', weight: 1000, used: 0, price: 0, currency: 'USD', purchaseDate: new Date().toISOString().split('T')[0], minOrder: 5, imageUrl: '', location: '', minStock: 5 });
    const [count, setCount] = useState(1);
    
    React.useEffect(() => {
        if (group) setFormData(group.spools[0]);
        else setFormData({ name: '', brand: '', color: '#3B82F6', material: 'PLA', finish: 'Matte', weight: 1000, used: 0, price: 0, currency: 'USD', purchaseDate: new Date().toISOString().split('T')[0], minOrder: 5, imageUrl: '', location: '', minStock: 5 });
    }, [group, isOpen]);

    const handleChange = (field: keyof SpoolFormData, value: any) => setFormData((prev: SpoolFormData) => ({...prev, [field]: value}));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData, group ? 1 : count); };

    return <Dialog open={isOpen} onOpenChange={onClose}><DialogContent className="sm:max-w-[625px]"><form onSubmit={handleSubmit}><DialogHeader><DialogTitle>{group ? 'Edit Spool Group' : 'Add New Spool'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
        <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={e=>handleChange('name', e.target.value)} required/></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Brand</Label><Input value={formData.brand} onChange={e=>handleChange('brand', e.target.value)} required/></div><div className="space-y-2"><Label>Material</Label><Input value={formData.material} onChange={e=>handleChange('material', e.target.value)} required/></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Color</Label><div className="flex items-center gap-2"><Input type="color" value={formData.color} onChange={e => handleChange('color', e.target.value)} required className="h-10 w-16 p-1"/><Input type="text" value={formData.color} onChange={e => handleChange('color', e.target.value)} placeholder="#000000" className="h-10 flex-grow"/></div></div><div className="space-y-2"><Label>Finish</Label><Input value={formData.finish} onChange={e=>handleChange('finish', e.target.value)} required/></div></div>
        <div className="space-y-2"><Label>Total Weight (g)</Label><Input type="number" value={formData.weight} onChange={e=>handleChange('weight', Number(e.target.value))} required/></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" value={formData.price} onChange={e=>handleChange('price', Number(e.target.value))} required/></div><div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={v => handleChange('currency', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="AED">AED</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent></Select></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Min Order Qty</Label><Input type="number" value={formData.minOrder} onChange={e=>handleChange('minOrder', Number(e.target.value))} required/></div>
        {!group && <div className="space-y-2"><Label>Number of Spools</Label><Input type="number" value={count} onChange={e => setCount(Number(e.target.value))} min="1" required/></div>}</div>
    </div><ModalFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></ModalFooter></form></DialogContent></Dialog>
};

type ResinFormData = Omit<Resin, 'id' | 'resinId' | 'status' | 'assignedToPrinterId' | 'assignedToJobId'>;
const ResinModal = ({ isOpen, onClose, group, onSave }: { isOpen: boolean, onClose: () => void, group: GroupedResin | null, onSave: (data: ResinFormData, count: number) => void }) => {
    const [formData, setFormData] = useState<ResinFormData>({ name: '', brand: '', color: '#808080', type: 'Standard', volume: 1000, used: 0, price: 0, currency: 'USD', purchaseDate: new Date().toISOString().split('T')[0], minOrder: 4, imageUrl: '', location: '', minStock: 2 });
    const [count, setCount] = useState(1);

    React.useEffect(() => {
        if (group) setFormData(group.resins[0]);
        else setFormData({ name: '', brand: '', color: '#808080', type: 'Standard', volume: 1000, used: 0, price: 0, currency: 'USD', purchaseDate: new Date().toISOString().split('T')[0], minOrder: 4, imageUrl: '', location: '', minStock: 2 });
    }, [group, isOpen]);

    const handleChange = (field: keyof ResinFormData, value: any) => setFormData((prev: ResinFormData) => ({...prev, [field]: value}));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData, group ? 1 : count); };

    return <Dialog open={isOpen} onOpenChange={onClose}><DialogContent className="sm:max-w-[625px]"><form onSubmit={handleSubmit}><DialogHeader><DialogTitle>{group ? 'Edit Resin Group' : 'Add New Resin'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
        <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={e=>handleChange('name', e.target.value)} required/></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Brand</Label><Input value={formData.brand} onChange={e=>handleChange('brand', e.target.value)} required/></div><div className="space-y-2"><Label>Type</Label><Input value={formData.type} onChange={e=>handleChange('type', e.target.value)} required/></div></div>
        <div className="space-y-2"><Label>Color</Label><div className="flex items-center gap-2"><Input type="color" value={formData.color} onChange={e => handleChange('color', e.target.value)} required className="h-10 w-16 p-1"/><Input type="text" value={formData.color} onChange={e => handleChange('color', e.target.value)} placeholder="#808080" className="h-10 flex-grow" /></div></div>
        <div className="space-y-2"><Label>Total Volume (ml)</Label><Input type="number" value={formData.volume} onChange={e=>handleChange('volume', Number(e.target.value))} required/></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" value={formData.price} onChange={e=>handleChange('price', Number(e.target.value))} required/></div><div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={v => handleChange('currency', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="AED">AED</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent></Select></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Min Order Qty</Label><Input type="number" value={formData.minOrder} onChange={e=>handleChange('minOrder', Number(e.target.value))} required/></div>
        {!group && <div className="space-y-2"><Label>Number of Bottles</Label><Input type="number" value={count} onChange={e => setCount(Number(e.target.value))} min="1" required/></div>}</div>
    </div><ModalFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></ModalFooter></form></DialogContent></Dialog>
};

type PowderFormData = Omit<Powder, 'id' | 'powderId' | 'status' | 'assignedToPrinterId' | 'assignedToJobId'>;
const PowderModal = ({ isOpen, onClose, group, onSave }: { isOpen: boolean, onClose: () => void, group: GroupedPowder | null, onSave: (data: PowderFormData, count: number) => void }) => {
    const [formData, setFormData] = useState<PowderFormData>({ name: '', brand: '', material: 'PA12', color: '#FFFFFF', weight: 10, used: 0, price: 0, currency: 'USD', purchaseDate: new Date().toISOString().split('T')[0], minOrder: 2, imageUrl: '', location: '', minStock: 2 });
    const [count, setCount] = useState(1);

    React.useEffect(() => {
        if (group) setFormData(group.powders[0]);
        else setFormData({ name: '', brand: '', material: 'PA12', color: '#FFFFFF', weight: 10, used: 0, price: 0, currency: 'USD', purchaseDate: new Date().toISOString().split('T')[0], minOrder: 2, imageUrl: '', location: '', minStock: 2 });
    }, [group, isOpen]);

    const handleChange = (field: keyof PowderFormData, value: any) => setFormData((prev: PowderFormData) => ({...prev, [field]: value}));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData, group ? 1 : count); };

    return <Dialog open={isOpen} onOpenChange={onClose}><DialogContent className="sm:max-w-[625px]"><form onSubmit={handleSubmit}><DialogHeader><DialogTitle>{group ? 'Edit Powder Group' : 'Add New Powder'}</DialogTitle></DialogHeader><div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
        <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={e=>handleChange('name', e.target.value)} required/></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Brand</Label><Input value={formData.brand} onChange={e=>handleChange('brand', e.target.value)} required/></div><div className="space-y-2"><Label>Material</Label><Input value={formData.material} onChange={e=>handleChange('material', e.target.value)} required/></div></div>
        <div className="space-y-2"><Label>Color</Label><div className="flex items-center gap-2"><Input type="color" value={formData.color} onChange={e => handleChange('color', e.target.value)} required className="h-10 w-16 p-1"/><Input type="text" value={formData.color} onChange={e => handleChange('color', e.target.value)} placeholder="#FFFFFF" className="h-10 flex-grow" /></div></div>
        <div className="space-y-2"><Label>Total Weight (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={e=>handleChange('weight', Number(e.target.value))} required/></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" value={formData.price} onChange={e=>handleChange('price', Number(e.target.value))} required/></div><div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={v => handleChange('currency', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="AED">AED</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent></Select></div></div>
        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Min Order Qty</Label><Input type="number" value={formData.minOrder} onChange={e=>handleChange('minOrder', Number(e.target.value))} required/></div>
        {!group && <div className="space-y-2"><Label>Number of Batches</Label><Input type="number" value={count} onChange={e => setCount(Number(e.target.value))} min="1" required/></div>}</div>
    </div><ModalFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></ModalFooter></form></DialogContent></Dialog>
};

    