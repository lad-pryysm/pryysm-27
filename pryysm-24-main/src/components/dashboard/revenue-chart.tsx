
"use client"

import { useMemo } from "react"
import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useWorkspace } from "@/hooks/use-workspace"
import type { PrinterTechnology } from "@/hooks/use-workspace"

const chartConfigBase = {
  revenue: { label: "Revenue" },
  FDM: { label: "FDM", color: "hsl(var(--chart-1))" },
  SLA: { label: "SLA", color: "hsl(var(--chart-2))" },
  SLS: { label: "SLS", color: "hsl(var(--chart-3))" },
  MJF: { label: "MJF", color: "hsl(var(--chart-4))" },
  DLP: { label: "DLP", color: "hsl(var(--chart-5))" },
  EBM: { label: "EBM", color: "hsl(var(--chart-1))" },
  DMLS: { label: "DMLS", color: "hsl(var(--chart-2))" },
  Other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;


export function RevenueChart() {
  const { schedule, printers } = useWorkspace();

  const { chartData, chartConfig } = useMemo(() => {
    if (!schedule || !printers || schedule.length === 0 || printers.length === 0) {
      return { chartData: [], chartConfig: chartConfigBase };
    }
  
    const revenueByTech: { [key in PrinterTechnology]?: number } = {};
  
    schedule.forEach(s => {
      const printer = printers.find(p => p.id === s.printerId);
      if (printer && s.jobs) {
        const tech = printer.technology;
        const jobsValue = s.jobs.reduce((sum, job) => {
          // Placeholder revenue calculation: 50 currency units per hour of job duration
          const jobRevenue = (job.duration || 0) * 50;
          return sum + jobRevenue;
        }, 0);
  
        revenueByTech[tech] = (revenueByTech[tech] || 0) + jobsValue;
      }
    });
  
    const data = Object.entries(revenueByTech).map(([name, revenue]) => ({
      name,
      revenue,
      fill: `var(--color-${name})`,
    }));
  
    // Dynamically build the config based on data present
    const activeTechs = Object.keys(revenueByTech);
    const dynamicConfig: ChartConfig = { revenue: { label: "Revenue" } };
    activeTechs.forEach(tech => {
      if (tech in chartConfigBase) {
        dynamicConfig[tech] = chartConfigBase[tech as keyof typeof chartConfigBase];
      } else {
        dynamicConfig[tech] = { label: tech, color: "hsl(var(--chart-5))" }; // Fallback for unknown techs
      }
    });
  
    return { chartData: data, chartConfig: dynamicConfig };
  
  }, [schedule, printers]);

  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle>Revenue by Technology</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="revenue"
              nameKey="name"
              innerRadius={50}
              strokeWidth={5}
            />
             <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
