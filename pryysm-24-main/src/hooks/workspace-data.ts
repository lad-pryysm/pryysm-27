

import { addHours, addDays, subDays } from 'date-fns';
import type { Job, ItemGroup, Printer, Spool, Resin, Powder, Customer, Document, Currency, InventoryItem, StockStatus, MaterialStatus, InventoryCategory, SavedCalculation, LoggedCalculation } from './use-workspace';

// Data Generation
const calculateStatus = (used: number, total: number): any => {
    if (total <= 0) return 'Empty';
    if (used >= total) return 'Empty';
    const remainingPercent = ((total - used) / total) * 100;
    if (remainingPercent <= 10) return 'Critical';
    if (remainingPercent <= 30) return 'Low';
    if (used === 0) return 'New';
    return 'Active';
}

const customerNames = ['Innovate LLC', 'Design Co.', 'Engineering Dynamics', 'AeroSpace Solutions', 'MediTech Devices', 'Auto Parts Pro'];
const printerTechs = ['FDM', 'SLA', 'SLS', 'MJF'];
const salesPeople = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Chen', 'David Wilson'];

export const generateInitialPrinters = (): Omit<Printer, 'completionEstimate'|'idleSince'|'utilization'|'currentJob'|'currentJobImage'>[] => [
    { id: '1', name: 'Prusa i3 MK3S+', model: 'i3 MK3S+', codeName: 'PRUSA01', location: 'Lab 1', technology: 'FDM', initializationDate: new Date('2023-01-15'), capacity: 'Standard', material: 'PLA', status: 'printing' },
    { id: '2', name: 'Creality Ender 3 Pro', model: 'Ender 3 Pro', codeName: 'ENDER01', location: 'Lab 2', technology: 'FDM', initializationDate: new Date('2023-03-22'), capacity: 'Standard', material: 'PLA', status: 'idle' },
    { id: '3', name: 'Ultimaker S5', model: 'S5', codeName: 'ULTI01', location: 'Design Studio', technology: 'SLA', initializationDate: new Date('2022-05-10'), capacity: 'Large', material: 'Resin', status: 'printing' },
    { id: '4', name: 'Anycubic Mega X', model: 'Mega X', codeName: 'ANYC01', location: 'Workshop', technology: 'FDM', initializationDate: new Date('2021-06-01'), capacity: 'Large', material: 'PETG', status: 'maintenance' },
    { id: '5', name: 'Bambu Lab A1 mini', model: 'A1 mini', codeName: 'BAMBU01', location: 'Lab 3', technology: 'FDM', initializationDate: new Date('2023-08-18'), capacity: 'Small', material: 'PLA', status: 'printing' },
    { id: '6', name: 'Prusa MINI+', model: 'MINI+', codeName: 'PRUSA02', location: 'Lab 1', technology: 'FDM', initializationDate: new Date('2023-09-30'), capacity: 'Small', material: 'PLA', status: 'idle' },
    { id: '7', name: 'EOS Formiga P 110', model: 'P 110', codeName: 'EOS01', location: 'Lab 2', technology: 'SLS', initializationDate: new Date('2023-11-01'), capacity: 'Medium', material: 'PA 2200', status: 'idle' },
    { id: '8', name: 'HP Jet Fusion 5200', model: '5200', codeName: 'HPJF01', location: 'Prototyping Center', technology: 'MJF', initializationDate: new Date('2023-07-15'), capacity: 'Production', material: 'HP 3D HR PA 12', status: 'maintenance' },
    { id: '9', name: 'Creality K1', model: 'K1', codeName: 'CREA02', location: 'Lab 1', technology: 'FDM', initializationDate: new Date('2024-01-20'), capacity: 'Standard', material: 'ABS', status: 'offline' },
    { id: '10', name: 'Formlabs Fuse 1', model: 'Fuse 1', codeName: 'FUSE01', location: 'SLS Room', technology: 'SLS', initializationDate: new Date('2024-02-10'), capacity: 'Standard', material: 'Nylon 12', status: 'idle' },
    { id: '11', name: 'Raise3D Pro3', model: 'Pro3', codeName: 'RAISE01', location: 'Lab 3', technology: 'FDM', initializationDate: new Date('2023-12-12'), capacity: 'Large', material: 'PC', status: 'offline' },
    { id: '12', name: 'Anycubic Photon M3', model: 'M3', codeName: 'ANYC02', location: 'Design Studio', technology: 'SLA', initializationDate: new Date('2024-03-01'), capacity: 'Small', material: 'Standard Resin', status: 'idle' },
];

