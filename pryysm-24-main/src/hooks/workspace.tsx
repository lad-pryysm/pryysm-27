
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isSameDay, getHours, addHours } from "date-fns";
import { generateInitialUnassignedJobs, generateInitialOrders, generateInitialCustomers, generateInitialDocuments, generateInitialInventory, generateInitialRawMaterials, generateInitialPrinters, initialScheduleData } from "@/hooks/workspace-data";
import { uid } from "@/lib/uid";
import type { Order } from '@/components/orders/orders-client';
import type { CostInputsState } from "@/components/costing/cost-inputs";
import type { PricingInputs, CostCalculationResult } from "@/components/costing/costing-client";
import type { NewJobData } from "@/components/job-allotment/types";
import type { ShippingInfo } from "@/components/order-dispatch/shipping-label";
import { useAuth } from "@/hooks/use-auth";
import type { SupportTicket } from "@/components/master-admin/master-admin-client";

// #region --- Type Definitions ---

export type Currency = 'USD' | 'EUR' | 'AED' | 'INR';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Need Reorder';
export type InventoryCategory = 'Packing Material' | 'Electronics' | 'Tools' | 'Miscellaneous';
export interface InventoryItem {
    id: string;
    barcode: string;
    name: string;
    description?: string;
    category: InventoryCategory;
    quantity: number;
    minStock: number;
    minOrder: number;
    location?: string;
    status: StockStatus;
    imageUrl?: string;
}
export type InventoryItemMaster = Omit<InventoryItem, 'id' | 'quantity' | 'status'>;

export type MaterialStatus = 'New' | 'Active' | 'Low' | 'Critical' | 'Empty' | 'Need Reorder';

export interface Spool {
    id: number;
    spoolId: string;
    name: string;
    brand: string;
    color: string;
    material: string;
    finish: string;
    weight: number;
    used: number;
    price: number;
    currency: Currency;
    purchaseDate: string;
    notes?: string;
    status: MaterialStatus;
    assignedToPrinterId?: string;
    assignedToJobId?: string | number;
    imageUrl?: string;
    minStock: number;
    minOrder: number;
    location?: string;
}

export interface Resin {
    id: number;
    resinId: string;
    name: string;
    brand: string;
    color: string;
    type: string;
    volume: number;
    used: number;
    price: number;
    currency: Currency;
    purchaseDate: string;
    notes?: string;
    status: MaterialStatus;
    assignedToPrinterId?: string;
    assignedToJobId?: string | number;
    imageUrl?: string;
    minStock: number;
    minOrder: number;
    location?: string;
}

export interface Powder {
    id: number;
    powderId: string;
    name: string;
    brand: string;
    material: string;
    color?: string;
    weight: number;
    used: number;
    price: number;
    currency: Currency;
    purchaseDate: string;
    notes?: string;
    status: MaterialStatus;
    assignedToPrinterId?: string;
    assignedToJobId?: string | number;
    imageUrl?: string;
    minStock: number;
    minOrder: number;
    location?: string;
}

export type MaterialTypeDefinition = {
    barcode: string;
    type: 'spool' | 'resin' | 'powder';
    name: string;
    brand: string;
    material: string; // For spool/powder
    color?: string; // For spool/resin
    finish?: string; // For spool
    weight?: number; // For spool/powder
    volume?: number; // For resin
    price: number;
    currency: Currency;
    minStock: number;
    minOrder: number;
    imageUrl?: string;
};


export type PrinterStatus = 'printing' | 'running' | 'idle' | 'maintenance' | 'offline';
export type PrinterTechnology = 'FDM' | 'SLA' | 'SLS' | 'DLP' | 'MJF' | 'EBM' | 'DMLS';

export interface Printer {
    id: string;
    name: string;
    model: string;
    codeName: string;
    location: string;
    technology: PrinterTechnology;
    initializationDate: Date;
    capacity: string;
    material: string;
    status: PrinterStatus;
    currentJobImage?: string;
    completionEstimate: Date | null;
    idleSince: Date | null;
    utilization: number;
    currentJob: { name: string; progress: number } | null;
}

export interface Customer {
    id: string;
    customerCode: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    company?: string;
    taxId?: string;
}

export type DocumentType = 'Quotation' | 'Purchase Order' | 'Tax Invoice';
export interface Document {
    id: string;
    customerId: string;
    orderNumber: string;
    type: DocumentType;
    date: string;
    amount: number;
}


export interface Material {
  id: string;
  material: string;
  finish: string;
  color: string;
  useCustom: boolean;
}

export interface ItemGroup {
  id: string;
  quantity: number;
  materials: Material[];
}


export type Job = {
    id: number | string;
    name: string;
    projectCode: string;
    priority?: 'Low' | 'Medium' | 'High';
    estimatedTime?: number;
    deadline: string | Date;
    requiredTechnology?: string;
    start: string | Date;
    end: string | Date;
    startHour: number;
    duration: number;
    date: Date;
    color?: string;
    printerId?: string;
    isPreview?: boolean;
    imageUrl?: string;
    items: number;
    itemGroups: ItemGroup[];
    status?: 'scheduled' | 'printing' | 'confirmed';
    isConfirmed?: boolean;
    isEmergency?: boolean;
    orderNumber?: string;
};

export type ScheduledJob = {
    printerId: string;
    jobs: Job[];
};

export interface CodeSettings {
    project: string;
    customer: string;
    printer: string;
    spool: string;
    resin: string;
    powder: string;
    inventoryItem: string;
    quotation: string;
    purchaseOrder: string;
    taxInvoice: string;
}

