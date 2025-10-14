
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  LogOut,
  User,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  MoreHorizontal,
  Bell,
  FileText,
  LifeBuoy,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Power,
  CalendarPlus,
  KeyRound,
  Percent,
  Flag,
  Copy,
  Trash2,
  LineChart as LineChartIcon,
  HardDrive,
  GitBranch,
  BarChart as BarChartIcon,
  Activity,
  Star,
  Plus,
  Printer as PrinterIcon,
  FileDown,
  CreditCard,
  Settings,
  Upload,
  Globe,
  Factory,
  Inbox,
  Layers,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, BarChart } from 'recharts';
import { useWorkspace, type PrinterTechnology, type Plan, type FeatureFlags, type LandingPageContent, type LandingPageImage } from '@/hooks/use-workspace';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';

export interface SupportTicket {
  id: string;
  user: { name: string; email: string };
  subject: string;
  message: string;
  status: 'Open' | 'Closed' | 'In Progress';
  createdAt: string;
}

type FarmStatus = 'active' | 'suspended' | 'canceled';


interface Farm {
  id: number;
  name: string;
  adminName: string;
  adminEmail: string;
  plan: Plan;
  jobsProcessed: number;
  apiCalls: number;
  limit: number;
  renewal: string;
  startDate: string;
  status: FarmStatus;
  companyName: string;
  numPrinters: number;
  country: string;
  industry: string;
}

const initialFarms: Farm[] = [
  { id: 1, name: 'Quantum Prints', companyName: 'Quantum Prints', adminName: 'Jenny Rosen', adminEmail: 'jenny@quantum.com', plan: 'Pro', jobsProcessed: 1250, apiCalls: 8000, limit: 10000, renewal: '2025-10-01', startDate: '2023-10-01', status: 'active', numPrinters: 15, country: 'United States', industry: 'Aerospace' },
  { id: 2, name: 'Precision Layers', companyName: 'Precision Layers', adminName: 'Ali Khan', adminEmail: 'ali@precision.io', plan: 'Basic', jobsProcessed: 450, apiCalls: 1200, limit: 2000, renewal: '2025-09-22', startDate: '2024-01-15', status: 'active', numPrinters: 5, country: 'Canada', industry: 'Automotive' },
  { id: 3, name: 'Hobbyist Hub', companyName: 'Hobbyist Hub', adminName: 'Leo Burns', adminEmail: 'leo@hobby.net', plan: 'Free', jobsProcessed: 80, apiCalls: 200, limit: 500, renewal: '2025-09-15', startDate: '2024-03-20', status: 'suspended', numPrinters: 1, country: 'United Kingdom', industry: 'Hobbyist' },
  { id: 4, name: 'Rapid Prototypes Inc.', companyName: 'Rapid Prototypes Inc.', adminName: 'Sara Lee', adminEmail: 'sara@rapid.inc', plan: 'Enterprise', jobsProcessed: 25000, apiCalls: 80000, limit: 100000, renewal: '2025-12-01', startDate: '2022-06-01', status: 'active', numPrinters: 50, country: 'Germany', industry: 'Industrial Manufacturing' },
  { id: 5, name: 'Mike\'s Miniatures', companyName: 'Mike\'s Miniatures', adminName: 'Mike Anderson', adminEmail: 'mike@minis.co', plan: 'Pro', jobsProcessed: 890, apiCalls: 4500, limit: 10000, renewal: '2025-10-15', startDate: '2023-11-10', status: 'active', numPrinters: 8, country: 'Australia', industry: 'Consumer Goods' },
  { id: 6, name: 'Canceled Farm', companyName: 'Canceled Farm', adminName: 'Inactive User', adminEmail: 'inactive@test.com', plan: 'Basic', jobsProcessed: 99, apiCalls: 1800, limit: 2000, renewal: '2024-05-01', startDate: '2023-05-01', status: 'canceled', numPrinters: 2, country: 'France', industry: 'Education' },
  { id: 7, name: 'USA Prints', companyName: 'USA Prints', adminName: 'John Doe', adminEmail: 'john@usaprints.com', plan: 'Pro', jobsProcessed: 500, apiCalls: 3000, limit: 10000, renewal: '2025-11-01', startDate: '2023-11-01', status: 'active', numPrinters: 10, country: 'United States', industry: 'Hobbyist' },
  { id: 8, name: 'Canadian Creators', companyName: 'Canadian Creators', adminName: 'Jane Smith', adminEmail: 'jane@canadiancreators.com', plan: 'Basic', jobsProcessed: 200, apiCalls: 800, limit: 2000, renewal: '2025-10-22', startDate: '2024-02-15', status: 'active', numPrinters: 3, country: 'Canada', industry: 'Education' },
];