export const generateInitialOrders = (): any[] => {
    const orders: any[] = [];
    const today = new Date();

    for (let i = 1; i <= 60; i++) {
        const daysAgo = Math.floor(Math.random() * 180);
        const orderDate = subDays(today, daysAgo);

        const deadline = addDays(orderDate, Math.floor(Math.random() * 10) + 5);

        let status: any['status'];
        const now = new Date();
        if (deadline < now && i % 4 !== 0) {
            status = 'overdue';
        } else if (i % 4 === 0) {
            status = 'completed';
        } else {
            status = 'in-progress';
        }
        
        orders.push({
            id: i, customer: customerNames[i % customerNames.length], orderNumber: `ORD-${String(i).padStart(3, '0')}`,
            projectCode: `PRJ-${String(i).padStart(3, '0')}`,
            orderDate: orderDate.toISOString().split('T')[0], deadline: deadline.toISOString().split('T')[0],
            status: status, items: Math.floor(Math.random() * 10) + 1,
            priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
            printerTech: printerTechs[i % printerTechs.length], salesPerson: salesPeople[i % salesPeople.length], notes: `Notes for order ${i}`,
        });
    }

    // Add some guaranteed pending orders for testing the "In Queue" section
    for (let i = 101; i <= 105; i++) {
        const orderDate = subDays(today, (i - 100));
        const deadline = addDays(orderDate, 15);
        orders.push({
            id: i, customer: customerNames[i % customerNames.length], orderNumber: `ORD-${String(i).padStart(3, '0')}`,
            projectCode: `PRJ-${String(i).padStart(3, '0')}`,
            orderDate: orderDate.toISOString().split('T')[0], deadline: deadline.toISOString().split('T')[0],
            status: 'pending', items: Math.floor(Math.random() * 20) + 1,
            priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
            printerTech: printerTechs[i % printerTechs.length], salesPerson: salesPeople[i % salesPeople.length],
        });
    }

    return orders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const generateInitialCustomers = (): Customer[] => [
    { id: 'CUST-001', customerCode: 'INNO-01', name: 'Innovate LLC', email: 'contact@innovatellc.com', phone: '555-123-4567', address: '123 Tech Park, Silicon Valley, CA 94043', company: 'Innovate LLC', taxId: 'TAX-INNO-123' },
    { id: 'CUST-002', customerCode: 'DSGN-01', name: 'Design Co.', email: 'accounts@designco.net', phone: '555-987-6543', address: '456 Creative Ave, Arts District, NY 10013', company: 'Design Co.', taxId: 'TAX-DSGN-456' },
    { id: 'CUST-003', customerCode: 'ENGI-01', name: 'Engineering Dynamics', email: 'procurement@engdynamics.com', phone: '555-555-1212', address: '789 Industrial Blvd, Detroit, MI 48226', company: 'Engineering Dynamics', taxId: 'TAX-ENGI-789' },
    { id: 'CUST-004', customerCode: 'AERO-01', name: 'AeroSpace Solutions', email: 'contact@aerospacesol.com', phone: '555-234-5678', address: '321 Flight Path, Seattle, WA 98108', company: 'AeroSpace Solutions', taxId: 'TAX-AERO-321' },
    { id: 'CUST-005', customerCode: 'MEDI-01', name: 'MediTech Devices', email: 'info@meditech.dev', phone: '555-345-6789', address: '654 Health Ave, Boston, MA 02110', company: 'MediTech Devices', taxId: 'TAX-MEDI-654' },
    { id: 'CUST-006', customerCode: 'AUTO-01', name: 'Auto Parts Pro', email: 'sales@autopartspro.com', phone: '555-456-7890', address: '987 Piston St, Dearborn, MI 48120', company: 'Auto Parts Pro', taxId: 'TAX-AUTO-987' },
];

export const generateInitialDocuments = (): Document[] => {
    const documents: Document[] = [];
    let docIdCounter = 1;
    const customers = generateInitialCustomers();
    // Generate docs for the last 180 days to match orders
    for (let i = 1; i <= 150; i++) { 
        const customerIndex = (i % customers.length);
        const customerId = customers[customerIndex].id;
        const orderNumber = `ORD-${String(i).padStart(3, '0')}`;
        const amount = Math.floor(Math.random() * 2000) + 150;
        
        // Stagger dates over the last 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const orderDate = subDays(new Date(), daysAgo);

        // Create a quotation for each order
        documents.push({ id: `DOC-${String(docIdCounter++).padStart(3, '0')}`, customerId, orderNumber, type: 'Quotation', date: orderDate.toISOString().split('T')[0], amount });

        // Create a PO for most orders
        if (i % 1.2 > 0.2) { // ~80% of orders get a PO
             const poDate = addDays(orderDate, Math.floor(Math.random() * 3));
             documents.push({ id: `DOC-${String(docIdCounter++).padStart(3, '0')}`, customerId, orderNumber, type: 'Purchase Order', date: poDate.toISOString().split('T')[0], amount });
        }

        // Create an invoice for a subset of orders
        if (i % 1.5 > 0.5) { // ~66% of orders get an invoice
            const invoiceDate = addDays(orderDate, Math.floor(Math.random() * 10) + 5);
             documents.push({ id: `DOC-${String(docIdCounter++).padStart(3, '0')}`, customerId, orderNumber, type: 'Tax Invoice', date: invoiceDate.toISOString().split('T')[0], amount: amount * 1.05 });
        }
    }
    return documents;
};


const calculateInventoryStatus = (quantity: number, minStock: number): any => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity < minStock) return 'Low Stock';
    return 'In Stock';
}

