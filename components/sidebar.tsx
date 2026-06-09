"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Monitor,
  Users,
  Tags,
  Box,
  Layers,
  Wrench,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Key,
  Tv,
  Truck,
  MonitorPlay,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Computadores",
    href: "/dashboard/computadores",
    icon: Monitor,
  },
  {
    title: "Asignar Equipos",
    href: "/dashboard/asignar-equipos",
    icon: MonitorPlay,
  },
  {
    title: "Equipos",
    href: "/dashboard/equipos",
    icon: Tv,
  },

  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Marcas",
    href: "/dashboard/marcas",
    icon: Tags,
  },
  {
    title: "Modelos",
    href: "/dashboard/modelos",
    icon: Box,
  },
  {
    title: "Tipos de Equipo",
    href: "/dashboard/tipos",
    icon: Layers,
  },
  {
    title: "Componentes",
    href: "/dashboard/componentes",
    icon: Cpu,
  },
  {
    title: "Proveedores",
    href: "/dashboard/proveedores",
    icon: Truck,
  },
  {
    title: "Licencias",
    href: "/dashboard/licencias",
    icon: Key,
  },
  {
    title: "Mantenciones",
    href: "/dashboard/mantenciones",
    icon: Wrench,
  },
  {
    title: "Agenda Mantenciones",
    href: "/dashboard/gestion-mantenciones",
    icon: Wrench,
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground font-bold text-sm shrink-0">
              F
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground truncate">
                FEMASE
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href))

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return linkContent
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Colapsar</span>
              </div>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