const availableFeatures = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'ai-chat', name: 'AI Chat' },
    { id: 'project-tracking', name: 'Project Tracking' },
    { id: 'customers', name: 'Customers' },
    { id: 'orders', name: 'Orders' },
    { id: 'label-generation', name: 'Label Generation' },
    { id: 'costing', name: 'Costing' },
    { id: 'finance', name: 'Finance' },
    { id: 'add-remove-printer', name: 'Add/Remove Printer' },
    { id: 'job-allotment', name: 'Job Allotment' },
    { id: 'ai-job-allotment', name: 'AI Job Allotment' },
    { id: 'printer-management', name: '3D Printer Management' },
    { id: 'raw-material', name: 'Raw Material' },
    { id: 'material-log', name: 'Material Log' },
    { id: 'inventory', name: 'Spares and Stores' },
    { id: 'order-dispatch', name: 'Order Dispatch' },
    { id: 'settings', name: 'Settings' },
];

const printerTechnologies: PrinterTechnology[] = ['FDM', 'SLA', 'SLS', 'DLP', 'MJF', 'EBM', 'DMLS'];

const analyticsData = {
    farmGrowth: [
        { month: 'Jan', newFarms: 1 }, { month: 'Feb', newFarms: 2 }, { month: 'Mar', newFarms: 1 },
        { month: 'Apr', newFarms: 3 }, { month: 'May', newFarms: 2 }, { month: 'Jun', newFarms: 4 },
        { month: 'Jul', newFarms: 3 }, { month: 'Aug', newFarms: 5 }
    ],
    apiUsage: [
        { feature: 'Costing', calls: 15200 },
        { feature: 'Scheduling', calls: 12500 },
        { feature: 'Orders', calls: 9800 },
        { feature: 'Customers', calls: 7500 },
        { feature: 'Inventory', calls: 5400 },
        { feature: 'Finance', calls: 3200 },
    ],
    totalApiCalls: 124580,
    topFeature: 'Costing',
    newFarmsThisMonth: 5,
};

const planCosts = {
    Free: 0,
    Basic: 9,
    Pro: 29,
    Enterprise: 99
};

const mockPaymentHistory = [
    { id: 1, date: '2024-08-01', amount: 29, method: 'Stripe', transactionId: 'pi_3Pabc...' },
    { id: 2, date: '2024-07-01', amount: 29, method: 'Stripe', transactionId: 'pi_3P123...' },
    { id: 3, date: '2024-06-01', amount: 29, method: 'Stripe', transactionId: 'pi_3OxA4...' },
];

interface CompanyDetails {
    name: string;
    address: string;
    email: string;
    phone: string;
    website: string;
    taxId: string;
    logo: string | null;
}

function isValidPlan(plan: any, flags: FeatureFlags): plan is Plan {
  return plan in flags;
}

