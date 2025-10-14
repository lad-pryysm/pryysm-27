

"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react'
import type { Printer, ScheduledJob, Job } from '@/hooks/use-workspace'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format, isSameDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, addWeeks, subWeeks, addMonths, subMonths, differenceInHours } from "date-fns"
import { cn } from "@/lib/utils"


interface ScheduleViewProps {
    printers: Printer[];
    schedule: ScheduledJob[];
    isPreviewing: boolean;
}

export function ScheduleView({ printers, schedule, isPreviewing }: ScheduleViewProps) {
    const [view, setView] = useState('day');
    const [currentDate, setCurrentDate] = useState<Date | undefined>();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Set time only on the client side
      setCurrentDate(new Date());
      const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
      
      return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if(!currentTime) {
            setCurrentTime(new Date());
        }
    }, [currentTime]);
    
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);


    const changeDate = (offset: number) => {
        if (!currentDate) return;
        setCurrentDate(prev => {
            if (!prev) return new Date();
            let newDate;
            if (view === 'day') newDate = offset > 0 ? addDays(prev, 1) : subDays(prev, 1);
            else if(view === 'week') newDate = offset > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1);
            else newDate = offset > 0 ? addMonths(prev, 1) : subMonths(prev, 1);
            return newDate;
        });
    };
    
    const { interval, totalSlots, slotWidthPx } = useMemo(() => {
        if (!currentDate) return { interval: { start: new Date(), end: new Date() }, totalSlots: 0, slotWidthPx: 0 };
        
        let interval;
        const availableWidth = containerWidth > 0 ? containerWidth - 128 : 1000; // 128 is printer column width
        let minSlotWidth = 64;
        
        if (view === 'week') {
            interval = { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
            minSlotWidth = 96;
        } else if (view === 'month') {
            interval = { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
            minSlotWidth = 48;
        } else { // day view
            interval = { start: currentDate, end: currentDate };
        }
        
        const totalSlots = view === 'day' ? 24 : eachDayOfInterval(interval).length;
        const calculatedSlotWidth = availableWidth / totalSlots;
        const slotWidthPx = Math.max(minSlotWidth, calculatedSlotWidth);

        return { interval, totalSlots, slotWidthPx };
    }, [currentDate, view, containerWidth]);


    const renderTimeHeader = () => {
        if (!currentDate) return null;
        if (view === 'day') {
            return Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-shrink-0 text-center text-xs p-2 border-r" style={{ width: `${slotWidthPx}px` }}>{`${i}:00`}</div>
            ));
        }
        const days = eachDayOfInterval(interval);
        return days.map(day => (
             <div key={day.toString()} className={`flex-shrink-0 text-center text-sm p-2 border-r`} style={{ width: `${slotWidthPx}px` }}>
                {view !== 'month' && <div>{format(day, 'EEE')}</div>}
                <div className="font-bold">{format(day, 'd')}</div>
            </div>
        ));
    };
    
    const renderGanttRows = () => {
        if (printers.length === 0) {
            return (
                <div className="text-center text-muted-foreground p-8">
                    No schedule to display for the selected technology.
                </div>
            )
        }
        return printers.map(printer => {
            const printerSchedule = schedule.find(s => s.printerId === printer.id);
            
            return (
                <div key={printer.id} className="flex items-stretch border-b last:border-b-0 h-14">
                    <div className="w-32 flex-shrink-0 p-2 border-r font-medium text-sm flex items-center bg-background sticky left-0 z-10">{printer.name}</div>
                    <div className="flex-1 relative" style={{minWidth: `${totalSlots * slotWidthPx}px`}}>
                         <div className="absolute inset-0 flex">
                           {Array.from({ length: totalSlots }).map((_, i) => (
                                <div key={i} className="flex-shrink-0 h-full border-r last:border-r-0" style={{ width: `${slotWidthPx}px` }}></div>
                            ))}
                        </div>
                        <div className="relative h-full flex items-center p-1">
                            {printerSchedule?.jobs.map(job => {
                                 let left, width;
                                 const jobStart = new Date(job.start);
                                 const jobEnd = new Date(job.end);

                                if (jobEnd < interval.start || jobStart > interval.end) {
                                    return null; // Job is outside the current view
                                }

                                if (view === 'day') {
                                     if (!isSameDay(jobStart, interval.start) && !isSameDay(jobEnd, interval.start) && !(jobStart < interval.start && jobEnd > interval.start)) return null;

                                     const startOfDay = new Date(interval.start);
                                     startOfDay.setHours(0,0,0,0);
                                     const endOfDay = new Date(interval.start);
                                     endOfDay.setHours(23,59,59,999);

                                     const effectiveStart = jobStart < startOfDay ? startOfDay : jobStart;
                                     const effectiveEnd = jobEnd > endOfDay ? endOfDay : jobEnd;
                                     
                                     const startHour = effectiveStart.getHours() + effectiveStart.getMinutes() / 60;
                                     const endHour = effectiveEnd.getHours() + effectiveEnd.getMinutes() / 60;
                                     
                                     left = startHour * slotWidthPx;
                                     width = (endHour - startHour) * slotWidthPx;

                                } else {
                                     const intervalStartDay = new Date(interval.start);
                                     intervalStartDay.setHours(0,0,0,0);
                                     
                                     const effectiveStart = jobStart < intervalStartDay ? intervalStartDay : jobStart;
                                     const effectiveEnd = jobEnd > interval.end ? interval.end : jobEnd;

                                     const startDayIndex = differenceInDays(effectiveStart, intervalStartDay);
                                     const durationHours = differenceInHours(effectiveEnd, effectiveStart);
                                     const durationDays = durationHours / 24;

                                     left = startDayIndex * slotWidthPx;
                                     width = durationDays * slotWidthPx;
                                }

                                if (width <= 0) return null;
                                
                                const jobClasses = cn(
                                    "absolute h-10 rounded text-white text-xs p-1 flex items-center justify-center overflow-hidden cursor-pointer",
                                    { "border-4 border-double border-destructive": job.isPreview },
                                    { "opacity-75": !job.isConfirmed }
                                );

                                return (
                                <Popover key={job.id}>
                                    <PopoverTrigger asChild>
                                        <button
                                            title={job.name}
                                            className={jobClasses}
                                            style={{ left: `${left}px`, width: `${width}px`, backgroundColor: job.color }}
                                        >
                                            {job.isConfirmed && <Check className="h-4 w-4 absolute top-1 left-1" />}
                                            <span className="truncate px-1">{job.name}</span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60">
                                        <div className="space-y-2 text-sm">
                                            <h4 className="font-semibold">{job.name}</h4>
                                            {job.isConfirmed && <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmed</Badge>}
                                            <p><strong>Project Code:</strong> {job.projectCode}</p>
                                            <p><strong>Printer:</strong> {printers.find(p=>p.id === printer.id)?.name}</p>
                                            <p><strong>Start:</strong> {format(new Date(job.start), "dd-MM-yyyy HH:mm")}</p>
                                            <p><strong>End:</strong> {format(new Date(job.end), "dd-MM-yyyy HH:mm")}</p>
                                            <p><strong>Duration:</strong> {job.duration} hours</p>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                )
                            })}
                        </div>
                    </div>
                </div>
            );
        });
    };

    const totalWidth = totalSlots * slotWidthPx;
    
    const displayDate = () => {
        if (!currentDate) return 'Pick a date';
        if (view === 'day') return format(currentDate, "dd-MM-yyyy");
        if (view === 'week') return `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd-MM")} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd-MM-yyyy")}`;
        if (view === 'month') return format(currentDate, "MMMM yyyy");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-center">
                        <CardTitle>Printing Schedule</CardTitle>
                        {isPreviewing && <Badge variant="outline" className="border-accent text-accent ml-3">Preview Mode</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeDate(-1)}>
                             <ChevronLeft className="h-4 w-4" />
                         </Button>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                size="sm"
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !currentDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {displayDate()}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={currentDate}
                                onSelect={(d) => setCurrentDate(d)}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => changeDate(1)}>
                            <ChevronRight className="h-4 w-4" />
                         </Button>
                         <Button onClick={() => setCurrentDate(new Date())} variant="outline" size="sm">Today</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={view} onValueChange={setView} className="mb-4">
                    <TabsList>
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="overflow-x-auto border rounded-lg" ref={containerRef}>
                    <div style={{ width: `calc(128px + ${totalWidth}px)`}}>
                        <div className="flex border-b bg-muted/50 sticky top-0 z-20">
                            <div className="w-32 flex-shrink-0 p-2 font-semibold text-sm border-r bg-background sticky left-0 z-10">Printer</div>
                            <div className="flex-1 flex">{renderTimeHeader()}</div>
                        </div>
                        <div className="relative">
                            {renderGanttRows()}
                            {view === 'day' && currentTime && isSameDay(currentDate || new Date(), currentTime) && (
                                <div className="absolute top-0 bottom-0 z-15" style={{ left: `calc(128px + ${currentTime.getHours() * slotWidthPx}px + ${(currentTime.getMinutes() / 60) * slotWidthPx}px)` }}>
                                    <div className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-5"></div>
                                    <div className="absolute top-[-20px] left-[-15px] bg-red-500 text-white p-1 rounded text-[10px] whitespace-nowrap">
                                        {currentTime.getHours()}:{currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
