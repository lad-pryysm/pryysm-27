
"use client"

import React, { useState, useEffect } from "react"
import { DashboardHeader } from "./header"
import { StatCards } from "./stat-cards"
import { OrdersChart } from "./orders-chart"
import { RevenueChart } from "./revenue-chart"
import { InventoryStatus } from "./inventory-status"
import { RecentOrders } from "./recent-orders"
import { format } from "date-fns"

export type Currency = "USD" | "EUR" | "AED" | "INR"
export type RevenueTimeframe = "month" | "year";


export function DashboardClient() {
  const [currency, setCurrency] = useState<Currency>("USD")
  const [revenueTimeframe, setRevenueTimeframe] = useState<RevenueTimeframe>("year");
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    // Set date on client-side only to prevent hydration mismatch
    setCurrentDate(format(new Date(), 'dd-MM-yyyy'))
  }, [])

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 gap-6 md:gap-8">
      <DashboardHeader
        currency={currency}
        setCurrency={setCurrency}
        revenueTimeframe={revenueTimeframe}
        setRevenueTimeframe={setRevenueTimeframe}
        currentDate={currentDate}
      />
        <StatCards currency={currency} revenueTimeframe={revenueTimeframe} />
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrdersChart />
          </div>
          <div className="lg:col-span-1">
            <RevenueChart />
          </div>
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <InventoryStatus />
          <RecentOrders currency={currency} />
        </div>
    </div>
  )
}