export const generateInitialInventory = (): InventoryItem[] => [
    { id: 'item-001', barcode: 'PACK-BOX-SML', name: 'Packing Boxes (Small)', description: '10x10x10cm cardboard boxes', category: 'Packing Material' as InventoryCategory, quantity: 450, minStock: 100, minOrder: 200, location: 'Shelf A-1', status: 'In Stock', imageUrl: 'https://placehold.co/100x100.png' },
    { id: 'item-002', barcode: 'PACK-BOX-MED', name: 'Packing Boxes (Medium)', description: '20x20x20cm cardboard boxes', category: 'Packing Material' as InventoryCategory, quantity: 300, minStock: 80, minOrder: 150, location: 'Shelf A-2', status: 'In Stock', imageUrl: 'https://placehold.co/100x100.png' },
    { id: 'item-003', barcode: 'PACK-BBL-ROLL', name: 'Bubble Wrap (Roll)', description: '50m rolls of protective bubble wrap', category: 'Packing Material' as InventoryCategory, quantity: 15, minStock: 5, minOrder: 10, location: 'Shelf B-1', status: 'In Stock', imageUrl: 'https://placehold.co/100x100.png' },
    { id: 'item-004', barcode: 'ELEC-STEP-N17', name: 'Stepper Motors', description: 'NEMA 17, 12V, 400 steps/rev', category: 'Electronics' as InventoryCategory, quantity: 15, minStock: 10, minOrder: 10, location: 'Drawer E-2', status: 'In Stock', imageUrl: 'https://placehold.co/100x100.png' },
    { id: 'item-005', barcode: 'ELEC-HOTEND-FDM', name: 'Hotend Assembly', description: 'Complete hotend for FDM printers', category: 'Electronics' as InventoryCategory, quantity: 8, minStock: 5, minOrder: 5, location: 'Drawer E-4', status: 'In Stock' },
    { id: 'item-006', barcode: 'TOOL-CALIPER-D150', name: 'Calipers', description: 'Digital measuring tool, 0-150mm', category: 'Tools' as InventoryCategory, quantity: 8, minStock: 3, minOrder: 5, location: 'Tool Box 3', status: 'In Stock', imageUrl: 'https://placehold.co/100x100.png' },
    { id: 'item-007', barcode: 'MISC-ZIP-TIES', name: 'Zip Ties (Pack)', description: 'Pack of 100 assorted zip ties', category: 'Miscellaneous' as InventoryCategory, quantity: 8, minStock: 3, minOrder: 5, location: 'Drawer M-1', status: 'In Stock' },
    { id: 'item-008', barcode: 'PACK-LABEL-ROLL', name: 'Shipping Labels (Roll)', description: 'Roll of 500 thermal shipping labels', category: 'Packing Material' as InventoryCategory, quantity: 3, minStock: 2, minOrder: 2, location: 'Desk Area', status: 'Low Stock' },
].map(item => ({ ...item, status: calculateInventoryStatus(item.quantity, item.minStock) as any }));

