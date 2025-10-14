
"use client"

import React, { useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  DollarSign,
  Printer,
  Layers,
} from "lucide-react"
import type { Currency, RevenueTimeframe } from "./dashboard-client"
import { useWorkspace } from "@/hooks/use-workspace"
import { isThisMonth, isThisYear, isSameMonth, isSameYear, subMonths, subYears } from "date-fns"

const exchangeRates = {
  USD: 1,
  EUR: 0.93,
  AED: 3.67,
  INR: 83.12,
}

const currencySymbols = {
  USD: "$",
  EUR: "€",
  AED: "AED",
  INR: "₹",
}

const formatCurrency = (amount: number, currency: Currency) => {
  const symbol = currencySymbols[currency]
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${symbol}${formatted}`
}

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

export function StatCards({ currency, revenueTimeframe }: { currency: Currency, revenueTimeframe: RevenueTimeframe }) {
  const { orders, printers, documents } = useWorkspace()

  const { 
    totalOrders, 
    totalRevenue, 
    ordersChange, 
    revenueChange,
    activePrinters, 
    totalPrinters 
  } = useMemo(() => {
    const now = new Date();
    
    // --- Current Period Calculation ---
    const isCurrentPeriodOrder = (orderDate: Date) => revenueTimeframe === 'month' ? isThisMonth(orderDate) : isThisYear(orderDate);
    const isCurrentPeriodInvoice = (invoiceDate: Date) => revenueTimeframe === 'month' ? isThisMonth(invoiceDate) : isThisYear(invoiceDate);
    
    const currentOrders = orders.filter(order => isCurrentPeriodOrder(new Date(order.orderDate)));
    const currentInvoices = documents.filter(doc => doc.type === 'Tax Invoice' && isCurrentPeriodInvoice(new Date(doc.date)));
    
    const totalOrders = currentOrders.length;
    const totalRevenue = currentInvoices.reduce((sum, doc) => sum + doc.amount, 0);

    // --- Previous Period Calculation ---
    const previousPeriodDate = revenueTimeframe === 'month' ? subMonths(now, 1) : subYears(now, 1);
    const isPreviousPeriodOrder = (orderDate: Date) => revenueTimeframe === 'month' ? isSameMonth(orderDate, previousPeriodDate) : isSameYear(orderDate, previousPeriodDate);
    const isPreviousPeriodInvoice = (invoiceDate: Date) => revenueTimeframe === 'month' ? isSameMonth(invoiceDate, previousPeriodDate) : isSameYear(invoiceDate, previousPeriodDate);

    const previousOrders = orders.filter(order => isPreviousPeriodOrder(new Date(order.orderDate)));
    const previousInvoices = documents.filter(doc => doc.type === 'Tax Invoice' && isPreviousPeriodInvoice(new Date(doc.date)));

    const previousTotalOrders = previousOrders.length;
    const previousTotalRevenue = previousInvoices.reduce((sum, doc) => sum + doc.amount, 0);

    // --- Change Calculation ---
    const ordersChange = calculatePercentageChange(totalOrders, previousTotalOrders);
    const revenueChange = calculatePercentageChange(totalRevenue, previousTotalRevenue);

    return {
        totalOrders,
        totalRevenue,
        ordersChange,
        revenueChange,
        activePrinters: printers.filter(p => p.status === 'printing' || p.status === 'running').length,
        totalPrinters: printers.length,
    }
  }, [orders, printers, documents, revenueTimeframe]);


  const revenueValue = useMemo(() => {
    const revenueConverted = totalRevenue * exchangeRates[currency]
    return formatCurrency(revenueConverted, currency)
  }, [currency, totalRevenue]);

  const renderChange = (change: number) => {
    const isPositive = change >= 0;
    const isInfinite = !isFinite(change);

    let text;
    if (isInfinite && isPositive) {
      text = "+∞% from last period";
    } else if (isInfinite && !isPositive) {
      text = "-100% from last period"; // From something to zero
    } else {
      text = `${isPositive ? '+' : ''}${change.toFixed(1)}% from last period`;
    }

    return (
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        {isPositive ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500" />
        )}
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>{text}</span>
      </p>
    );
  };

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      changeElement: renderChange(ordersChange),
      icon: ShoppingCart,
      colorClass: "text-chart-1",
      bgClass: "bg-chart-1/15",
    },
    {
      title: `Revenue (${revenueTimeframe === 'month' ? 'This Month' : 'This Year'})`,
      value: revenueValue,
      changeElement: renderChange(revenueChange),
      icon: DollarSign,
      colorClass: "text-chart-2",
      bgClass: "bg-chart-2/15",
    },
    {
      title: "Active Printers",
      value: `${activePrinters}/${totalPrinters}`,
      changeElement: <p className="text-xs text-muted-foreground mt-1">{totalPrinters - activePrinters} printers available</p>,
      icon: Printer,
      colorClass: "text-chart-4",
      bgClass: "bg-chart-4/15",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className="transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${stat.bgClass}`}>
              <stat.icon className={`h-5 w-5 ${stat.colorClass}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            {stat.changeElement}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
