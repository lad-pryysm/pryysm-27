
"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AutoAssignSuggestion } from './types'
import { Zap, Check, X } from 'lucide-react'
import { format } from 'date-fns'


interface AutoAssignConfirmationDialogProps {
    suggestion: AutoAssignSuggestion | null;
    onClose: () => void;
    onConfirm: () => void;
}

export function AutoAssignConfirmationDialog({ suggestion, onClose, onConfirm }: AutoAssignConfirmationDialogProps) {
    if (!suggestion) return null;
    
    return (
        <Dialog open={!!suggestion} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="text-primary"/>
                        Confirm Auto-Assignment
                    </DialogTitle>
                     <DialogDescription>
                        The AI has found an optimal slot for this project. Please review and confirm.
                    </DialogDescription>
                </DialogHeader>

                <Alert>
                    <AlertTitle className="font-semibold">Assignment Details</AlertTitle>
                    <AlertDescription className="space-y-2 mt-2">
                        <p><strong>Project:</strong> {suggestion.job.name}</p>
                        <p><strong>Assign to Printer:</strong> {suggestion.machine.name}</p>
                        <p><strong>Proposed Start Time:</strong> {format(suggestion.startTime, 'dd-MM-yyyy, h:mm a')}</p>
                    </AlertDescription>
                </Alert>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <X className="mr-2 h-4 w-4"/> Cancel
                    </Button>
                     <Button onClick={onConfirm}>
                        <Check className="mr-2 h-4 w-4"/> Confirm & Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
