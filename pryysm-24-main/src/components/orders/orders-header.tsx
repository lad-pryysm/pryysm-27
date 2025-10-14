
"use client"

import { Button } from "@/components/ui/button"
import { Box, Plus } from "lucide-react"

interface OrdersHeaderProps {
    onNewOrderClick: () => void;
}

export function OrdersHeader({ onNewOrderClick }: OrdersHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2 rounded-lg">
            <Box className="text-primary h-6 w-6" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-foreground">Order Management</h1>
            <p className="text-sm text-muted-foreground">Track and manage your orders</p>
        </div>
      </div>
    </header>
  )
}
