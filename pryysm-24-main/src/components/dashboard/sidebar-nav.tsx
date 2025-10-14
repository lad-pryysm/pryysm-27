
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  ShoppingCart,
  Printer,
  Boxes,
  Users,
  Settings,
  PlusCircle,
  ClipboardList,
  PackageCheck,
  Calculator,
  Landmark,
  Share2,
  ListTree,
  AlertTriangle,
  Zap,
  QrCode,
  Workflow,
  Bot,
  History,
  Tags,
  Droplet,
  Sparkles,
  Layers3,
  Archive,
} from "lucide-react"
import { useWorkspace } from "@/hooks/use-workspace"
import { useMemo } from "react"

const allMenuItems = [
    { id: 'dashboard', href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
    { id: 'ai-chat', href: "/ai-chat", icon: Bot, label: "AI Chat", tooltip: "AI Chat" },
    { id: 'project-tracking', href: "/tracking", icon: Workflow, label: "Project Tracking", tooltip: "Project Tracking" },
    { id: 'customers', href: "/customers", icon: Users, label: "Customers", tooltip: "Customers" },
    { id: 'orders', href: "/orders", icon: ShoppingCart, label: "Orders", tooltip: "Orders" },
    { id: 'label-generation', href: "/labels", icon: Tags, label: "Label Generation", tooltip: "Generate All Labels" },
    { id: 'costing', href: "/costing", icon: Calculator, label: "Costing", tooltip: "Costing" },
    { id: 'finance', href: "/finance", icon: Landmark, label: "Finance", tooltip: "Finance" },
    { id: 'add-remove-printer', href: "/add-remove-printer", icon: PlusCircle, label: "Add/Remove printer", tooltip: "Add/Remove printer" },
    { id: 'job-allotment', href: "/job-allotment", icon: ListTree, label: "Job Allotment", tooltip: "Job Allotment" },
    { id: 'printer-management', href: "/printers", icon: Printer, label: "3D Printer Management", tooltip: "3D Printer Management" },
    { id: 'raw-material', href: "/raw-material", icon: ClipboardList, label: "Raw Material", tooltip: "Raw Material" },
    { id: 'material-log', href: "/material-log", icon: History, label: "Material Log", tooltip: "Material Log" },
    { id: 'inventory', href: "/inventory", icon: Boxes, label: "Spares and Stores", tooltip: "Spares and Stores" },
    { id: 'order-dispatch', href: "/order-dispatch", icon: PackageCheck, label: "Order Dispatch", tooltip: "Order Dispatch" },
];

const settingsItem = { id: 'settings', href: "/settings", icon: Settings, label: "Settings", tooltip: "Settings" };


export function SidebarNav() {
  const pathname = usePathname();
  const { enabledTabs } = useWorkspace();

  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => enabledTabs.includes(item.id));
  }, [enabledTabs]);

  return (
    <>
      <SidebarMenu>
        {menuItems.map((item, index) => (
          <SidebarMenuItem key={`${item.href}-${index}`}>
             <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.tooltip}>
                <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                </Link>
             </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  )
}
