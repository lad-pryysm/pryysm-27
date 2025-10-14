
"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Layers } from "lucide-react"
import { ProtectedRoute } from "../auth/protected-route"
import { AppHeader } from "./app-header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="md:grid md:grid-cols-[auto_1fr] h-dvh w-full">
          <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center gap-2 p-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-foreground">
                    <Layers />
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                  <h1 className="text-xl font-semibold leading-none">
                      <span className="text-sidebar-primary">Pryysm</span> <span className="text-sm font-normal text-sidebar-foreground">by 3D Prodigy</span>
                  </h1>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col">
              <SidebarNav />
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
