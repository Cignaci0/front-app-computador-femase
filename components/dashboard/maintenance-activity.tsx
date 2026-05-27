import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const activities = [
  {
    id: 1,
    device: "PC-001",
    type: "Mantención Preventiva",
    status: "completed",
    date: "Hace 2 horas",
    technician: "Roberto Díaz",
  },
  {
    id: 2,
    device: "LT-042",
    type: "Cambio de Batería",
    status: "in-progress",
    date: "Hace 4 horas",
    technician: "Patricia Soto",
  },
  {
    id: 3,
    device: "PC-088",
    type: "Actualización de Software",
    status: "pending",
    date: "Programado",
    technician: "Luis Morales",
  },
  {
    id: 4,
    device: "MN-023",
    type: "Revisión Técnica",
    status: "completed",
    date: "Ayer",
    technician: "Roberto Díaz",
  },
  {
    id: 5,
    device: "LT-105",
    type: "Reparación de Pantalla",
    status: "pending",
    date: "Mañana",
    technician: "Patricia Soto",
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-chart-2" />
    case "in-progress":
      return <Clock className="h-4 w-4 text-chart-3" />
    case "pending":
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    default:
      return <Wrench className="h-4 w-4 text-muted-foreground" />
  }
}

export function MaintenanceActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Actividad de Mantenciones
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
            >
              <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <span className="text-xs text-muted-foreground">
                    {activity.date}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.device} • {activity.technician}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
