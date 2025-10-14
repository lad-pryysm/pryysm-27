
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { PlusCircle, ListTree, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { NewJobData, Job, Machine, AutoAssignSuggestion } from './types'
import { ProjectQueue } from './project-queue'
import { SubmitJobForm } from './submit-job-form'
import { MachineList } from './machine-list'
import { AutoAssignConfirmationDialog } from './auto-assign-confirmation-dialog'
import { useWorkspace, type Printer, type PrinterStatus, type PrinterTechnology } from '@/hooks/use-workspace'
import { Droplets, Sparkles, Diamond } from 'lucide-react'
import { Printer as PrinterIcon } from 'lucide-react'
import { PrinterLogModal } from '../printers/printer-log-modal'

const technologyDisplayNames: { [key: string]: string } = {
  'FDM': 'FDM (Fused Deposition Modeling)',
  'SLA': 'SLA (Stereolithography)',
  'DLP': 'DLP (Digital Light Processing)',
  'SLS': 'SLS (Selective Laser Sintering)',
  'MJF': 'MJF (Multi Jet Fusion)',
  'EBM': 'EBM (Electron Beam Melting)',
  'DMLS': 'DMLS (Direct Metal Laser Sintering)',
};

const allAvailableTechnologies: PrinterTechnology[] = ['FDM', 'SLA', 'SLS', 'DLP', 'MJF', 'EBM', 'DMLS'];


const technologyIcons: { [key: string]: React.ElementType } = {
    'FDM': PrinterIcon,
    'SLA': Droplets,
    'DLP': Droplets,
    'SLS': Sparkles,
    'MJF': Sparkles,
    'EBM': Diamond,
    'DMLS': Diamond
};


export function JobAllotmentClient() {
    const { toast } = useToast();

    const {
        printers: machines, 
        schedule, 
        unassignedJobs,
        addUnassignedJob, 
        updateUnassignedJob, 
        deleteUnassignedJob,
        assignJobToMachine,
        findOptimalSlot
    } = useWorkspace();
    
    const [isAddProjectModalOpen, setAddProjectModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [techFilter, setTechFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | PrinterStatus>('all');
    
    const [suggestion, setSuggestion] = useState<AutoAssignSuggestion | null>(null);
    const [selectedPrinterForLog, setSelectedPrinterForLog] = useState<Printer | null>(null);

    const filteredJobs = useMemo(() => {
        if (techFilter === 'all') {
            return unassignedJobs;
        }
        return unassignedJobs.filter(job => job.requiredTechnology === techFilter);
    }, [unassignedJobs, techFilter]);
    
    const filteredMachines = useMemo(() => {
        return machines.filter(machine => {
            const techMatch = techFilter === 'all' || machine.technology === techFilter;
            const statusMatch = statusFilter === 'all' || machine.status === statusFilter;
            return techMatch && statusMatch;
        });
    }, [machines, techFilter, statusFilter]);

    const handleJobSubmit = (jobData: NewJobData) => {
        const totalItems = jobData.itemGroups.reduce((acc, group) => acc + group.quantity, 0);
        
        const timePerItemMinutes = (jobData.estHoursPerItem * 60) + jobData.estMinutesPerItem;
        const totalBaseMinutes = timePerItemMinutes * totalItems;
        const bufferMinutes = totalBaseMinutes * 0.05; // 5% buffer
        const totalEstimatedTime = Math.ceil(totalBaseMinutes + bufferMinutes);

        if (editingJob) {
            updateUnassignedJob({
                ...editingJob,
                ...jobData,
                estimatedTime: totalEstimatedTime,
                items: totalItems,
            });
            toast({ title: 'Job Updated', description: `Job "${jobData.name}" has been updated.` });
        } else {
            addUnassignedJob({
                id: Date.now(),
                name: jobData.name,
                projectCode: jobData.projectCode,
                priority: jobData.priority,
                deadline: jobData.deadline,
                requiredTechnology: jobData.requiredTechnology,
                estimatedTime: totalEstimatedTime,
                items: totalItems,
                imageUrl: jobData.imageUrl,
                itemGroups: jobData.itemGroups,
            } as Job);
            toast({ title: 'Job Added', description: `Job "${jobData.name}" has been added to the queue.` });
        }

        setAddProjectModalOpen(false);
        setEditingJob(null);
    };

    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setAddProjectModalOpen(true);
    };
    
    const handleAutoAssign = (job: Job) => {
        const optimalSlot = findOptimalSlot(job);
        if (optimalSlot) {
            setSuggestion({
                job: job,
                machine: optimalSlot.machine,
                startTime: optimalSlot.startTime,
            });
        } else {
            toast({
                variant: "destructive",
                title: "No Optimal Slot Found",
                description: "Could not find a suitable slot for this job. Consider adjusting the deadline or filters.",
            });
        }
    };
    
    const confirmAutoAssignment = () => {
        if (!suggestion) return;
        assignJobToMachine(suggestion.job, suggestion.machine.id);
        setSuggestion(null);
    };


    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <ListTree className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Job Allotment</h1>
                        <p className="text-sm text-muted-foreground">Drag and drop projects to assign them to printers.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setAddProjectModalOpen(true)}>
                        <PlusCircle className="mr-2" />
                        Add New Project
                    </Button>
                </div>
            </header>
            
            <ProjectQueue
                jobs={filteredJobs}
                machines={filteredMachines}
                schedule={schedule}
                onAssign={(jobId, machineId) => {
                    const job = unassignedJobs.find(j => j.id === jobId);
                    if (job) assignJobToMachine(job, machineId);
                }}
                onAutoAssign={handleAutoAssign}
                onEdit={handleEditJob}
                onDelete={deleteUnassignedJob}
                techFilter={techFilter}
                onTechFilterChange={setTechFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                availableTechnologies={allAvailableTechnologies}
                technologyDisplayNames={technologyDisplayNames}
            />

            <MachineList 
                machines={filteredMachines}
                schedule={schedule}
                technologyIcons={technologyIcons}
                onViewLog={setSelectedPrinterForLog}
            />

            <SubmitJobForm
                isOpen={isAddProjectModalOpen}
                onClose={() => { setAddProjectModalOpen(false); setEditingJob(null); }}
                onSubmit={handleJobSubmit}
                jobToEdit={editingJob}
            />
            
            <AutoAssignConfirmationDialog
                suggestion={suggestion}
                onClose={() => setSuggestion(null)}
                onConfirm={confirmAutoAssignment}
            />

            {selectedPrinterForLog && (
                <PrinterLogModal
                    isOpen={!!selectedPrinterForLog}
                    onClose={() => setSelectedPrinterForLog(null)}
                    printer={selectedPrinterForLog}
                    jobs={schedule.find(s => s.printerId === selectedPrinterForLog!.id)?.jobs || []}
                />
            )}
        </div>
    );
}
