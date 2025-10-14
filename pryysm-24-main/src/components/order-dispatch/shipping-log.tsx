
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { LoggedShippingLabel } from '@/hooks/use-workspace';
import type { ShippingInfo } from './shipping-label';

interface ShippingLogProps {
    logs: LoggedShippingLabel[];
    onPreview: (info: ShippingInfo) => void;
}

export function ShippingLog({ logs, onPreview }: ShippingLogProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-primary"/>
                    Shipping Log
                </CardTitle>
                <CardDescription>
                    A historical record of all generated shipping labels.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-[30rem] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Logged On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length > 0 ? (
                                logs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.info.orderId}</TableCell>
                                        <TableCell>{log.info.to.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{format(new Date(log.createdAt), "dd-MM-yy, h:mm a")}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPreview(log.info)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No labels have been logged yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
