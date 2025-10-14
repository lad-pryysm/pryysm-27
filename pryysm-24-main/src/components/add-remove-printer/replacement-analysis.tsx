
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { differenceInDays, format } from 'date-fns'
import { AlertCircle, CalendarIcon, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { useWorkspace } from '@/hooks/use-workspace'
import type { Printer } from '@/hooks/use-workspace'


export function ReplacementAnalysis() {
    const { printers } = useWorkspace();
    const [replacementCycleDays, setReplacementCycleDays] = useState(365);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const analyzedPrinters = useMemo(() => {
        if (!isClient) return [];
        const today = new Date();
        return printers
            .map(printer => {
                const ageInDays = differenceInDays(today, new Date(printer.initializationDate));
                return {
                    ...printer,
                    ageInDays,
                    isDue: ageInDays > replacementCycleDays
                };
            })
            .sort((a, b) => b.ageInDays - a.ageInDays);
    }, [printers, replacementCycleDays, isClient]);

    if (!isClient) {
        return null;
    }

    const printersDue = analyzedPrinters.filter(p => p.isDue);
    const printersNotDue = analyzedPrinters.filter(p => !p.isDue);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="text-primary" />
                    Replacement Analysis
                </CardTitle>
                <CardDescription>
                    Identify printers that are due for replacement based on their age.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-w-sm mb-6">
                    <Label htmlFor="replacement-days">Replacement Cycle (Days)</Label>
                    <Input 
                        id="replacement-days"
                        type="number"
                        value={replacementCycleDays}
                        onChange={e => setReplacementCycleDays(Number(e.target.value) || 0)}
                    />
                     <p className="text-xs text-muted-foreground mt-2">
                        Set the expected lifecycle duration for your printers in days.
                    </p>
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Printer Name</TableHead>
                                <TableHead>Code Name</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Initialized On</TableHead>
                                <TableHead className="text-right">Age (Days)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {printersDue.length > 0 && (
                                <>
                                    <TableRow>
                                        <TableCell colSpan={5} className="bg-destructive/10">
                                            <h3 className="font-semibold text-destructive flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Due for Replacement ({printersDue.length})
                                            </h3>
                                        </TableCell>
                                    </TableRow>
                                    {printersDue.map(printer => (
                                        <TableRow key={printer.id}>
                                            <TableCell className="font-medium text-destructive">{printer.name}</TableCell>
                                            <TableCell className="font-medium text-destructive">{printer.codeName}</TableCell>
                                            <TableCell>{printer.model}</TableCell>
                                            <TableCell className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {format(new Date(printer.initializationDate), 'dd-MM-yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-destructive">{printer.ageInDays}</TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            )}
                            
                            {printersNotDue.length > 0 && (
                                <>
                                    <TableRow>
                                        <TableCell colSpan={5} className="bg-green-500/10">
                                            <h3 className="font-semibold text-green-600 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Within Replacement Cycle ({printersNotDue.length})
                                            </h3>
                                        </TableCell>
                                    </TableRow>
                                    {printersNotDue.map(printer => (
                                        <TableRow key={printer.id}>
                                            <TableCell className="font-medium">{printer.name}</TableCell>
                                            <TableCell>{printer.codeName}</TableCell>
                                            <TableCell>{printer.model}</TableCell>
                                            <TableCell className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                                {format(new Date(printer.initializationDate), 'dd-MM-yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">{printer.ageInDays}</TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            )}
                            
                            {analyzedPrinters.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                         <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                            <p className="font-medium">No printers to analyze.</p>
                                            <p className="text-sm text-muted-foreground">Add printers to the fleet to see them here.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
