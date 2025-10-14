
'use server';

/**
 * @fileOverview A simple conversational AI flow with access to application data.
 *
 * - chat - A function that takes a prompt and history and returns a response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { MessageData } from 'genkit';
import { 
    generateInitialPrinters, 
    generateInitialOrders, 
    generateInitialUnassignedJobs,
    generateInitialCustomers,
    generateInitialInventory,
    generateInitialRawMaterials,
    generateInitialDocuments,
    generateInitialCostingTemplates,
} from '@/hooks/workspace-data';

// --- Tool Definitions ---

const listPrintersTool = ai.defineTool(
  {
    name: 'listPrinters',
    description: 'Get a list of all 3D printers in the fleet, including their real-time status and current job.',
    outputSchema: z.array(z.object({
        id: z.string(),
        name: z.string(),
        technology: z.string(),
        location: z.string(),
        status: z.string(),
        currentJob: z.string().optional().describe("The name of the job currently being printed."),
        progress: z.number().optional().describe("The progress of the current job as a percentage."),
        completionEstimate: z.string().optional().describe("The estimated completion time for the current job."),
    })),
  },
  async () => {
    // In a real app, this data would be live from the workspace context or a database
    const printers = generateInitialPrinters(); 
    // This is a simplified simulation. A real implementation would query the live schedule.
    const mockSchedule = [
        { printerId: '1', jobName: 'PROJ-A Housing', progress: 75, durationHours: 4 },
        { printerId: '3', jobName: 'PROJ-C Prototype', progress: 40, durationHours: 8 },
        { printerId: '5', jobName: 'PROJ-E Casing', progress: 90, durationHours: 4 },
    ];

    return printers.map((p, index) => {
        const scheduledJob = mockSchedule.find(j => j.printerId === p.id);
        if (scheduledJob) {
            const remainingHours = scheduledJob.durationHours * (1 - scheduledJob.progress / 100);
            const completionDate = new Date(Date.now() + remainingHours * 60 * 60 * 1000);
            return {
                id: p.id, name: p.name, technology: p.technology, location: p.location,
                status: 'printing',
                currentJob: scheduledJob.jobName,
                progress: scheduledJob.progress,
                completionEstimate: completionDate.toISOString(),
            };
        }
        return {
            id: p.id, name: p.name, technology: p.technology, location: p.location,
            status: index % 4 === 0 ? 'maintenance' : 'idle',
        };
    });
  }
);

const getProjectWorkflowTool = ai.defineTool(
    {
        name: 'getProjectWorkflow',
        description: 'Get a list of all projects and their current status in the workflow.',
        outputSchema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            status: z.string().describe('The current stage of the project in the workflow, e.g., "Order Received", "In Queue", "Printing", "Dispatched".'),
        })),
    },
    async () => {
        const orders = generateInitialOrders();
        const unassignedJobs = generateInitialUnassignedJobs();

        const workflowStatusMap = {
            'pending': 'Order Received',
            'in-progress': 'Printing',
            'completed': 'Dispatched',
            'overdue': 'Printing (Overdue)',
            'qc': 'Quality Control',
            'packing': 'Packing'
        } as const;

        const projectsInPipeline = orders.map(order => ({
            id: `ORD-${order.id}`,
            name: `Order: ${order.orderNumber}`,
            status: workflowStatusMap[order.status as keyof typeof workflowStatusMap] || 'Unknown',
        }));

        const jobsInQueue = unassignedJobs.map(job => ({
            id: `JOB-${job.id}`,
            name: job.name,
            status: 'In Queue',
        }));

        return [...projectsInPipeline, ...jobsInQueue];
    }
);

const listCustomersTool = ai.defineTool(
    {
        name: 'listCustomers',
        description: 'Get a list of all customers, or find a specific customer by name.',
        inputSchema: z.object({ name: z.string().optional().describe("The name of the customer to search for.") }),
        outputSchema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            company: z.string().optional(),
        })),
    },
    async (input) => {
        const customers = generateInitialCustomers();
        if (input.name) {
            const filtered = customers.filter(c => c.name.toLowerCase().includes(input.name!.toLowerCase()));
            return filtered.map(({ id, name, company }) => ({ id, name, company }));
        }
        return customers.map(({ id, name, company }) => ({ id, name, company }));
    }
);

const getInventoryStatusTool = ai.defineTool(
    {
        name: 'getInventoryStatus',
        description: "Check the stock levels of inventory items, including raw materials (filaments, resins, powders) and other components. You can filter by name or status.",
        inputSchema: z.object({
            itemName: z.string().optional().describe("The name of the item to check."),
            status: z.enum(["Low Stock", "Out of Stock", "Need Reorder", "In Stock"]).optional().describe("Filter by a specific stock status."),
        }),
        outputSchema: z.array(z.object({
            name: z.string(),
            type: z.string().describe("The type of item (e.g., 'Filament Spool', 'Resin', 'Powder', 'Inventory Item')."),
            quantity: z.number().or(z.string()),
            status: z.string(),
        })),
    },
    async (input) => {
        const { spools, resins, powders } = generateInitialRawMaterials();
        const otherInventory = generateInitialInventory();

        const allItems = [
            ...spools.map(s => ({ name: s.name, type: 'Filament Spool', quantity: `${1000 - s.used}/${s.weight}g`, status: s.status })),
            ...resins.map(r => ({ name: r.name, type: 'Resin', quantity: `${1000 - r.used}/${r.volume}ml`, status: r.status })),
            ...powders.map(p => ({ name: p.name, type: 'Powder', quantity: `${p.weight - p.used}/${p.weight}kg`, status: p.status })),
            ...otherInventory.map(i => ({ name: i.name, type: 'Inventory Item', quantity: i.quantity, status: i.status })),
        ];

        let filteredItems = allItems;

        if (input.itemName) {
            filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(input.itemName!.toLowerCase()));
        }

        if (input.status) {
            filteredItems = filteredItems.filter(item => item.status === input.status);
        }

        return filteredItems;
    }
);

const getOrdersTool = ai.defineTool(
    {
        name: 'getOrders',
        description: "Get a list of orders. You can filter by customer name, order number, or order status.",
        inputSchema: z.object({
            customerName: z.string().optional().describe("The name of the customer to retrieve orders for."),
            orderNumber: z.string().optional().describe("The specific order number to retrieve."),
            status: z.enum(["pending", "in-progress", "completed", "overdue", "qc", "packing", "dispatched"]).optional().describe("Filter orders by their status."),
        }),
        outputSchema: z.array(z.object({
            orderNumber: z.string(),
            customer: z.string(),
            orderDate: z.string(),
            status: z.string(),
            items: z.number(),
        })),
    },
    async (input) => {
        let orders = generateInitialOrders();
        
        if (input.customerName) {
            orders = orders.filter(o => o.customer.toLowerCase().includes(input.customerName!.toLowerCase()));
        }
        
        if (input.orderNumber) {
            orders = orders.filter(o => o.orderNumber.toLowerCase() === input.orderNumber!.toLowerCase());
        }

        if (input.status) {
            orders = orders.filter(o => o.status === input.status);
        }
        
        return orders.map(({orderNumber, customer, orderDate, status, items}) => ({orderNumber, customer, orderDate, status, items}));
    }
);

const GetDocumentsInputSchema = z.object({
    customerName: z.string().optional().describe("The name of the customer to filter documents for."),
    documentType: z.enum(["Quotation", "Purchase Order", "Tax Invoice"]).optional().describe("The specific type of document to retrieve."),
});
export type GetDocumentsInput = z.infer<typeof GetDocumentsInputSchema>;


const getDocumentsTool = ai.defineTool(
    {
        name: 'getDocuments',
        description: "Retrieves a list of financial documents (Quotations, Purchase Orders, Tax Invoices). Can be filtered by document type and customer name.",
        inputSchema: GetDocumentsInputSchema,
        outputSchema: z.array(z.object({
            orderNumber: z.string(),
            customerName: z.string(),
            type: z.string(),
            date: z.string(),
            amount: z.number(),
        }))
    },
    async (input) => {
        let documents = generateInitialDocuments();
        const customers = generateInitialCustomers();

        if (input.customerName) {
            const customer = customers.find(c => c.name.toLowerCase().includes(input.customerName!.toLowerCase()));
            if (customer) {
                documents = documents.filter(d => d.customerId === customer.id);
            } else {
                return []; // No customer found, return no documents
            }
        }

        if (input.documentType) {
            documents = documents.filter(d => d.type === input.documentType);
        }
        
        return documents.map(doc => {
            const customer = customers.find(c => c.id === doc.customerId);
            return {
                orderNumber: doc.orderNumber,
                customerName: customer?.name || 'Unknown',
                type: doc.type,
                date: doc.date,
                amount: doc.amount,
            };
        });
    }
);

const getCostingTemplatesTool = ai.defineTool(
    {
        name: 'getCostingTemplates',
        description: "Retrieves a list of saved costing templates. Can be filtered by template name.",
        inputSchema: z.object({
            templateName: z.string().optional().describe("The name of the template to search for."),
        }),
        outputSchema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            jobName: z.string().describe("The job name associated with the template."),
            printTime: z.string().describe("The print time, e.g., '5h 30m'."),
            filamentWeight: z.number().describe("Filament weight in grams."),
        }))
    },
    async (input) => {
        let templates = generateInitialCostingTemplates(); // This would fetch from a database or state management

        if (input.templateName) {
            templates = templates.filter(t => t.name.toLowerCase().includes(input.templateName!.toLowerCase()));
        }
        
        return templates.map(t => ({
            id: t.id,
            name: t.name,
            jobName: t.inputs.jobName,
            printTime: `${t.inputs.printHours}h ${t.inputs.printMinutes}m`,
            filamentWeight: Number(t.inputs.filamentWeight),
        }));
    }
);


// This is an exported function that can be called from other server-side components
export async function getDocuments(input: GetDocumentsInput) {
    return await getDocumentsTool(input);
};


const allTools = [
    listPrintersTool, 
    getProjectWorkflowTool, 
    listCustomersTool, 
    getInventoryStatusTool,
    getOrdersTool,
    getDocumentsTool,
    getCostingTemplatesTool
];

export async function chat(input: { prompt: string, history?: { role: 'user' | 'model', content: string }[] }) {
  // Filter out any tool requests/responses from the history to prevent data leakage and keep context clean.
  const history: MessageData[] = (input.history || [])
    .filter(h => h.role === 'user' || h.role === 'model') // Only keep user and model messages
    .map(h => ({
        role: h.role,
        content: [{ text: h.content }],
    }));

  const result = await ai.generate({
    model: 'googleai/gemini-1.5-flash-latest',
    messages: [...history, { role: 'user', content: [{ text: input.prompt }] }],
    tools: allTools,
    system: "You are a helpful assistant for a 3D printing farm. You have access to a comprehensive set of tools to query real-time data about the application. Use these tools to answer user questions about printers, project workflows, customers, orders, documents (like invoices), and inventory. When asked for structured data, ALWAYS format your response as a Markdown table for clarity. Use lists for enumerations and bold text for emphasis to make your responses as clear and interactive as possible."
  });

  const responseText = result.text;
  
  if (!responseText) {
    // Check if the model decided to use a tool but something went wrong.
    const toolRequests = result.toolRequests;
    if (toolRequests && toolRequests.length > 0) {
        return { response: "I tried to use a tool to find the answer, but I encountered an issue. Please try rephrasing your question." };
    }
    throw new Error("The model did not return a valid response.");
  }
  
  return { response: responseText };
}