export interface SavedCalculation {
    id: string;
    name: string;
    inputs: CostInputsState;
    pricingInputs: PricingInputs;
    createdAt: string;
}

export interface LoggedCalculation {
    id: string;
    inputs: CostInputsState;
    pricingInputs: PricingInputs;
    results: CostCalculationResult;
    createdAt: string;
}

export interface LoggedShippingLabel {
    id: string;
    info: ShippingInfo;
    createdAt: string;
}

export interface LandingPageImage {
    src: string;
    width: number;
    height: number;
    alt: string;
}

export interface LandingPageContent {
    aiScheduling: LandingPageImage;
    visualWorkflow: LandingPageImage;
    financialHub: LandingPageImage;
}


export type Plan = 'Free' | 'Basic' | 'Pro' | 'Enterprise';
type PrinterLimits = { [key in PrinterTechnology]?: number };

export interface PlanFeatures {
    tabs: string[];
    printerLimits: PrinterLimits;
}

export type FeatureFlags = Record<Plan, PlanFeatures>;


// #endregion --- Type Definitions ---

type WorkspaceData = {
    printers: Printer[];
    schedule: ScheduledJob[];
    unassignedJobs: Job[];
    orders: Order[];
    customers: Customer[];
    documents: Document[];
    inventory: InventoryItem[];
    inventoryMasterList: InventoryItemMaster[];
    spools: Spool[];
    resins: Resin[];
    powders: Powder[];
    materialMasterList: MaterialTypeDefinition[];
    costingTemplates: SavedCalculation[];
    loggedCalculations: LoggedCalculation[];
    shippingLogs: LoggedShippingLabel[];
    supportTickets: SupportTicket[];
    idCounters: Record<string, number>;
    codeSettings: CodeSettings;
    currentPlan: Plan;
    featureFlags: FeatureFlags;
    timestamp?: string;
}

type WorkspaceContextType = Omit<WorkspaceData, 'idCounters'> & {
    printers: Printer[];
    enabledTabs: string[];
    isLoading: boolean;
    workspaceData: any; // For export
    landingPageContent: LandingPageContent | null;
    setSpools: React.Dispatch<React.SetStateAction<Spool[]>>;
    setResins: React.Dispatch<React.SetStateAction<Resin[]>>;
    setPowders: React.Dispatch<React.SetStateAction<Powder[]>>;
    setFeatureFlags: React.Dispatch<React.SetStateAction<FeatureFlags>>;
    addSupportTicket: (ticket: SupportTicket) => void;
    setLandingPageContent: (updater: React.SetStateAction<LandingPageContent | null>) => void,
    idService: { getNextId: (type: keyof CodeSettings) => string };
    // Actions
    addInventoryItemToMasterList: (item: InventoryItemMaster) => void;
    addMaterialToMasterList: (material: MaterialTypeDefinition) => void;
    refresh: () => void;
    updateCodeSettings: (newSettings: CodeSettings) => void;
    addUnassignedJob: (job: Job) => void;
    updateUnassignedJob: (job: Job) => void;
    deleteUnassignedJob: (jobId: number | string) => void;
    assignJobToMachine: (job: Job, machineId: string, parentJobId?: string | number) => void;
    confirmJobUpload: (jobId: string | number, printerId: string) => void;
    addCustomer: (customer: Omit<Customer, 'id' | 'customerCode'>) => Customer;
    updateCustomer: (customer: Customer) => void;
    addOrder: (order: Omit<Order, 'id' | 'status'>) => Order;
    updateOrderStatus: (orderId: number, newStatus: Order['status']) => void;
    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'status' | 'barcode'>) => void;
    updateInventoryItem: (item: InventoryItem) => void;
    deleteInventoryItem: (id: string) => void;
    useInventoryItem: (id: string, quantity: number) => void;
    addPrinter: (printer: Omit<Printer, 'id'|'status'|'completionEstimate'|'idleSince'|'utilization'|'currentJob'|'currentJobImage'>) => void;
    deletePrinter: (id: string) => void;
    updatePrinterStatus: (id: string, status: PrinterStatus) => void;
    getAvailableMaterialsForTechnology: (technology: string) => string[];
    getAvailableFinishesForMaterial: (technology: string, material: string) => string[];
    getAvailableColorsForFinish: (technology: string, material: string, finish: string) => { color: string, hex: string, stock: number }[];
    assignMaterialToPrinter: (materialType: 'spool' | 'resin' | 'powder', materialId: number, printerId: string, jobId: number | string) => void;
    returnMaterialToStock: (materialType: 'spool' | 'resin' | 'powder', materialId: number, usedAmount: number) => void;
    saveCostingTemplate: (name: string, inputs: CostInputsState, pricingInputs: PricingInputs) => void;
    loadCostingTemplate: (id: string) => SavedCalculation | undefined;
    updateCostingTemplate: (id: string, newName: string) => void;
    deleteCostingTemplate: (id: string) => void;
    addLoggedCalculation: (inputs: CostInputsState, pricingInputs: PricingInputs, results: CostCalculationResult) => void;
    deleteLoggedCalculation: (id: string) => void;
    findOptimalSlot: (job: Job) => { machine: Printer, startTime: Date } | null;
    addShippingLog: (info: ShippingInfo) => void;
};

