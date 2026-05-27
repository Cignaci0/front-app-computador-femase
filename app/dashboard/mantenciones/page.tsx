"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, Eye, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const maintenanceData = [
  {
    id: "MNT-001",
    device: "PC-001",
    type: "Preventiva",
    status: "Completado",
    technician: "Roberto Díaz",
    date: "2024-01-15",
    description: "Limpieza y actualización de software",
  },
  {
    id: "MNT-002",
    device: "LT-042",
    type: "Correctiva",
    status: "En Progreso",
    technician: "Patricia Soto",
    date: "2024-01-18",
    description: "Cambio de batería",
  },
  {
    id: "MNT-003",
    device: "PC-088",
    type: "Preventiva",
    status: "Pendiente",
    technician: "Luis Morales",
    date: "2024-01-20",
    description: "Actualización de sistema operativo",
  },
  {
    id: "MNT-004",
    device: "MN-023",
    type: "Correctiva",
    status: "Completado",
    technician: "Roberto Díaz",
    date: "2024-01-14",
    description: "Calibración de pantalla",
  },
  {
    id: "MNT-005",
    device: "LT-105",
    type: "Correctiva",
    status: "Pendiente",
    technician: "Patricia Soto",
    date: "2024-01-22",
    description: "Reparación de pantalla",
  },
  {
    id: "MNT-006",
    device: "PR-015",
    type: "Preventiva",
    status: "Completado",
    technician: "Luis Morales",
    date: "2024-01-12",
    description: "Limpieza y recarga de tóner",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Completado":
      return (
        <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
          {status}
        </Badge>
      )
    case "En Progreso":
      return (
        <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
          {status}
        </Badge>
      )
    case "Pendiente":
      return (
        <Badge variant="outline" className="bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20">
          {status}
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "Preventiva":
      return (
        <Badge variant="secondary" className="font-normal">
          {type}
        </Badge>
      )
    case "Correctiva":
      return (
        <Badge variant="outline" className="font-normal">
          {type}
        </Badge>
      )
    default:
      return <Badge variant="secondary">{type}</Badge>
  }
}

export default function MantencionesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredData = maintenanceData.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technician.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Mantenciones</h1>
          <p className="text-muted-foreground">
            Gestión de mantenciones programadas y correctivas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Mantención
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, equipo o técnico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-0"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-secondary/50 border-0">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Progreso">En Progreso</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-medium">
            {filteredData.length} mantenciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Equipo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Tipo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Descripción</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Técnico</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Fecha</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="border-border">
                    <TableCell className="font-mono text-sm">{item.id}</TableCell>
                    <TableCell className="font-mono text-sm">{item.device}</TableCell>
                    <TableCell>{getTypeBadge(item.type)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell>{item.technician}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