export function MasterAdminClient() {
    const { logout } = useAuth();
    const { 
        featureFlags, 
        setFeatureFlags, 
        supportTickets, 
        addSupportTicket,
        landingPageContent,
        setLandingPageContent,
    } = useWorkspace();
    const router = useRouter();
    const { toast } = useToast();
    const [farms, setFarms] = useState<Farm[]>(initialFarms);
    const [activeView, setActiveView] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarms, setSelectedFarms] = useState<number[]>([]);
    const [planFilter, setPlanFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewingFarm, setViewingFarm] = useState<Farm | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
        name: 'Pryysm by 3D Prodigy',
        address: '1 Super Admin Way, Control City, 12345',
        email: 'admin@pryysm.com',
        phone: '+1-800-PRYYSM',
        website: 'www.pryysm.com',
        taxId: 'MASTER-TAX-ID',
        logo: null,
    });
    
    const handleImageFileChange = (section: keyof LandingPageContent, file: File | null) => {
        if (!file || !setLandingPageContent) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const newImageSrc = event.target.result as string;
                setLandingPageContent((prevContent) => {
                    if (!prevContent) return null;
                    const newContent = {
                        ...prevContent,
                        [section]: {
                            ...prevContent[section],
                            src: newImageSrc
                        }
                    };
                    return newContent;
                });
                toast({ title: "Image Uploaded", description: "The landing page image has been updated."});
            }
        };
        reader.readAsDataURL(file);
    };


    const handleSignOut = () => {
        logout();
        router.push('/login');
    };

    const handleAction = (farmId: number, action: 'toggle' | 'extend-month' | 'extend-year' | 'delete') => {
        setFarms(currentFarms =>
            currentFarms.map(f => {
                if (f.id === farmId) {
                    if (action === 'toggle') {
                        const newStatus = f.status === 'active' ? 'suspended' : 'active';
                        toast({ title: `Farm ${newStatus}` });
                        return { ...f, status: newStatus };
                    }
                    if (action === 'extend-month') {
                        const d = new Date(f.renewal);
                        d.setMonth(d.getMonth() + 1);
                        const newRenewal = d.toISOString().slice(0, 10);
                        toast({ title: 'Subscription Extended', description: `New renewal date for ${f.name}: ${newRenewal}` });
                        return { ...f, renewal: newRenewal };
                    }
                     if (action === 'extend-year') {
                        const d = new Date(f.renewal);
                        d.setFullYear(d.getFullYear() + 1);
                        const newRenewal = d.toISOString().slice(0, 10);
                        toast({ title: 'Subscription Extended', description: `New renewal date for ${f.name}: ${newRenewal}` });
                        return { ...f, renewal: newRenewal };
                    }
                }
                return f;
            })
        );
        if (action === 'delete') {
            setFarms(currentFarms => currentFarms.filter(f => f.id !== farmId));
            toast({ title: 'Farm Deleted', variant: 'destructive' });
        }
    };

    const handlePlanChange = (farmId: number, newPlan: Plan) => {
        setFarms(currentFarms =>
            currentFarms.map(f => {
                if (f.id === farmId) {
                    toast({ title: `Plan Changed`, description: `${f.name}'s plan has been updated to ${newPlan}.` });
                    return { ...f, plan: newPlan };
                }
                return f;
            })
        );
    };
    
    const handleBulkAction = (action: 'suspend' | 'activate' | 'delete') => {
        if (selectedFarms.length === 0) return;
        
        if (action === 'delete') {
            setFarms(farms.filter(f => !selectedFarms.includes(f.id)));
        } else {
            setFarms(farms.map(f => {
                if (selectedFarms.includes(f.id)) {
                    return { ...f, status: action === 'activate' ? 'active' : 'suspended' };
                }
                return f;
            }));
        }

        toast({ title: 'Bulk Action Successful', description: `${selectedFarms.length} farms have been updated.` });
        setSelectedFarms([]);
    };


    const stats = useMemo(() => {
        const activeFarms = farms.filter(f => f.status === 'active');
        const mrr = activeFarms.reduce((acc, f) => {
            if (f.plan === 'Pro') return acc + 29;
            if (f.plan === 'Basic') return acc + 9;
            if (f.plan === 'Enterprise') return acc + 99;
            return acc;
        }, 0);
        const totalFarms = farms.length > 0 ? farms.length : 1;
        const churnRate = (farms.filter(f => f.status === 'canceled').length / totalFarms) * 100;
        const totalJobs = farms.reduce((acc, f) => acc + f.jobsProcessed, 0);
        return {
            activeFarmCount: activeFarms.length,
            mrr,
            churnRate: churnRate.toFixed(1),
            totalJobs,
        };
    }, [farms]);
    
    const filteredFarms = useMemo(() => {
        return farms.filter(f => 
            (f.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) || f.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (planFilter === 'all' || f.plan === planFilter) &&
            (statusFilter === 'all' || f.status === statusFilter)
        );
    }, [farms, searchTerm, planFilter, statusFilter]);

    const farmsByCountry = useMemo(() => {
        const counts = farms.reduce((acc, farm) => {
            acc[farm.country] = (acc[farm.country] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([country, count]) => ({
            country,
            count
        })).sort((a, b) => b.count - a.count);
    }, [farms]);

    const handleDownloadCsv = () => {
        const headers = [
            "id", "name", "adminName", "adminEmail", "plan", "jobsProcessed",
            "apiCalls", "limit", "renewal", "startDate", "status"
        ];
        const csvRows = [headers.join(',')];

        for (const farm of filteredFarms) {
            const values = headers.map(header => {
                const escaped = ('' + farm[header as keyof Farm]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'farms_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'users', label: 'Farm Management', icon: HardDrive },
      { id: 'inbox', label: 'Inbox', icon: Inbox },
      { id: 'subscriptions', label: 'Subscriptions', icon: FileText },
      { id: 'analytics', label: 'Analytics', icon: LineChartIcon },
      { id: 'feature-flags', label: 'Feature Flags', icon: Flag },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const statusBadge: Record<FarmStatus, string> = {
        active: 'bg-green-100 text-green-800',
        suspended: 'bg-yellow-100 text-yellow-800',
        canceled: 'bg-red-100 text-red-800'
    };
    
    const handleFeatureFlagChange = (plan: Plan, featureId: string, isEnabled: boolean) => {
        setFeatureFlags(prev => {
            if (!prev || !isValidPlan(plan, prev)) return prev;
            const currentFeatures = prev[plan].tabs;
            const newFeatures = isEnabled 
                ? [...currentFeatures, featureId]
                : currentFeatures.filter(id => id !== featureId);
            return { ...prev, [plan]: { ...prev[plan], tabs: newFeatures } };
        });
    }

    const handlePrinterLimitChange = (plan: Plan, tech: PrinterTechnology, value: string) => {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setFeatureFlags(prev => {
                if (!prev || !isValidPlan(plan, prev)) return prev;
                return {
                    ...prev,
                    [plan]: {
                        ...prev[plan],
                        printerLimits: {
                            ...prev[plan].printerLimits,
                            [tech]: numValue
                        }
                    }
                }
            });
        }
    };

    const handleRecordPayment = (paymentData: any) => {
        // Here you would typically send data to your backend
        console.log("Recording payment for:", viewingFarm?.name, paymentData);
        toast({
            title: "Payment Recorded",
            description: `A payment of $${paymentData.amount} has been logged for ${viewingFarm?.name}.`
        });
        setIsPaymentModalOpen(false);
    };

    const handleCompanyChange = (field: keyof CompanyDetails, value: any) => {
        setCompanyDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    handleCompanyChange('logo', event.target.result as string);
                    toast({ title: 'Logo updated successfully!' });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (!featureFlags || !landingPageContent) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-72 border-r bg-sidebar text-sidebar-foreground p-4">
                <div className="flex items-center gap-2 mb-6">
                    <Layers className="h-10 w-10 text-sidebar-primary" />
                    <h1 className="text-xl font-bold text-sidebar-foreground">Master Control</h1>
                </div>

                <nav className="flex flex-col gap-1">
                    {navItems.map(item => {
                        return (
                            <Button
                                key={item.id}
                                onClick={() => item.id && setActiveView(item.id)}
                                className={cn(
                                    'inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full',
                                    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    activeView === item.id ? 'bg-sidebar-accent' : 'bg-transparent'
                                )}
                            >
                                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                {item.label}
                                {item.id === 'inbox' && supportTickets.length > 0 && (
                                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {supportTickets.length}
                                    </span>
                                )}
                            </Button>
                        )
                    })}
                </nav>

                <div className="mt-auto">
                     <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                {activeView === 'dashboard' && (
                  <div className="space-y-6">
                    <h1 className="text-2xl font-bold">Master Dashboard</h1>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Farms</CardTitle>
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeFarmCount}</div>
                                <p className="text-xs text-muted-foreground">Total farms with active subscriptions</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Jobs Processed</CardTitle>
                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalJobs.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Across all active farms</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Platform MRR</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${stats.mrr.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Estimated platform monthly revenue</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                             <CardTitle>Farm Management</CardTitle>
                             <CardDescription>View, manage, and take action on farm accounts.</CardDescription>
                             <div className="pt-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                      placeholder="Search by farm name or admin email..." 
                                      className="pl-9"
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Farm</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>API Usage</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Renewal</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFarms.slice(0, 5).map(farm => (
                                        <TableRow key={farm.id}>
                                            <TableCell className="font-medium">{farm.name}<p className="text-xs text-muted-foreground">{farm.adminEmail}</p></TableCell>
                                            <TableCell><Badge variant="outline">{farm.plan}</Badge></TableCell>
                                            <TableCell>
                                                <div className="text-sm">{farm.apiCalls} / {farm.limit}</div>
                                                <Progress value={(farm.apiCalls / farm.limit) * 100} className="h-2 mt-1" />
                                            </TableCell>
                                            <TableCell><Badge className={statusBadge[farm.status]}>{farm.status}</Badge></TableCell>
                                            <TableCell>{farm.renewal}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => alert('Impersonating farm (simulation).')}>Impersonate</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleAction(farm.id, 'toggle')}>
                                                            {farm.status === 'active' ? <XCircle className="mr-2 h-4 w-4"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                                                            {farm.status === 'active' ? 'Suspend' : 'Activate'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <CalendarPlus className="mr-2 h-4 w-4" />
                                                                <span>Extend Renewal</span>
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onClick={() => handleAction(farm.id, 'extend-month')}>By 1 Month</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleAction(farm.id, 'extend-year')}>By 1 Year</DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction(farm.id, 'delete')}>
                                                            <Trash2 className="mr-2 h-4 w-4"/>
                                                            Delete Farm
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="text-center mt-4">
                                <Button variant="link" onClick={() => setActiveView('users')}>View All Farms</Button>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                )}
                 {activeView === 'users' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Farm Management</CardTitle>
                            <CardDescription>Full view of all farms with advanced filtering and bulk actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search farms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                                </div>
                                <Select value={planFilter} onValueChange={setPlanFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue/></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All Plans</SelectItem><SelectItem value="Free">Free</SelectItem><SelectItem value="Basic">Basic</SelectItem><SelectItem value="Pro">Pro</SelectItem><SelectItem value="Enterprise">Enterprise</SelectItem></SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue/></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="canceled">Canceled</SelectItem></SelectContent>
                                </Select>
                                <Button variant="outline" onClick={handleDownloadCsv}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Download CSV
                                </Button>
                            </div>

                             {selectedFarms.length > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                    <p className="text-sm font-medium">{selectedFarms.length} farm(s) selected.</p>
                                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>Activate</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>Suspend</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>Delete</Button>
                                </div>
                            )}

                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                 <Checkbox
                                                    checked={selectedFarms.length === filteredFarms.length && filteredFarms.length > 0}
                                                    onCheckedChange={(checked) => setSelectedFarms(checked ? filteredFarms.map(f => f.id) : [])}
                                                    aria-label="Select all"
                                                />
                                            </TableHead>
                                            <TableHead>Farm</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Printers</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Renewal Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFarms.map(farm => (
                                            <TableRow key={farm.id} onClick={() => setViewingFarm(farm)} className="cursor-pointer">
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedFarms.includes(farm.id)}
                                                        onCheckedChange={(checked) => setSelectedFarms(prev => checked ? [...prev, farm.id] : prev.filter(id => id !== farm.id))}
                                                        aria-label="Select farm"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{farm.name}</TableCell>
                                                <TableCell>{farm.country}</TableCell>
                                                <TableCell>{farm.numPrinters}</TableCell>
                                                <TableCell><Badge variant="outline">{farm.plan}</Badge></TableCell>
                                                <TableCell><Badge className={statusBadge[farm.status]}>{farm.status}</Badge></TableCell>
                                                <TableCell>{farm.renewal}</TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="sm" onClick={() => handleAction(farm.id, 'toggle')}>
                                                        {farm.status === 'active' ? 'Suspend' : 'Activate'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
                 {activeView === 'inbox' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Support Inbox</CardTitle>
                            <CardDescription>Messages and feedback from users.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>From</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {supportTickets.length > 0 ? supportTickets.map(ticket => (
                                            <TableRow key={ticket.id}>
                                                <TableCell>
                                                    <div className="font-medium">{ticket.user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{ticket.user.email}</div>
                                                </TableCell>
                                                <TableCell>{ticket.subject}</TableCell>
                                                <TableCell><p className="max-w-xs truncate">{ticket.message}</p></TableCell>
                                                <TableCell>{format(new Date(ticket.createdAt), 'PP pp')}</TableCell>
                                                <TableCell><Badge variant={ticket.status === 'Open' ? 'destructive' : 'secondary'}>{ticket.status}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm">View</Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">Inbox is empty.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                 )}
                {activeView === 'subscriptions' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscriptions</CardTitle>
                            <CardDescription>Manage farm subscriptions and plans.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search farms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                                </div>
                                <Select value={planFilter} onValueChange={setPlanFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue/></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All Plans</SelectItem><SelectItem value="Free">Free</SelectItem><SelectItem value="Basic">Basic</SelectItem><SelectItem value="Pro">Pro</SelectItem><SelectItem value="Enterprise">Enterprise</SelectItem></SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue/></SelectTrigger>
                                    <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="canceled">Canceled</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Farm</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>API Usage</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Renewal</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFarms.map(farm => (
                                            <TableRow key={farm.id}>
                                                <TableCell className="font-medium">{farm.name}<p className="text-xs text-muted-foreground">{farm.adminEmail}</p></TableCell>
                                                <TableCell><Badge variant="outline">{farm.plan}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{farm.apiCalls.toLocaleString()} / {farm.limit.toLocaleString()}</div>
                                                    <Progress value={(farm.apiCalls / farm.limit) * 100} className="h-2 mt-1" />
                                                </TableCell>
                                                <TableCell><Badge className={statusBadge[farm.status]}>{farm.status}</Badge></TableCell>
                                                <TableCell>{farm.renewal}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                             <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger>
                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                    <span>Change Plan</span>
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent>
                                                                    {(['Free', 'Basic', 'Pro', 'Enterprise'] as Plan[]).map(plan => (
                                                                        <DropdownMenuItem key={plan} disabled={farm.plan === plan} onClick={() => handlePlanChange(farm.id, plan)}>
                                                                            {plan}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>
                                                             <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger>
                                                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                                                    <span>Extend Renewal</span>
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuItem onClick={() => handleAction(farm.id, 'extend-month')}>By 1 Month</DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleAction(farm.id, 'extend-year')}>By 1 Year</DropdownMenuItem>
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>
                                                            <DropdownMenuItem onClick={() => handleAction(farm.id, 'toggle')}>
                                                                {farm.status === 'active' ? <XCircle className="mr-2 h-4 w-4"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                                                                {farm.status === 'active' ? 'Suspend' : 'Activate'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleAction(farm.id, 'delete')}><Trash2 className="mr-2 h-4 w-4"/>Delete Farm</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
                 {activeView === 'analytics' && (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">Platform Analytics</h1>
                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analyticsData.totalApiCalls.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Top Feature Used</CardTitle>
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analyticsData.topFeature}</div>
                                    <p className="text-xs text-muted-foreground">{analyticsData.apiUsage[0].calls.toLocaleString()} calls</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">New Farms This Month</CardTitle>
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+{analyticsData.newFarmsThisMonth}</div>
                                    <p className="text-xs text-muted-foreground">New tenants on the platform</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Farm Growth</CardTitle>
                                    <CardDescription>New farm sign-ups over time.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={{ newFarms: { label: 'New Farms', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analyticsData.farmGrowth}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis allowDecimals={false} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Legend />
                                                <Line type="monotone" dataKey="newFarms" stroke="var(--color-newFarms)" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>API Usage by Feature</CardTitle>
                                    <CardDescription>Total API calls per feature category.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={{ calls: { label: 'API Calls', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analyticsData.apiUsage}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="feature" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                                <Bar dataKey="calls" fill="var(--color-calls)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Farms by Country</CardTitle>
                                <CardDescription>Geographic distribution of customer farms.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={{ count: { label: 'Farms', color: 'hsl(var(--primary))' } }} className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={farmsByCountry}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="country" />
                                            <YAxis allowDecimals={false} />
                                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {activeView === 'feature-flags' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Feature Flags &amp; Limits</CardTitle>
                                <CardDescription>Control features and set limits for each subscription plan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(Object.keys(featureFlags) as Plan[]).map(plan => (
                                        <Card key={plan}>
                                            <CardHeader>
                                                <CardTitle className="text-base">{plan}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-3">Enabled Tabs</h4>
                                                    <div className="space-y-3">
                                                        {availableFeatures.map(feature => (
                                                            <div key={`${plan}-${feature.id}`} className="flex items-center justify-between text-sm">
                                                                <Label htmlFor={`${plan}-${feature.id}`}>{feature.name}</Label>
                                                                <Switch
                                                                    id={`${plan}-${feature.id}`}
                                                                    checked={featureFlags[plan].tabs.includes(feature.id)}
                                                                    onCheckedChange={(checked) => handleFeatureFlagChange(plan, feature.id, checked)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm mb-3">Printer Limits</h4>
                                                    <div className="space-y-3">
                                                        {printerTechnologies.map(tech => (
                                                            <div key={`${plan}-${tech}`} className="flex items-center justify-between text-sm">
                                                                <Label htmlFor={`${plan}-limit-${tech}`}>{tech}</Label>
                                                                <Input
                                                                    id={`${plan}-limit-${tech}`}
                                                                    type="number"
                                                                    className="h-8 w-20"
                                                                    value={featureFlags[plan].printerLimits[tech] ?? 0}
                                                                    onChange={(e) => handlePrinterLimitChange(plan, tech, e.target.value)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button onClick={() => toast({ title: 'Feature Flags Saved' })}>Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {activeView === 'settings' && (
                    <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Company Settings</CardTitle>
                            <CardDescription>This information will be used for billing and correspondence.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label>Company Logo</Label>
                                <div className="flex items-center gap-4">
                                    {companyDetails.logo && <img src={companyDetails.logo} alt="logo" className="h-16 w-16 object-contain border p-1 rounded-md" />}
                                    <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    <Button asChild variant="outline">
                                        <label htmlFor="logo-upload" className="cursor-pointer flex items-center gap-2">
                                            <Upload className="h-4 w-4"/> {companyDetails.logo ? 'Change' : 'Upload'}
                                        </label>
                                    </Button>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input value={companyDetails.name} onChange={e => handleCompanyChange('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea value={companyDetails.address} onChange={e => handleCompanyChange('address', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Email</Label><Input type="email" value={companyDetails.email} onChange={e => handleCompanyChange('email', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={companyDetails.phone} onChange={e => handleCompanyChange('phone', e.target.value)} /></div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Website</Label><Input value={companyDetails.website} onChange={e => handleCompanyChange('website', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Tax ID</Label><Input value={companyDetails.taxId} onChange={e => handleCompanyChange('taxId', e.target.value)} /></div>
                            </div>
                             <div className="flex justify-end">
                                <Button onClick={() => toast({ title: "Company settings saved!" })}>Save Settings</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Landing Page Content</CardTitle>
                            <CardDescription>Manage the images displayed on the public landing page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(Object.keys(landingPageContent) as Array<keyof LandingPageContent>).map((key) => (
                                <div key={key} className="p-4 border rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={landingPageContent[key].src}
                                            alt={landingPageContent[key].alt}
                                            width={80}
                                            height={60}
                                            className="rounded-md object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold">{landingPageContent[key].alt}</p>
                                            <p className="text-xs text-muted-foreground">{key}</p>
                                        </div>
                                    </div>
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        id={`upload-${key}`}
                                        onChange={(e) => handleImageFileChange(key, e.target.files ? e.target.files[0] : null)}
                                    />
                                    <Button asChild variant="outline">
                                        <label htmlFor={`upload-${key}`} className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" /> Change
                                        </label>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    </div>
                )}
                 {activeView !== 'dashboard' && activeView !== 'users' && activeView !== 'analytics' && activeView !== 'feature-flags' && activeView !== 'subscriptions' && activeView !== 'settings' && activeView !== 'inbox' && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="capitalize">{activeView.replace('-', ' ')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>This section is under construction.</p>
                        </CardContent>
                    </Card>
                 )}
            </main>

             {viewingFarm && (
                <Dialog open={!!viewingFarm} onOpenChange={() => setViewingFarm(null)}>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{viewingFarm.name}</DialogTitle>
                            <DialogDescription>{viewingFarm.adminEmail}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-8">
                            <div>
                                <h4 className="font-semibold text-lg mb-4">Account Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Admin</span><span>{viewingFarm.adminName}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Company Name</span><span>{viewingFarm.companyName}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Country</span><span className="flex items-center gap-2"><Globe className="h-4 w-4"/> {viewingFarm.country}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Industry</span><span className="flex items-center gap-2"><Factory className="h-4 w-4"/> {viewingFarm.industry}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Printers</span><span className="flex items-center gap-2"><PrinterIcon className="h-4 w-4"/> {viewingFarm.numPrinters}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Start Date</span><span>{viewingFarm.startDate}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Plan</span><Badge variant="outline">{viewingFarm.plan}</Badge></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><Badge className={statusBadge[viewingFarm.status]}>{viewingFarm.status}</Badge></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Renewal Date</span><span>{viewingFarm.renewal}</span></div>
                                    <div className="flex items-center justify-between"><span className="text-muted-foreground">Jobs Processed</span><span>{viewingFarm.jobsProcessed.toLocaleString()}</span></div>
                                    <div className="space-y-2 col-span-2">
                                        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">API Usage</span><span>{viewingFarm.apiCalls.toLocaleString()} / {viewingFarm.limit.toLocaleString()}</span></div>
                                        <Progress value={(viewingFarm.apiCalls / viewingFarm.limit) * 100} className="h-2" />
                                    </div>
                                </div>
                            </div>
                             <div>
                                <div className="flex justify-between items-center mb-4">
                                     <h4 className="font-semibold text-lg">Billing</h4>
                                     <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => toast({title: "Invoice generation is a mock action."})}><FileText className="mr-2 h-4 w-4"/>Create Invoice</Button>
                                        <Button variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(true)}><CreditCard className="mr-2 h-4 w-4"/>Record Payment</Button>
                                     </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <span className="font-medium">Current Plan: {viewingFarm.plan}</span>
                                        <span className="font-bold text-primary">${planCosts[viewingFarm.plan]}/month</span>
                                    </div>
                                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>Transaction ID</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockPaymentHistory.map(p => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>{p.date}</TableCell>
                                                        <TableCell>${p.amount.toFixed(2)}</TableCell>
                                                        <TableCell>{p.method}</TableCell>
                                                        <TableCell className="font-mono text-xs">{p.transactionId}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setViewingFarm(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {isPaymentModalOpen && viewingFarm && (
                <RecordPaymentDialog 
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    farmName={viewingFarm.name}
                    planCost={planCosts[viewingFarm.plan]}
                    onSubmit={handleRecordPayment}
                />
            )}
        </div>
    );
}

interface RecordPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    farmName: string;
    planCost: number;
    onSubmit: (data: any) => void;
}

function RecordPaymentDialog({ isOpen, onClose, farmName, planCost, onSubmit }: RecordPaymentDialogProps) {
    const [amount, setAmount] = useState(planCost.toString());
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [method, setMethod] = useState('Stripe');
    const [transactionId, setTransactionId] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ amount: Number(amount), date, method, transactionId });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Payment for {farmName}</DialogTitle>
                    <DialogDescription>Manually log a subscription payment for this farm.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="payment-amount">Amount</Label>
                        <Input id="payment-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-date">Payment Date</Label>
                        <Input id="payment-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-method">Payment Method</Label>
                         <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger id="payment-method"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Stripe">Stripe</SelectItem>
                                <SelectItem value="PayPal">PayPal</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="transaction-id">Transaction ID / Reference</Label>
                        <Input id="transaction-id" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Record Payment</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


    