const calculateMaterialStatus = (used: number, total: number): MaterialStatus => {
    if (total <= 0) return 'Empty';
    if (used >= total) return 'Empty';
    const remainingPercent = ((total - used) / total) * 100;
    if (remainingPercent <= 10) return 'Critical';
    if (remainingPercent <= 30) return 'Low';
    if (used === 0) return 'New';
    return 'Active';
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const allAvailableFeatures = [
    'dashboard', 'project-tracking', 'customers', 'orders', 'label-generation', 
    'costing', 'finance', 'add-remove-printer', 'job-allotment', 'ai-job-allotment', 
    'printer-management', 'raw-material', 'material-log', 'inventory', 
    'order-dispatch', 'ai-chat', 'settings'
];

const getDefaultWorkspaceData = (forNewUser: boolean): WorkspaceData => {
    if (forNewUser) {
        return {
            printers: [], schedule: [], unassignedJobs: [], orders: [], customers: [], documents: [],
            inventory: [], inventoryMasterList: [], spools: [], resins: [], powders: [],
            materialMasterList: [], costingTemplates: [], loggedCalculations: [], shippingLogs: [],
            supportTickets: [],
            idCounters: {
                project: 1, customer: 1, printer: 1, spool: 1, resin: 1, powder: 1,
                inventoryItem: 1, quotation: 1, purchaseOrder: 1, taxInvoice: 1
            },
            codeSettings: {
                project: 'PROJ-', customer: 'CUST-', printer: 'P-', spool: 'SP', resin: 'RS',
                powder: 'PW', inventoryItem: 'ITEM-', quotation: 'QT-', purchaseOrder: 'PO-', taxInvoice: 'INV-'
            },
            currentPlan: 'Pro',
            featureFlags: {
                Free: { tabs: ['dashboard'], printerLimits: { 'FDM': 1 } },
                Basic: { tabs: ['dashboard', 'project-tracking', 'customers', 'orders'], printerLimits: { 'FDM': 5 } },
                Pro: { tabs: allAvailableFeatures, printerLimits: { 'FDM': 20, 'SLA': 5, 'SLS': 2 } },
                Enterprise: { tabs: allAvailableFeatures, printerLimits: { 'FDM': 100, 'SLA': 50, 'SLS': 20 } },
            },
        };
    }

    const { spools, resins, powders } = generateInitialRawMaterials();
    return {
        printers: generateInitialPrinters() as Printer[],
        schedule: initialScheduleData,
        unassignedJobs: generateInitialUnassignedJobs(),
        orders: generateInitialOrders(),
        customers: generateInitialCustomers(),
        documents: generateInitialDocuments(),
        inventory: generateInitialInventory(),
        inventoryMasterList: [],
        spools,
        resins,
        powders,
        materialMasterList: [],
        costingTemplates: [],
        loggedCalculations: [],
        shippingLogs: [],
        supportTickets: [],
        idCounters: {
            project: 110, customer: 6, printer: 6, spool: 61, resin: 118, powder: 211,
            inventoryItem: 13, quotation: 110, purchaseOrder: 110, taxInvoice: 70
        },
        codeSettings: {
            project: 'PROJ-', customer: 'CUST-', printer: 'P-', spool: 'SP', resin: 'RS',
            powder: 'PW', inventoryItem: 'ITEM-', quotation: 'QT-', purchaseOrder: 'PO-', taxInvoice: 'INV-'
        },
        currentPlan: 'Pro',
        featureFlags: {
            Free: { tabs: ['dashboard', 'orders', 'customers', 'printers'], printerLimits: { 'FDM': 1, 'SLA': 0, 'SLS': 0, 'DLP': 0, 'MJF': 0, 'EBM': 0, 'DMLS': 0 } },
            Basic: { tabs: ['dashboard', 'project-tracking', 'customers', 'orders', 'job-allotment', 'printer-management', 'inventory'], printerLimits: { 'FDM': 5, 'SLA': 1, 'SLS': 0, 'DLP': 0, 'MJF': 0, 'EBM': 0, 'DMLS': 0 } },
            Pro: { tabs: allAvailableFeatures, printerLimits: { 'FDM': 20, 'SLA': 5, 'SLS': 2, 'DLP': 5, 'MJF': 1, 'EBM': 0, 'DMLS': 0 } },
            Enterprise: { tabs: allAvailableFeatures, printerLimits: { 'FDM': 100, 'SLA': 50, 'SLS': 20, 'DLP': 50, 'MJF': 10, 'EBM': 5, 'DMLS': 5 } },
        },
    };
};

const getDefaultLandingPageContent = (): LandingPageContent => ({
    aiScheduling: { src: "https://storage.googleapis.com/prysm-dev-assets/ai-scheduling.png", width: 600, height: 500, alt: "AI Scheduling" },
    visualWorkflow: { src: "https://picsum.photos/seed/a2/600/500", width: 600, height: 500, alt: "Visual Workflow" },
    financialHub: { src: "https://picsum.photos/seed/a3/600/500", width: 600, height: 500, alt: "Financial Hub" },
});

// #region IndexedDB Helpers
const DB_NAME = 'PrysmWorkspaceDB';
const DB_VERSION = 1;
const IMAGE_STORE_NAME = 'landingImages';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
                db.createObjectStore(IMAGE_STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const getImagesFromDB = async (): Promise<LandingPageContent | null> => {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE_NAME, 'readonly');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const images: { [key: string]: LandingPageImage } = {};
    return new Promise((resolve) => {
        const request = store.openCursor();
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                images[cursor.key as string] = cursor.value.image;
                cursor.continue();
            } else {
                if (Object.keys(images).length === 3) {
                     resolve(images as unknown as LandingPageContent);
                } else {
                     resolve(null); // Return null if not all images are present
                }
            }
        };
        request.onerror = () => resolve(null);
    });
};

