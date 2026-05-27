import { Monitor, Users, Wrench, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    title: "Total Equipos",
    value: "1,284",
    change: "+12",
    changeLabel: "este mes",
    icon: Monitor,
    trend: "up" as const,
  },
  {
    title: "Usuarios Asignados",
    value: "856",
    change: "+23",
    changeLabel: "activos",
    icon: Users,
    trend: "up" as const,
  },
  {
    title: "Mantenciones Pendientes",
    value: "47",
    change: "-8",
    changeLabel: "esta semana",
    icon: Wrench,
    trend: "down" as const,
  },
  {
    title: "Alertas Activas",
    value: "12",
    change: "+3",
    changeLabel: "nuevas",
    icon: AlertTriangle,
    trend: "warning" as const,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs">
              <span
                className={
                  stat.trend === "up"
                    ? "text-chart-2"
                    : stat.trend === "down"
                    ? "text-chart-2"
                    : "text-chart-3"
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
