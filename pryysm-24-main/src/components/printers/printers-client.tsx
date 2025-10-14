
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { GanttChartSquare, Zap, Server, Wrench, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleView } from './schedule-view'
import type { Printer } from '@/hooks/use-workspace'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkspace } from '@/hooks/use-workspace'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { PrinterLogModal } from './printer-log-modal'
import { PrinterJobManager } from './printer-job-manager'

const technologyDisplayNames: { [key: string]: string } = {
  'FDM': 'FDM (Fused Deposition Modeling)',
  'SLA': 'SLA (Stereolithography)',
  'DLP': 'DLP (Digital Light Processing)',
  'SLS': 'SLS (Selective Laser Sintering)',
  'MJF': 'MJF (Multi Jet Fusion)',
  'EBM': 'EBM (Electron Beam Melting)',
  'DMLS': 'DMLS (Direct Metal Laser Sintering)',
};

export function PrintersClient() {
    const { printers: machines, schedule, confirmJobUpload } = useWorkspace();

    const [ganttTechnologyFilter, setGanttTechnologyFilter] = useState('all');
    const [selectedPrinterForLog, setSelectedPrinterForLog] = useState<Printer | null>(null);

     const availableTechnologies = useMemo(() => {
        const techSet = new Set((machines || []).map(p => p.technology));
        return Array.from(techSet);
    }, [machines]);

    const filteredPrinters = useMemo(() => {
        if (ganttTechnologyFilter === 'all') {
            return machines;
        }
        return (machines || []).filter(p => p.technology === ganttTechnologyFilter);
    }, [machines, ganttTechnologyFilter]);

    const filteredDisplaySchedule = useMemo(() => {
        const filteredPrinterIds = new Set((filteredPrinters || []).map(p => p.id));
        return schedule.filter(s => filteredPrinterIds.has(s.printerId));
    }, [schedule, filteredPrinters]);

    const statusCounts = useMemo(() => {
        const initialCounts: Record<string, number> = { running: 0, idle: 0, maintenance: 0, offline: 0 };
        return (machines || []).reduce((acc, printer) => {
            const status = printer.status === 'printing' ? 'running' : printer.status;
            if (status in acc) {
              acc[status]++;
            }
            return acc;
        }, initialCounts);
    }, [machines]);

    return (
        <>
            <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <GanttChartSquare className="text-primary h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">3D Printer Management</h1>
                            <p className="text-sm text-muted-foreground">View the status of all printers and the full schedule.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Printing</CardTitle>
                            <Zap className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusCounts.running || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Idle</CardTitle>
                            <Server className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusCounts.idle || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                            <Wrench className="h-5 w-5 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusCounts.maintenance || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Offline</CardTitle>
                            <XCircle className="h-5 w-5 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statusCounts.offline || 0}</div>
                        </CardContent>
                    </Card>
                </div>


                <div className="w-full md:w-auto md:max-w-xs ml-auto">
                    <Label htmlFor="tech-filter" className="text-sm font-medium">Filter by Technology</Label>
                    <Select value={ganttTechnologyFilter} onValueChange={setGanttTechnologyFilter}>
                        <SelectTrigger id="tech-filter" className="w-full mt-1">
                            <SelectValue placeholder="Select a technology" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Technologies</SelectItem>
                            {availableTechnologies.map(tech => (
                                <SelectItem key={tech} value={tech}>
                                    {technologyDisplayNames[tech] || tech}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <ScheduleView
                    printers={filteredPrinters}
                    schedule={filteredDisplaySchedule}
                    isPreviewing={false}
                />

                <div className="pt-8">
                    <PrinterJobManager />
                </div>
            </div>
            {selectedPrinterForLog && (
                <PrinterLogModal
                    isOpen={!!selectedPrinterForLog}
                    onClose={() => setSelectedPrinterForLog(null)}
                    printer={selectedPrinterForLog}
                    jobs={schedule.find(s => s.printerId === selectedPrinterForLog.id)?.jobs || []}
                />
            )}
        </>
    )
}
