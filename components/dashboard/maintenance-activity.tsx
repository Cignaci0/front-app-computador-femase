"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface MaintenanceActivityProps {
  activities?: any[]
}

function getStatusIcon(status: string) {
  const norm = (status || "").toUpperCase()
  switch (norm) {
    case "COMPLETADO":
    case "LISTO":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "EN PROGRESO":
      return <Clock className="h-4 w-4 text-amber-500" />
    case "PENDIENTE":
      return <AlertCircle className="h-4 w-4 text-slate-400" />
    default:
      return <Wrench className="h-4 w-4 text-blue-400" />
  }
}

export function MaintenanceActivity({ activities = [] }: MaintenanceActivityProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("es-CL", { timeZone: "UTC" })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Actividad de Mantenciones
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {activities.map((activity) => {
            const isComp = !!activity.computador
            const deviceName = isComp
              ? activity.computador.nombre_equipo || `PC ID: ${activity.computador.id}`
              : activity.equipo?.nombre || `Equipo ID: ${activity.equipo?.id || "N/A"}`

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors border border-border/40"
              >
                <div className="mt-0.5">{getStatusIcon(activity.estado)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate max-w-[200px]" title={activity.descripcion}>
                      {activity.descripcion || "Revisión Técnica"}
                    </p>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDate(activity.fecha_ultima_mantencion || activity.fecha_egreso)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{deviceName}</span> • Encargado: {activity.encargado || "N/A"}
                  </p>
                </div>
              </div>
            )
          })}
          {activities.length === 0 && (
            <p className="text-center py-8 text-sm text-muted-foreground">
              No hay actividades de mantención registradas.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