export const generateInitialRawMaterials = () => {
    const generateSpools = (count: number, material: string, brand: string, color: string, colorHex: string, finish: string, name: string, startingId: number, location: string): Spool[] => {
        const spools = [];
        for (let i = 0; i < count; i++) {
            const id = startingId + i;
            const used = (id % 10) * 100;
            const status = calculateStatus(used, 1000);
            spools.push({
                id, spoolId: `SP${String(id).padStart(3, '0')}`, name, brand, color: colorHex, material, finish,
                weight: 1000, used, price: 25 + (id % 5), currency: 'USD' as Currency, purchaseDate: '2024-05-01', imageUrl: 'https://placehold.co/100x100.png', status, assignedToPrinterId: undefined, assignedToJobId: undefined,
                minStock: 2, minOrder: 5, location: `${location}-${i + 1}`
            });
        }
        return spools;
    };

    const initialSpools: Spool[] = [
        ...generateSpools(20, "PLA", "Overture", "Black", "#000000", "Matte", "PLA Black", 1, "Rack A"),
        ...generateSpools(15, "PLA", "Hatchbox", "White", "#FFFFFF", "Glossy", "PLA White", 21, "Rack B"),
        ...generateSpools(10, "ABS", "Sunlu", "Red", "#FF0000", "Satin", "ABS Red", 36, "Rack C"),
        ...generateSpools(10, "PETG", "eSun", "Blue", "#0000FF", "Transparent", "PETG Blue", 46, "Rack D"),
        ...generateSpools(5, "TPU", "NinjaFlex", "Grey", "#808080", "Flexible", "TPU Grey", 56, "Rack E"),
    ];

    const initialResins: Resin[] = [
        ...Array.from({length: 15}, (_, i) => ({ id: 104 + i, resinId: `RS${String(4+i).padStart(3, '0')}`, name: 'Standard Resin Grey', brand: 'Elegoo', color: '#808080', type: 'Standard', volume: 1000, used: (i % 10) * 100, price: 35.00, currency: 'USD' as Currency, purchaseDate: '2024-05-10', notes: "Stock", status: 'Active' as any, assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 2, minOrder: 4, location: `Resin Cabinet ${i % 3 + 1}` })),
        { id: 101, resinId: 'RS001', name: 'Standard Resin Grey', brand: 'Elegoo', color: '#808080', type: 'Standard', volume: 1000, used: 400, price: 35.00, currency: 'USD' as Currency, purchaseDate: '2024-03-10', notes: "General purpose resin", status: 'Active', assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 2, minOrder: 4, location: 'Resin Cabinet 1' },
        { id: 102, resinId: 'RS002', name: 'Tough Resin White', brand: 'Siraya Tech', color: '#FFFFFF', type: 'Tough', volume: 1000, used: 920, price: 55.00, currency: 'USD' as Currency, purchaseDate: '2024-03-15', notes: 'For durable parts', status: 'Critical', assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 1, minOrder: 2, location: 'Resin Cabinet 2' },
        { id: 103, resinId: 'RS003', name: 'Flexible Resin Clear', brand: 'Anycubic', color: '#FFFFFF', type: 'Flexible', volume: 500, used: 100, price: 45.00, currency: 'EUR' as Currency, purchaseDate: '2024-04-01', notes: 'For flexible prints', status: 'Active', assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 1, minOrder: 1, location: 'Resin Cabinet 1' },
    ].map(r => ({...r, status: calculateStatus(r.used, r.volume)}));

    const initialPowders: Powder[] = [
        ...Array.from({length: 8}, (_, i) => ({ id: 204 + i, powderId: `PW${String(4+i).padStart(3, '0')}`, name: 'PA12 White', brand: 'EOS', material: 'PA12', color: '#FFFFFF', weight: 20, used: (i % 8) * 2.5, price: 1200, currency: 'EUR' as Currency, purchaseDate: '2024-05-01', notes: 'Stock', status: 'Active' as any, assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 2, minOrder: 2, location: `Powder Station ${i % 2 + 1}` })),
        { id: 201, powderId: 'PW001', name: 'PA12 White', brand: 'EOS', material: 'PA12', color: '#FFFFFF', weight: 20, used: 5, price: 1200, currency: 'EUR' as Currency, purchaseDate: '2024-02-20', notes: 'High-performance nylon', status: 'Active', assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 2, minOrder: 2, location: 'Powder Station 1' },
        { id: 202, powderId: 'PW002', name: 'PA11 Black', brand: 'HP', material: 'PA11', color: '#000000', weight: 15, used: 14.5, price: 1500, currency: 'USD' as Currency, purchaseDate: '2024-01-30', notes: 'Nearing empty', status: 'Low', assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 1, minOrder: 1, location: 'Powder Station 2' },
        { id: 203, powderId: 'PW003', name: 'TPU Powder', brand: 'Formlabs', material: 'TPU', color: '#E0E0E0', weight: 5, used: 0, price: 450, currency: 'USD' as Currency, purchaseDate: '2024-05-01', notes: 'New, unopened', status: 'New', assignedToPrinterId: undefined, assignedToJobId: undefined, minStock: 1, minOrder: 1, location: 'Powder Station 1' },
    ].map(p => ({...p, status: calculateStatus(p.used, p.weight)}));
    
    return { spools: initialSpools, resins: initialResins, powders: initialPowders };
};


