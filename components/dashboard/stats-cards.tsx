"use client"

import { Monitor, Users, Wrench, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardsProps {
  totalEquipos: number
  totalClientes: number
  totalMantencionesPendientes: number
  totalAlertas: number
}

export function StatsCards({
  totalEquipos = 0,
  totalClientes = 0,
  totalMantencionesPendientes = 0,
  totalAlertas = 0,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Equipos y PCs",
      value: String(totalEquipos),
      change: `+${totalEquipos}`,
      changeLabel: "registrados en total",
      icon: Monitor,
      trend: "up" as const,
    },
    {
      title: "Clientes Activos",
      value: String(totalClientes),
      change: `+${totalClientes}`,
      changeLabel: "sucursales/clientes",
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "Mantenciones Activas",
      value: String(totalMantencionesPendientes),
      change: `${totalMantencionesPendientes}`,
      changeLabel: "pendientes o en progreso",
      icon: Wrench,
      trend: totalMantencionesPendientes > 0 ? ("warning" as const) : ("down" as const),
    },
    {
      title: "Alertas de Mantención",
      value: String(totalAlertas),
      change: `${totalAlertas}`,
      changeLabel: "equipos vencidos (+1 año)",
      icon: AlertTriangle,
      trend: totalAlertas > 0 ? ("warning" as const) : ("down" as const),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/80 border border-border">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              <span
                className={
                  stat.trend === "up"
                    ? "text-emerald-500 font-medium"
                    : stat.trend === "down"
                    ? "text-blue-500 font-medium"
                    : "text-amber-500 font-medium"
                }
              >
                {stat.change}
              </span>
              <span className="text-muted-foreground">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
