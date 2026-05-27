"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, FileText, BarChart3, PieChart, TrendingUp } from "lucide-react"

const reportTypes = [
  {
    id: 1,
    title: "Inventario General",
    description: "Reporte completo de todos los equipos registrados",
    icon: FileText,
    lastGenerated: "Hace 2 días",
  },
  {
    id: 2,
    title: "Equipos por Estado",
    description: "Distribución de equipos según su estado actual",
    icon: PieChart,
    lastGenerated: "Hace 1 semana",
  },
  {
    id: 3,
    title: "Historial de Mantenciones",
    description: "Registro de todas las mantenciones realizadas",
    icon: BarChart3,
    lastGenerated: "Hace 3 días",
  },
  {
    id: 4,
    title: "Análisis de Tendencias",
    description: "Evolución del inventario en el tiempo",
    icon: TrendingUp,
    lastGenerated: "Hace 5 días",
  },
]

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Reportes</h1>
          <p className="text-muted-foreground">
            Generación y descarga de reportes del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px] bg-secondary/50 border-0">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px] bg-secondary/50 border-0">
                <SelectValue placeholder="Tipo de equipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="printer">Impresora</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                    <report.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium">
                      {report.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Último: {report.lastGenerated}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {report.description}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