export const generateInitialUnassignedJobs = (): Job[] => {
    const jobs: Job[] = [];
    const orders = generateInitialOrders().filter(o => o.status === 'pending');

    orders.forEach(order => {
        jobs.push({
            id: order.id,
            name: `Order: ${order.orderNumber}`,
            projectCode: order.projectCode,
            priority: order.priority,
            estimatedTime: (order.items % 5 + 1) * 60, // 1 to 5 hours in minutes
            deadline: order.deadline,
            requiredTechnology: order.printerTech,
            start: new Date(),
            end: new Date(),
            startHour: 0,
            duration: 0,
            date: new Date(),
            items: order.items,
            itemGroups: [
                {
                    id: `group-${order.id}-1`,
                    quantity: order.items,
                    materials: [
                        { id: `mat-${order.id}-1`, name: 'Default Material', material: 'PLA', color: '#FF0000', finish: 'Matte', useCustom: false }
                    ]
                }
            ],
            imageUrl: 'https://placehold.co/100x100.png',
            orderNumber: order.orderNumber, // Add orderNumber for linking
        } as Job);
    });

    return jobs;
};

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

const generateBusySchedule = () => {
    const printers = generateInitialPrinters();
    const schedule: {printerId: string, jobs: any[]}[] = [];
    const now = new Date();

    for (const printer of printers) {
        // If the printer status is not 'printing', we don't need to generate a busy schedule for it.
        if (printer.status !== 'printing') {
             schedule.push({
                printerId: printer.id,
                jobs: []
            });
            continue;
        }
        
        const jobs: Job[] = [];
        let currentTime = new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000); // Start some jobs in the past

        for (let i = 0; i < 40; i++) { // Add enough jobs to cover ~15 days
            const durationHours = Math.floor(Math.random() * 12) + 4; // Jobs between 4 and 16 hours
            const start = new Date(currentTime);
            const end = addHours(start, durationHours);

            if (end > addDays(now, 16)) break; // Stop if we go past 16 days

            const isConfirmed = start < now || i > 2; // Make the first 3 upcoming jobs unconfirmed

            jobs.push({
                id: `busy-${printer.id}-${i}`,
                name: `Job ${i + 1} for ${printer.codeName}`,
                projectCode: `BUSY-${printer.codeName}-${i}`,
                start: start.toISOString(),
                end: end.toISOString(),
                duration: durationHours,
                startHour: start.getHours(),
                date: start,
                color: isConfirmed ? getColorForDuration(durationHours) : '#F97316', // Orange for unconfirmed
                imageUrl: `https://picsum.photos/seed/job${printer.id}${i}/100/100`,
                items: 1,
                priority: 'Medium',
                requiredTechnology: printer.technology,
                deadline: addDays(end, 2).toISOString(),
                isConfirmed: isConfirmed,
                itemGroups: [{id: `g-${i}`, quantity: 1, materials: [] }]
            } as Job);

            currentTime = end;
        }

        schedule.push({
            printerId: printer.id,
            jobs: jobs
        });
    }
    return schedule;
};


export const initialScheduleData: {printerId: string, jobs: any[]}[] = generateBusySchedule();


