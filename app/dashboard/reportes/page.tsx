"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, Download, FileText, BarChart3, PieChart, TrendingUp, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import { getClientes } from "@/services/clienteService"
import { downloadReport } from "@/services/reportesService"

const reportTypes = [
  {
    id: 1,
    title: "Inventario de Computadores",
    description: "Reporte de todos los computadores (PC y Laptops) registrados y asignados.",
    icon: FileText,
    lastGenerated: "En tiempo real",
    endpoint: "computadores"
  },
  {
    id: 2,
    title: "Inventario de Equipos",
    description: "Distribución de equipos generales (Impresoras, Monitores, etc).",
    icon: PieChart,
    lastGenerated: "En tiempo real",
    endpoint: "equipos"
  },
  {
    id: 3,
    title: "Historial de Mantenciones",
    description: "Registro de todas las mantenciones preventivas y correctivas.",
    icon: BarChart3,
    lastGenerated: "En tiempo real",
    endpoint: "mantenciones"
  },
  {
    id: 4,
    title: "Resumen de Inventario",
    description: "Métricas generales y estadísticas consolidadas del sistema.",
    icon: TrendingUp,
    lastGenerated: "En tiempo real",
    endpoint: "todo"
  },
]

export default function ReportesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [selectedCliente, setSelectedCliente] = useState<string>("all")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getClientes(1, 1000).then(res => setClientes(res.data || [])).catch(console.error)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Reportes</h1>
          <p className="text-muted-foreground font-normal text-sm">
            Generación y descarga de reportes oficiales en formato PDF
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1.5 w-full sm:w-[300px]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtrar por Cliente</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal bg-secondary/50 border-0"
                  >
                    {selectedCliente === "all" 
                      ? "Todos los clientes" 
                      : clientes.find((c) => String(c.id) === selectedCliente)?.nombre || "Todos los clientes"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          key="all"
                          value="all"
                          onSelect={() => {
                            setSelectedCliente("all")
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCliente === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Todos los clientes
                        </CommandItem>
                        {clientes.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.nombre}
                            onSelect={() => {
                              setSelectedCliente(String(c.id))
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCliente === String(c.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="bg-card border-border hover:border-border/80 transition-colors shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary border border-border">
                    <report.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {report.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Frecuencia: {report.lastGenerated}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px] font-normal leading-relaxed">
                {report.description}
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => downloadReport(report.endpoint, selectedCliente)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => downloadReport(report.endpoint, selectedCliente)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  disabled
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Excel (Próximamente)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
