
"use client"

import type { Currency, RevenueTimeframe } from "./dashboard-client"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  currency: Currency
  setCurrency: (currency: Currency) => void
  revenueTimeframe: RevenueTimeframe
  setRevenueTimeframe: (timeframe: RevenueTimeframe) => void
  currentDate: string
}

export function DashboardHeader({
  currency,
  setCurrency,
  revenueTimeframe,
  setRevenueTimeframe,
  currentDate,
}: DashboardHeaderProps) {
  const currencies: Currency[] = ["USD", "EUR", "AED", "INR"]
 
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
       <div className="flex items-center gap-2">
        <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
          Dashboard
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Today: {currentDate}
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-card border rounded-full p-1 shadow-sm">
                 <Button
                    variant={revenueTimeframe === 'month' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setRevenueTimeframe('month')}
                    className="rounded-full px-4"
                    >
                    This Month
                </Button>
                <Button
                    variant={revenueTimeframe === 'year' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setRevenueTimeframe('year')}
                    className="rounded-full px-4"
                    >
                    This Year
                </Button>
            </div>
            <div className="flex items-center bg-card border rounded-full p-1 shadow-sm">
            {currencies.map((c) => (
                <Button
                key={c}
                variant={currency === c ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrency(c)}
                className="rounded-full px-4"
                >
                {c}
                </Button>
            ))}
            </div>
        </div>
      </div>
    </header>
  )
}
