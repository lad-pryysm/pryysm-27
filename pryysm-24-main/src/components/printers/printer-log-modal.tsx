
"use client"

import React from 'react'
import type { Printer, Job } from '@/hooks/use-workspace'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface PrinterLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    printer: Printer;
    jobs: Job[];
}

export function PrinterLogModal({ isOpen, onClose, printer, jobs }: PrinterLogModalProps) {
    if (!printer) return null;

    const futureJobs = jobs.filter(job => new Date(job.start) >= new Date()).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Print Log: {printer.name}</DialogTitle>
                    <DialogDescription>
                        Showing all upcoming jobs scheduled for this printer.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ScrollArea className="h-72 border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {futureJobs.length > 0 ? (
                                    futureJobs.map(job => (
                                        <TableRow key={job.id}>
                                            <TableCell>
                                                <div className="font-medium">{job.name}</div>
                                                <div className="text-xs text-muted-foreground">{job.projectCode}</div>
                                            </TableCell>
                                            <TableCell>{format(new Date(job.start), 'dd-MM HH:mm')}</TableCell>
                                            <TableCell>{job.duration}h</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No future jobs scheduled.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
