"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonitorFormDialog } from "@/components/forms/monitor-form-dialog"
import { toast } from "sonner"
import { getMonitores, createMonitor, updateMonitor, deleteMonitor } from "@/services/monitorService"

export default function MonitoresPage() {
  const [monitors, setMonitors] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [monitorToEdit, setMonitorToEdit] = useState<any | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(8)
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 8 })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch monitors from the database
  const fetchMonitorsData = async (page: number, limitVal: number) => {
    setIsLoading(true)
    try {
      const response = await getMonitores(page, limitVal)
      setMonitors(response.data || [])
      if (response.meta) {
        setMeta(response.meta)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con la API de monitores")
    } finally {
      setIsLoading(false)
    }
  }

  // Load on mount and when page/limit changes
  useEffect(() => {
    fetchMonitorsData(currentPage, limit)
  }, [currentPage, limit])

  const handleSaveMonitor = async (pulgadas: string, marcaId: number) => {
    try {
      if (monitorToEdit) {
        // Edit
        await updateMonitor(monitorToEdit.id, pulgadas, marcaId)
        toast.success("Monitor actualizado exitosamente")
      } else {
        // Create
        await createMonitor(pulgadas, marcaId)
        toast.success("Monitor creado exitosamente")
      }
      setMonitorToEdit(null)
      fetchMonitorsData(currentPage, limit)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el monitor en el servidor")
    }
  }

  const handleDeleteMonitor = async (id: number) => {
    const monitorToDelete = monitors.find((m) => m.id === id)
    if (!monitorToDelete) return

    if (confirm(`¿Estás seguro de eliminar el monitor de "${monitorToDelete.pulgadas}"?`)) {
      try {
        await deleteMonitor(id)
        toast.success("Monitor eliminado exitosamente")
        fetchMonitorsData(currentPage, limit)
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el monitor del servidor")
      }
    }
  }

  const filteredData = monitors.filter((item) => {
    const inchesMatch = item.pulgadas.toLowerCase().includes(searchQuery.toLowerCase())
    const brandMatch = item.marca?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      item.marca?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return inchesMatch || brandMatch
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Monitores</h1>
          <p className="text-muted-foreground">
            Gestión de monitores e inventario de pantallas (conectado a la API)
          </p>
        </div>
        <Button onClick={() => {
          setMonitorToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Monitor
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar monitor por pulgadas o marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary/50 border-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-medium">
            {isLoading ? "Cargando..." : `${meta.total} monitores registrados`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                <TableHead className="text-muted-foreground font-medium">Pulgadas / Tamaño</TableHead>
                <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.pulgadas}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.marca?.nombre || item.marca?.name || "Sin marca"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setMonitorToEdit(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => handleDeleteMonitor(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No se encontraron monitores.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.page} de {meta.lastPage} ({meta.total} monitores en total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={meta.page <= 1 || isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.lastPage))}
                disabled={meta.page >= meta.lastPage || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitor Form Dialog */}
      <MonitorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        monitorToEdit={monitorToEdit}
        onSave={handleSaveMonitor}
      />
    </div>
  )
}
