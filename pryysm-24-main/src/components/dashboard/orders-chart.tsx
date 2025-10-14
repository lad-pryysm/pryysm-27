
"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useWorkspace } from "@/hooks/use-workspace"
import { startOfWeek, endOfWeek, eachWeekOfInterval, format, startOfMonth, endOfMonth, eachMonthOfInterval, getYear, getMonth, getWeek } from "date-fns"


export function OrdersChart() {
  const { orders } = useWorkspace();
  const [timeframe, setTimeframe] = useState("Month")

  const data = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const now = new Date();
    
    if (timeframe === "Year") {
        const yearData: { [key: string]: number } = {};
        orders.forEach(order => {
            const year = getYear(new Date(order.orderDate));
            yearData[year] = (yearData[year] || 0) + 1;
        });
        return Object.entries(yearData).map(([name, orders]) => ({ name, orders })).sort((a,b) => parseInt(a.name) - parseInt(b.name));
    }
    
    if (timeframe === "Month") {
        const monthData: { [key: string]: number } = {};
        const currentYear = getYear(now);
        const yearOrders = orders.filter(o => getYear(new Date(o.orderDate)) === currentYear);
        
        eachMonthOfInterval({ start: startOfMonth(new Date(currentYear, 0, 1)), end: endOfMonth(new Date(currentYear, 11, 31))}).forEach(monthStart => {
            const monthName = format(monthStart, 'MMM');
            monthData[monthName] = 0;
        });
        
        yearOrders.forEach(order => {
            const monthName = format(new Date(order.orderDate), 'MMM');
            if (monthData.hasOwnProperty(monthName)) {
                monthData[monthName]++;
            }
        });
        return Object.entries(monthData).map(([name, orders]) => ({ name, orders }));
    }

    if (timeframe === "Week") {
       const weekData: { [key: string]: number } = {};
       const currentMonthStart = startOfMonth(now);
       const currentMonthEnd = endOfMonth(now);
       const monthOrders = orders.filter(o => new Date(o.orderDate) >= currentMonthStart && new Date(o.orderDate) <= currentMonthEnd);
       
       eachWeekOfInterval({ start: currentMonthStart, end: currentMonthEnd }, { weekStartsOn: 1 }).forEach((weekStart, index) => {
           const weekName = `W${index + 1}`;
           weekData[weekName] = 0;
       });

       monthOrders.forEach(order => {
           const weekNumberInMonth = Math.ceil((new Date(order.orderDate).getDate() + currentMonthStart.getDay()) / 7);
           const weekName = `W${weekNumberInMonth}`;
            if (weekData.hasOwnProperty(weekName)) {
                weekData[weekName]++;
            }
       });
       return Object.entries(weekData).map(([name, orders]) => ({ name, orders }));
    }

    return [];

  }, [orders, timeframe]);


  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <CardTitle>Orders by Date</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant={timeframe === 'Week' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('Week')}>Week</Button>
          <Button variant={timeframe === 'Month' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('Month')}>Month</Button>
          <Button variant={timeframe === 'Year' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('Year')}>Year</Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            orders: {
              label: "Orders",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px] w-full"
        >
          <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 4)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="orders"
              fill="var(--color-orders)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