export const generateInitialCostingTemplates = (): SavedCalculation[] => [
    {
        id: 'template-1', name: 'Standard PLA Part (120g)', createdAt: new Date('2024-05-01T10:00:00Z').toISOString(),
        inputs: { jobName: 'Standard PLA Part', productImage: 'https://placehold.co/100x100/3B82F6/FFFFFF/png', currency: 'USD', printHours: 5, printMinutes: 30, filamentWeight: 120, filamentType: 'pla', spoolPrice: 25, spoolWeight: 1000, wastage: 5, printerPower: 200, electricityCost: 0.15, laborRate: 20, designTime: 15, setupTime: 10, postProcessingTime: 20, qcTime: 5, printerCost: 500, investmentReturn: 3, dailyUsage: 8, repairCostPercentage: 5, packagingItems: [], extraCosts: [] },
        pricingInputs: { consumer: { tax: 5, creditCardFee: 3, adsCost: 10, targetProfit: 20 }, reseller: { tax: 5, creditCardFee: 2, targetProfit: 15 } }
    },
    {
        id: 'template-2', name: 'Quick ABS Prototype (50g)', createdAt: new Date('2024-04-20T14:30:00Z').toISOString(),
        inputs: { jobName: 'Quick ABS Prototype', productImage: 'https://placehold.co/100x100/EF4444/FFFFFF/png', currency: 'USD', printHours: 2, printMinutes: 0, filamentWeight: 50, filamentType: 'abs', spoolPrice: 30, spoolWeight: 1000, wastage: 8, printerPower: 250, electricityCost: 0.15, laborRate: 25, designTime: 0, setupTime: 5, postProcessingTime: 15, qcTime: 5, printerCost: 800, investmentReturn: 3, dailyUsage: 6, repairCostPercentage: 7, packagingItems: [], extraCosts: [] },
        pricingInputs: { consumer: { tax: 5, creditCardFee: 3, adsCost: 15, targetProfit: 25 }, reseller: { tax: 5, creditCardFee: 2, targetProfit: 18 } }
    },
    {
        id: 'template-3', name: 'Detailed Resin Miniature (15ml)', createdAt: new Date('2024-05-10T09:00:00Z').toISOString(),
        inputs: { jobName: 'Detailed Resin Miniature', productImage: 'https://placehold.co/100x100/8B5CF6/FFFFFF/png', currency: 'EUR', printHours: 4, printMinutes: 0, filamentWeight: 20, filamentType: 'resin', spoolPrice: 45, spoolWeight: 1000, wastage: 15, printerPower: 80, electricityCost: 0.20, laborRate: 22, designTime: 0, setupTime: 20, postProcessingTime: 45, qcTime: 15, printerCost: 2500, investmentReturn: 4, dailyUsage: 10, repairCostPercentage: 10, packagingItems: [], extraCosts: [] },
        pricingInputs: { consumer: { tax: 7, creditCardFee: 3, adsCost: 20, targetProfit: 30 }, reseller: { tax: 7, creditCardFee: 2, targetProfit: 20 } }
    },
];

export const generateInitialLoggedCalculations = (): LoggedCalculation[] => [
    {
        id: 'log-1', createdAt: new Date('2024-05-15T11:00:00Z').toISOString(),
        inputs: generateInitialCostingTemplates()[0].inputs,
        pricingInputs: generateInitialCostingTemplates()[0].pricingInputs,
        results: { filamentCost: 3, electricityCost: 0.16, machineCost: 0.13, laborCost: 26.67, repairCost: 0.01, packagingCost: 0, extraCosts: [], extraCostsTotal: 0, subtotal: 29.97, consumerPrice: 57.63, consumerGrossProfit: 27.66, consumerNetProfit: 14.41, resellerPrice: 42.81, resellerGrossProfit: 12.84, resellerNetProfit: 6.42 }
    },
    {
        id: 'log-2', createdAt: new Date('2024-05-14T16:45:00Z').toISOString(),
        inputs: { ...generateInitialCostingTemplates()[1].inputs, jobName: "Gear Prototype V2" },
        pricingInputs: generateInitialCostingTemplates()[1].pricingInputs,
        results: { filamentCost: 1.5, electricityCost: 0.08, machineCost: 0.08, laborCost: 10.42, repairCost: 0.01, packagingCost: 0, extraCosts: [], extraCostsTotal: 0, subtotal: 12.09, consumerPrice: 20.84, consumerGrossProfit: 8.75, consumerNetProfit: 5.21, resellerPrice: 15.11, resellerGrossProfit: 3.02, resellerNetProfit: 2.27 }
    }
];


    
