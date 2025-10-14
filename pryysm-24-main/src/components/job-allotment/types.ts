
import type { Printer, Job as WorkspaceJob, ItemGroup as WorkspaceItemGroup } from '@/hooks/use-workspace';

export type ItemGroup = WorkspaceItemGroup;

// Re-exporting Job with the added isConfirmed property from the workspace
export type Job = WorkspaceJob;


export type NewJobData = {
    name: string;
    projectCode: string;
    priority: 'Low' | 'Medium' | 'High';
    deadline: string;
    requiredTechnology: string;
    imageUrl?: string;
    itemGroups: ItemGroup[];
    items: number;
    estHoursPerItem: number;
    estMinutesPerItem: number;
    notes?: string;
    isEmergency?: boolean;
}

export type Machine = Printer;


export interface PrintQueueItem {
    jobId: number;
    machineId: number;
}

export interface AutoAssignSuggestion {
    job: Job;
    machine: Machine;
    startTime: Date;
}

export interface ScheduledJob {
    printerId: string;
    jobs: Job[];
}