const saveImageToDB = async (id: keyof LandingPageContent, image: LandingPageImage) => {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE_NAME);
    store.put({ id, image });
    return new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};
// #endregion IndexedDB Helpers

// Helper function to get color based on duration
const getColorForDuration = (durationHours: number): string => {
    if (durationHours <= 2) return '#A5D8FF'; // Light Blue
    if (durationHours <= 4) return '#69B3F7';
    if (durationHours <= 6) return '#4A90E2';
    if (durationHours <= 8) return '#3B71CA';
    if (durationHours <= 10) return '#2A5297';
    if (durationHours <= 12) return '#1C3A69'; // Darkest Blue
    if (durationHours <= 24) return '#F7B500'; // Gold/Yellow
    return '#D0021B'; // Red for long jobs
};


export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    
    const [workspaceState, setWorkspaceState] = useState<WorkspaceData | null>(null);
    const [landingPageContent, setLandingPageContentState] = useState<LandingPageContent | null>(null);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            if (isAuthenticated && user?.email) {
                setIsLoading(true);
                const workspaceKey = `workspace_${user.email}`;

                const isNewSignup = localStorage.getItem('new_signup') === 'true';
                const savedWorkspace = localStorage.getItem(workspaceKey);

                if (isNewSignup) {
                    const blankData = getDefaultWorkspaceData(true);
                    setWorkspaceState(blankData);
                    localStorage.removeItem('new_signup');
                } else if (savedWorkspace) {
                    try {
                        setWorkspaceState(JSON.parse(savedWorkspace));
                    } catch (e) {
                         console.error("Failed to parse workspace from localStorage, resetting.", e);
                         setWorkspaceState(getDefaultWorkspaceData(false));
                    }
                } else {
                    setWorkspaceState(getDefaultWorkspaceData(false));
                }
                
                const storedImages = await getImagesFromDB();
                setLandingPageContentState(storedImages || getDefaultLandingPageContent());
                setIsLoading(false);

            } else if (!isAuthenticated) {
                setWorkspaceState(null);
                const loadPublicData = async () => {
                    const storedImages = await getImagesFromDB();
                    setLandingPageContentState(storedImages || getDefaultLandingPageContent());
                    setIsLoading(false);
                };
                loadPublicData();
            }
        };
        loadData();
    }, [user, isAuthenticated]);
    
    // Persist main workspace data to localStorage on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (workspaceState && user?.email) {
                const key = `workspace_${user.email}`;
                const dataToSave = { ...workspaceState, timestamp: new Date().toISOString() };
                try {
                    localStorage.setItem(key, JSON.stringify(dataToSave));
                } catch (e) {
                    console.error("Failed to save workspace state to localStorage:", e);
                    toast({
                        variant: "destructive",
                        title: "Failed to Save Workspace",
                        description: "Could not save your latest changes due to storage limitations."
                    });
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [workspaceState, user, toast]);

    // Persist landing page images to IndexedDB
    const setLandingPageContent = useCallback((updater: React.SetStateAction<LandingPageContent | null>) => {
        setLandingPageContentState(prev => {
            const newContent = typeof updater === 'function' ? updater(prev) : updater;
            if (newContent) {
                (Object.keys(newContent) as Array<keyof LandingPageContent>).forEach(key => {
                    saveImageToDB(key, newContent[key]);
                });
            }
            return newContent;
        });
    }, []);

    const printers = useMemo(() => {
        if (!workspaceState) return [];
        const { printers: basePrinters, schedule } = workspaceState;
        const now = new Date();
        return basePrinters.map(p => {
            const printerSchedule = schedule.find(s => s.printerId === p.id);
            const currentJob = printerSchedule?.jobs.find(j => {
                const start = new Date(j.start);
                const end = new Date(j.end);
                return j.isConfirmed && start <= now && end > now;
            });
            if (currentJob) {
                const start = new Date(currentJob.start);
                const end = new Date(currentJob.end);
                const totalDuration = end.getTime() - start.getTime();
                const elapsed = now.getTime() - start.getTime();
                const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
                return {
                    ...p,
                    status: 'printing' as PrinterStatus,
                    currentJob: { name: currentJob.name, progress },
                    completionEstimate: end,
                    idleSince: null,
                    currentJobImage: currentJob.imageUrl,
                };
            } else {
                 return {
                    ...p,
                    status: p.status === 'printing' ? 'idle' : p.status,
                    currentJob: null,
                    completionEstimate: null,
                    idleSince: p.status === 'printing' ? new Date() : p.idleSince,
                    currentJobImage: undefined,
                };
            }
        });
    }, [workspaceState]);

    const {
        schedule = [], unassignedJobs = [], orders = [], customers = [], documents = [],
        inventory = [], inventoryMasterList = [], spools = [], resins = [], powders = [], materialMasterList = [],
        costingTemplates = [], loggedCalculations = [], shippingLogs = [], supportTickets = [], idCounters = {}, codeSettings = getDefaultWorkspaceData(true).codeSettings,
        currentPlan = 'Pro', featureFlags = getDefaultWorkspaceData(true).featureFlags
    } = workspaceState || getDefaultWorkspaceData(true);
    
    const enabledTabs = useMemo(() => {
        if (!workspaceState) return [];
        if (!currentPlan || !featureFlags[currentPlan]) return [];
        return featureFlags[currentPlan].tabs || [];
    }, [workspaceState, currentPlan, featureFlags]);


    const setSpools = useCallback((updater: React.SetStateAction<Spool[]>) => {
        setWorkspaceState(prev => prev ? { ...prev, spools: typeof updater === 'function' ? updater(prev.spools) : updater } : null);
    }, []);
    const setResins = useCallback((updater: React.SetStateAction<Resin[]>) => {
        setWorkspaceState(prev => prev ? { ...prev, resins: typeof updater === 'function' ? updater(prev.resins) : updater } : null);
    }, []);
    const setPowders = useCallback((updater: React.SetStateAction<Powder[]>) => {
        setWorkspaceState(prev => prev ? { ...prev, powders: typeof updater === 'function' ? updater(prev.powders) : updater } : null);
    }, []);
    const setFeatureFlags = useCallback((updater: React.SetStateAction<FeatureFlags>) => {
        setWorkspaceState(prev => prev ? { ...prev, featureFlags: typeof updater === 'function' ? updater(prev.featureFlags) : updater } : null);
    }, []);
    const addSupportTicket = useCallback((ticket: SupportTicket) => {
        setWorkspaceState(prev => prev ? { ...prev, supportTickets: [ticket, ...prev.supportTickets] } : null);
    }, []);

    const idService = useMemo(() => ({
        getNextId: (type: keyof CodeSettings) => {
            const prefix = codeSettings[type];
            let nextId = 0;
            setWorkspaceState(prev => {
                if (!prev) return prev;
                const newCount = (prev.idCounters[type] || 0) + 1;
                nextId = newCount;
                return { ...prev, idCounters: { ...prev.idCounters, [type]: newCount } };
            });
            const padding = type === 'project' ? 3 : type === 'customer' ? 2 : 3;
            return `${prefix}${String(nextId).padStart(padding, '0')}`;
        }
    }), [codeSettings]);

    const updateCodeSettings = (newSettings: CodeSettings) => {
        const validatedSettings = { ...newSettings };
        for (const key in validatedSettings) {
            if (!validatedSettings[key as keyof CodeSettings]) {
                validatedSettings[key as keyof CodeSettings] = codeSettings[key as keyof CodeSettings];
            }
        }
        setWorkspaceState(prev => prev ? { ...prev, codeSettings: validatedSettings } : null);
    };

    const addMaterialToMasterList = (material: MaterialTypeDefinition) => {
        setWorkspaceState(prev => prev ? { ...prev, materialMasterList: [...prev.materialMasterList, material] } : null);
    };

    const addInventoryItemToMasterList = (item: InventoryItemMaster) => {
        setWorkspaceState(prev => prev ? { ...prev, inventoryMasterList: [...prev.inventoryMasterList, item] } : null);
    };
    
    const refresh = useCallback(() => {
        const shouldReloadSample = window.confirm("This will overwrite your current workspace with the default sample data. Are you sure?");
        if (shouldReloadSample) {
            setWorkspaceState(getDefaultWorkspaceData(false));
            setLandingPageContentState(getDefaultLandingPageContent());
            toast({title: "Workspace Reset", description: "Default sample data has been loaded."})
        }
    }, [toast]);
    
    const confirmJobUpload = useCallback((jobId: string | number, printerId: string) => {
        setWorkspaceState(prev => {
            if (!prev) return null;
            const newSchedule = prev.schedule.map(printerSchedule => {
                if (printerSchedule.printerId === printerId) {
                    return {
                        ...printerSchedule,
                        jobs: printerSchedule.jobs.map(job => {
                            if (job.id === jobId) {
                                toast({
                                    title: 'Job Confirmed',
                                    description: `Job "${job.name}" on printer "${printers.find(p => p.id === printerId)?.name}" has been confirmed.`
                                });
                                return { ...job, isConfirmed: true, color: getColorForDuration(job.duration) };
                            }
                            return job;
                        })
                    };
                }
                return printerSchedule;
            });
            return { ...prev, schedule: newSchedule };
        });
    }, [toast, printers]);

    const updateOrderStatus = useCallback((orderId: number, newStatus: Order['status']) => {
        setWorkspaceState(prev => prev ? { ...prev, orders: prev.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o) } : null);
    }, []);

    const addUnassignedJob = useCallback((job: Job) => {
        const newJob = { ...job, id: job.id || Date.now() };
        setWorkspaceState(prev => prev ? { ...prev, unassignedJobs: [newJob, ...prev.unassignedJobs] } : null);
    }, []);

    const updateUnassignedJob = useCallback((job: Job) => {
        setWorkspaceState(prev => prev ? { ...prev, unassignedJobs: prev.unassignedJobs.map(j => j.id === job.id ? job : j) } : null);
    }, []);
    
    const deleteUnassignedJob = useCallback((jobId: number | string) => {
        setWorkspaceState(prev => prev ? { ...prev, unassignedJobs: prev.unassignedJobs.filter(j => j.id !== jobId) } : null);
    }, []);
    
    const assignJobToMachine = (job: Job, machineId: string, parentJobId?: string | number) => {
        const machine = printers.find(m => m.id === machineId);
        if (!machine) {
            throw new Error("Machine not found.");
        }
    
        const printerSchedule = schedule.find(s => s.printerId === machineId);
        const lastJobEnd = printerSchedule?.jobs.reduce((latest, current) => {
            const currentEnd = new Date(current.end);
            return currentEnd > latest ? currentEnd : latest;
        }, new Date(0)) || new Date();
    
        const startTime = new Date(Math.max(lastJobEnd.getTime(), new Date().getTime()));
        const durationHours = (job.estimatedTime || 0) / 60;
        const endTime = addHours(startTime, durationHours);
    
        const newJob: Job = {
            ...job, id: job.id, start: startTime.toISOString(), end: endTime.toISOString(),
            date: startTime, startHour: getHours(startTime), duration: durationHours,
            printerId: machineId, isConfirmed: false, color: '#F97316'
        };
    
        setWorkspaceState(prev => {
            if (!prev) return null;
            const newSchedule = [...prev.schedule];
            const targetSchedule = newSchedule.find(s => s.printerId === machineId);
            if (targetSchedule) {
                targetSchedule.jobs.push(newJob);
            } else {
                newSchedule.push({ printerId: machineId, jobs: [newJob] });
            }
            return {
                ...prev,
                schedule: newSchedule,
                unassignedJobs: prev.unassignedJobs.filter(j => j.id !== job.id)
            };
        });

        toast({
            title: "Job Assigned to Confirmation Queue",
            description: `Check "3D Printer Management" to confirm file upload for "${job.name}".`
        });
    };

    const findOptimalSlot = (job: Job): { machine: Printer, startTime: Date } | null => {
        if (!workspaceState) return null;
        const { printers, schedule } = workspaceState;
        const compatiblePrinters = printers.filter(p => {
             return !job.requiredTechnology || p.technology === job.requiredTechnology;
        });

        let bestOption: { machine: Printer, startTime: Date } | null = null;
        let earliestEndTime = new Date(job.deadline);

        for (const printer of compatiblePrinters) {
            const printerSchedule = schedule.find(s => s.printerId === printer.id)?.jobs || [];
            printerSchedule.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            let potentialStartTime = new Date();
            if (printerSchedule.length > 0) {
                 const firstJobStart = new Date(printerSchedule[0].start);
                 if(firstJobStart > potentialStartTime) {
                    const gapEnd = firstJobStart;
                    const requiredDurationMs = (job.estimatedTime || 0) * 60 * 1000;
                    if(gapEnd.getTime() - potentialStartTime.getTime() >= requiredDurationMs) {
                         const jobEndTime = new Date(potentialStartTime.getTime() + requiredDurationMs);
                         if(jobEndTime < earliestEndTime) {
                            bestOption = { machine: printer, startTime: potentialStartTime };
                            earliestEndTime = jobEndTime;
                         }
                    }
                 }
            }
            for(let i=0; i<printerSchedule.length - 1; i++) {
                const gapStart = new Date(printerSchedule[i].end);
                const gapEnd = new Date(printerSchedule[i+1].start);
                const currentCheckTime = new Date(Math.max(gapStart.getTime(), new Date().getTime()));
                const requiredDurationMs = (job.estimatedTime || 0) * 60 * 1000;
                if (gapEnd.getTime() - currentCheckTime.getTime() >= requiredDurationMs) {
                     const jobEndTime = new Date(currentCheckTime.getTime() + requiredDurationMs);
                     if(jobEndTime < earliestEndTime) {
                        bestOption = { machine: printer, startTime: currentCheckTime };
                        earliestEndTime = jobEndTime;
                     }
                }
            }
            const lastJobEnd = printerSchedule.length > 0 ? new Date(printerSchedule[printerSchedule.length - 1].end) : new Date();
            const afterLastJobStart = new Date(Math.max(lastJobEnd.getTime(), new Date().getTime()));
            const requiredDurationMs = (job.estimatedTime || 0) * 60 * 1000;
            const jobEndTime = new Date(afterLastJobStart.getTime() + requiredDurationMs);
             if (jobEndTime < earliestEndTime) {
                 bestOption = { machine: printer, startTime: afterLastJobStart };
                 earliestEndTime = jobEndTime;
            }
        }
        return bestOption;
    };

    const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'customerCode'>): Customer => {
        const newCustomer: Customer = { ...customerData, id: idService.getNextId('customer'), customerCode: idService.getNextId('customer') };
        setWorkspaceState(prev => prev ? { ...prev, customers: [newCustomer, ...prev.customers] } : null);
        toast({ title: 'Customer Added', description: `${newCustomer.name} has been added.` });
        return newCustomer;
    }, [idService, toast]);

    const updateCustomer = useCallback((customer: Customer) => {
        setWorkspaceState(prev => prev ? { ...prev, customers: prev.customers.map(c => c.id === customer.id ? customer : c) } : null);
        toast({ title: 'Customer Updated', description: `Details for ${customer.name} have been updated.` });
    }, [toast]);
    
    const addOrder = useCallback((orderData: Omit<Order, 'id'|'status'>) => {
        let newOrder: Order | null = null;
        setWorkspaceState(prev => {
            if (!prev) return null;
            newOrder = {
                ...orderData,
                id: prev.orders.length > 0 ? Math.max(...prev.orders.map(o => o.id)) + 1 : 1,
                status: 'pending' as const,
            };
            const timePerItemMinutes = 180;
            const newJob = {
                id: newOrder.id, name: `Order: ${newOrder.orderNumber}`, projectCode: newOrder.projectCode,
                priority: newOrder.priority, deadline: newOrder.deadline, requiredTechnology: newOrder.printerTech,
                estimatedTime: newOrder.items * timePerItemMinutes, items: newOrder.items, imageUrl: newOrder.imageUrl,
                itemGroups: [{ id: 'default', quantity: newOrder.items, materials: [] }]
            } as any;
            return { ...prev, orders: [newOrder, ...prev.orders], unassignedJobs: [newJob, ...prev.unassignedJobs] };
        });
        return newOrder!;
    }, []);
    
    const calculateInventoryStatus = (quantity: number, minStock: number): StockStatus => {
        if (quantity <= 0) return 'Out of Stock';
        if (quantity < minStock) return 'Low Stock';
        return 'In Stock';
    }

    const addInventoryItem = useCallback((itemData: Omit<InventoryItem, 'id'|'status'|'barcode'>) => {
        const status = calculateInventoryStatus(itemData.quantity, itemData.minStock);
        const newItem: InventoryItem = { id: idService.getNextId('inventoryItem'), barcode: `ITEM-${Date.now()}`, ...itemData, status };
        setWorkspaceState(prev => prev ? { ...prev, inventory: [newItem, ...prev.inventory] } : null);
    }, [idService]);

    const updateInventoryItem = useCallback((item: InventoryItem) => {
        const status = calculateInventoryStatus(item.quantity, item.minStock);
        setWorkspaceState(prev => prev ? { ...prev, inventory: prev.inventory.map(i => i.id === item.id ? {...item, status} : i) } : null);
    }, []);

    const deleteInventoryItem = useCallback((id: string) => {
        setWorkspaceState(prev => prev ? { ...prev, inventory: prev.inventory.filter(i => i.id !== id) } : null);
    }, []);

    const useInventoryItem = useCallback((id: string, quantityUsed: number) => {
        setWorkspaceState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                inventory: prev.inventory.map(item => {
                    if (item.id === id) {
                        const newQuantity = Math.max(0, item.quantity - quantityUsed);
                        const newStatus = calculateInventoryStatus(newQuantity, item.minStock);
                        return { ...item, quantity: newQuantity, status: newStatus };
                    }
                    return item;
                })
            };
        });
    }, []);

    const addPrinter = useCallback((printerData: Omit<Printer, 'id'|'status'|'completionEstimate'|'idleSince'|'utilization'|'currentJob'|'currentJobImage'>) => {
         if (!workspaceState) return;
        const { printers, featureFlags, currentPlan } = workspaceState;

        const currentCount = printers.filter(p => p.technology === printerData.technology).length;
        const limit = featureFlags[currentPlan].printerLimits[printerData.technology];

        if (limit !== undefined && currentCount >= limit) {
            toast({
                variant: 'destructive',
                title: 'Printer Limit Reached',
                description: `You cannot add more ${printerData.technology} printers on the ${currentPlan} plan. Please upgrade your plan to add more.`,
            });
            return;
        }

        const newPrinter: Printer = {
            id: uid('printer'), ...printerData, status: 'idle', completionEstimate: null,
            idleSince: new Date(), utilization: 0, currentJob: null, currentJobImage: '',
        };
        setWorkspaceState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                printers: [...(prev.printers || []), newPrinter],
                schedule: [...prev.schedule, { printerId: newPrinter.id, jobs: [] }]
            };
        });
    }, [workspaceState, toast]);

    const deletePrinter = useCallback((id: string) => {
        setWorkspaceState(prev => prev ? { ...prev, printers: prev.printers.filter(p => p.id !== id), schedule: prev.schedule.filter(s => s.printerId !== id) } : null);
    }, []);
    
    const updatePrinterStatus = useCallback((id: string, status: PrinterStatus) => {
        setWorkspaceState(prev => prev ? { ...prev, printers: prev.printers.map(p => p.id === id ? { ...p, status } : p) } : null);
    }, []);

    const getRelevantMaterials = useCallback((technology: string) => {
        if (!workspaceState) return [];
        const { spools, resins, powders } = workspaceState;
        switch(technology) {
            case 'FDM': return spools;
            case 'SLA': case 'DLP': return resins;
            case 'SLS': case 'MJF': case 'EBM': case 'DMLS': return powders;
            default: return [];
        }
    }, [workspaceState]);

    const getAvailableMaterialsForTechnology = useCallback((technology: string): string[] => {
        const relevantMaterials = getRelevantMaterials(technology);
        return [...new Set(relevantMaterials.map(item => (item as any).material || (item as any).type))];
    }, [getRelevantMaterials]);

    const getAvailableFinishesForMaterial = useCallback((technology: string, material: string): string[] => {
        if (!material) return [];
        const relevantMaterials = getRelevantMaterials(technology);
        const filtered = relevantMaterials.filter(item => ((item as any).material || (item as any).type) === material);
        return [...new Set(filtered.map(item => (item as any).finish || 'Standard'))];
    }, [getRelevantMaterials]);

    const getAvailableColorsForFinish = useCallback((technology: string, material: string, finish: string): { color: string, hex: string, stock: number }[] => {
        if (!material || !finish) return [];
        const relevantMaterials = getRelevantMaterials(technology);
        const colorStock: { [color: string]: { hex: string, stock: number } } = {};
        relevantMaterials
            .filter(item => ((item as any).material || (item as any).type) === material && ((item as any).finish || 'Standard') === finish && (item as any).status !== 'Empty')
            .forEach(item => {
                const colorKey = (item as any).color;
                if (!colorStock[colorKey]) {
                    colorStock[colorKey] = { hex: (item as any).color, stock: 0 };
                }
                colorStock[colorKey].stock++;
            });
        return Object.entries(colorStock).map(([hex, data]) => ({ color: hex, hex: hex, stock: data.stock }));
    }, [getRelevantMaterials]);
    
    const assignMaterialToPrinter = (materialType: 'spool' | 'resin' | 'powder', materialId: number, printerId: string, jobId: number | string) => {
        const materialUpdater = (setter: (updater: React.SetStateAction<any[]>) => void) => {
            setter(prev => prev.map(m => m.id === materialId ? {...m, assignedToPrinterId: printerId, assignedToJobId: jobId } : m));
        };
        if (materialType === 'spool') materialUpdater(setSpools);
        else if (materialType === 'resin') materialUpdater(setResins);
        else materialUpdater(setPowders);
        toast({ title: 'Material Assigned', description: `Material has been checked out to printer.` });
    };

    const returnMaterialToStock = (materialType: 'spool' | 'resin' | 'powder', materialId: number, usedAmount: number) => {
        const materialUpdater = (setter: (updater: React.SetStateAction<any[]>) => void) => {
            setter(prev => prev.map(m => {
                if (m.id === materialId) {
                    const newUsed = m.used + usedAmount;
                    const total = m.weight || m.volume;
                     if(newUsed > total) {
                        toast({ variant: 'destructive', title: "Usage Exceeds Total", description: "The used amount cannot be greater than the total amount." });
                        return m;
                    }
                    const newStatus = calculateMaterialStatus(newUsed, total);
                    toast({ title: 'Material Returned', description: `${usedAmount}g/ml used. Item returned to stock.` });
                    return {...m, used: newUsed, status: newStatus, assignedToPrinterId: undefined, assignedToJobId: undefined };
                }
                return m;
            }));
        };
        if (materialType === 'spool') materialUpdater(setSpools);
        else if (materialType === 'resin') materialUpdater(setResins);
        else materialUpdater(setPowders);
    };

    const saveCostingTemplate = useCallback((name: string, inputs: CostInputsState, pricingInputs: PricingInputs) => {
        const newTemplate: SavedCalculation = { id: uid('template'), name, inputs, pricingInputs, createdAt: new Date().toISOString() };
        setWorkspaceState(prev => prev ? { ...prev, costingTemplates: [newTemplate, ...prev.costingTemplates] } : null);
    }, []);

    const loadCostingTemplate = useCallback((id: string): SavedCalculation | undefined => {
        return workspaceState?.costingTemplates.find(c => c.id === id);
    }, [workspaceState]);

    const updateCostingTemplate = useCallback((id: string, newName: string) => {
        setWorkspaceState(prev => prev ? { ...prev, costingTemplates: prev.costingTemplates.map(t => t.id === id ? { ...t, name: newName } : t) } : null);
    }, []);

    const deleteCostingTemplate = useCallback((id: string) => {
        setWorkspaceState(prev => prev ? { ...prev, costingTemplates: prev.costingTemplates.filter(c => c.id !== id) } : null);
        toast({ title: 'Template Deleted', variant: 'destructive' });
    }, [toast]);
    
    const addLoggedCalculation = useCallback((inputs: CostInputsState, pricingInputs: PricingInputs, results: CostCalculationResult) => {
        const newLog: LoggedCalculation = { id: uid('log'), inputs, pricingInputs, results, createdAt: new Date().toISOString() };
        setWorkspaceState(prev => prev ? { ...prev, loggedCalculations: [newLog, ...prev.loggedCalculations] } : null);
    }, []);
    
    const deleteLoggedCalculation = useCallback((id: string) => {
        setWorkspaceState(prev => prev ? { ...prev, loggedCalculations: prev.loggedCalculations.filter(l => l.id !== id) } : null);
        toast({ title: 'Logged Calculation Deleted', variant: 'destructive' });
    }, [toast]);

    const addShippingLog = useCallback((info: ShippingInfo) => {
        const newLog: LoggedShippingLabel = { id: uid('shiplog'), info, createdAt: new Date().toISOString() };
        setWorkspaceState(prev => prev ? { ...prev, shippingLogs: [newLog, ...prev.shippingLogs] } : null);
    }, []);

    const workspaceData = useMemo(() => ({
        printers: workspaceState?.printers, schedule, unassignedJobs, orders, customers, documents, inventory, spools, resins, powders, timestamp: new Date().toISOString()
    }), [workspaceState?.printers, schedule, unassignedJobs, orders, customers, documents, inventory, spools, resins, powders]);

    const value: WorkspaceContextType = {
        printers, enabledTabs, schedule, unassignedJobs, orders, customers, documents, inventory, inventoryMasterList, spools, resins, powders, materialMasterList, costingTemplates, loggedCalculations, shippingLogs, supportTickets, isLoading, workspaceData, codeSettings, idService, featureFlags, currentPlan, landingPageContent,
        setSpools, setResins, setPowders, setFeatureFlags, addSupportTicket, setLandingPageContent,
        addInventoryItemToMasterList, addMaterialToMasterList,
        refresh, updateCodeSettings, addUnassignedJob, updateUnassignedJob, deleteUnassignedJob, assignJobToMachine, confirmJobUpload,
        addCustomer, updateCustomer, addOrder, updateOrderStatus,
        addInventoryItem, updateInventoryItem, deleteInventoryItem, useInventoryItem,
        addPrinter, deletePrinter, updatePrinterStatus,
        getAvailableMaterialsForTechnology, getAvailableFinishesForMaterial, getAvailableColorsForFinish,
        assignMaterialToPrinter, returnMaterialToStock,
        saveCostingTemplate, loadCostingTemplate, updateCostingTemplate, deleteCostingTemplate,
        addLoggedCalculation, deleteLoggedCalculation,
        findOptimalSlot, addShippingLog,
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

    