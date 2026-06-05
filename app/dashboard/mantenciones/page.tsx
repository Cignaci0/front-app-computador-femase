"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, Calendar, Monitor, Laptop } from "lucide-react"
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
import { toast } from "sonner"
import {
  getMantenciones,
  createMantencion,
  updateMantencion,
  deleteMantencion,
} from "@/services/mantencionService"
import { MantencionFormDialog } from "@/components/forms/mantencion-form-dialog"



export default function MantencionesPage() {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 10 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchDebounced, setSearchDebounced] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mantencionToEdit, setMantencionToEdit] = useState<any | null>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  const fetchData = async (p: number, s: string) => {
    setIsLoading(true)
    try {
      // Fetch list from service (page-wise)
      const response = await getMantenciones(p, 10)
      if (response && response.data) {
        let items = response.data

        // Perform local search filtering
        if (s) {
          items = items.filter((item: any) => {
            const devName = item.computador?.nombre_equipo || item.equipo?.nombre || ""
            const devUser = item.computador?.usuario || ""
            const clientName = item.cliente?.nombre || ""
            const description = item.descripcion || ""
            const technician = item.encargado || ""

            return (
              devName.toLowerCase().includes(s.toLowerCase()) ||
              devUser.toLowerCase().includes(s.toLowerCase()) ||
              clientName.toLowerCase().includes(s.toLowerCase()) ||
              description.toLowerCase().includes(s.toLowerCase()) ||
              technician.toLowerCase().includes(s.toLowerCase())
            )
          })
        }



        setData(items)
        setMeta(
          response.meta
            ? { ...response.meta, total: items.length }
            : { total: items.length, page: p, lastPage: 1, limit: 10 }
        )
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al obtener mantenciones")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(page, searchDebounced)
  }, [page, searchDebounced])

  const handleSave = async (formData: any) => {
    try {
      if (mantencionToEdit) {
        await updateMantencion(mantencionToEdit.id, formData)
        toast.success("Mantención actualizada exitosamente")
      } else {
        await createMantencion(formData)
        toast.success("Mantención creada exitosamente")
      }
      fetchData(page, searchDebounced)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar la mantención")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este registro de mantención?")) return

    try {
      await deleteMantencion(id)
      toast.success("Mantención eliminada exitosamente")
      fetchData(page, searchDebounced)
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar la mantención")
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("es-CL", { timeZone: "UTC" })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Mantenciones</h1>
          <p className="text-muted-foreground">
            Gestión de mantenciones programadas y correctivas de computadores y equipos
          </p>
        </div>
        <Button onClick={() => {
          setMantencionToEdit(null)
          setDialogOpen(true)
        }}>
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
                placeholder="Buscar por equipo, cliente, encargado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-0"
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-medium">
            {isLoading ? "Cargando..." : `${data.length} mantenciones encontradas`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Asociado a</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Cliente</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Encargado</TableHead>
                  <TableHead className="text-muted-foreground font-medium max-w-[250px]">Descripción</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Fecha Mantención</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Última Mantención</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => {
                  const isComp = !!item.computador;
                  const assetName = isComp 
                    ? item.computador.nombre_equipo || `PC ID: ${item.computador.id}` 
                    : item.equipo?.nombre || `Equipo ID: ${item.equipo?.id || "N/A"}`;
                  
                  return (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/10">
                      <TableCell className="font-mono text-sm font-semibold">#{item.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isComp ? (
                            <Laptop className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Monitor className="h-4 w-4 text-emerald-400" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{assetName}</span>
                            {isComp && item.computador.usuario && (
                              <span className="text-xs text-muted-foreground">
                                User: {item.computador.usuario}
                              </span>
                            )}
                            {!isComp && item.equipo?.n_serie && (
                              <span className="text-xs font-mono text-muted-foreground">
                                S/N: {item.equipo.n_serie}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {item.cliente?.nombre || "Sin Asignar"}
                      </TableCell>
                      <TableCell>{item.encargado || "N/A"}</TableCell>
                      <TableCell className="max-w-[250px] truncate text-muted-foreground text-sm" title={item.descripcion}>
                        {item.descripcion}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(item.fecha_mantencion)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(item.fecha_ultima_mantencion)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-border">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                setMantencionToEdit(item)
                                setDialogOpen(true)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron registros de mantención.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.page} de {meta.lastPage} ({meta.total} registros en total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={meta.page <= 1 || isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, meta.lastPage))}
                disabled={meta.page >= meta.lastPage || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <MantencionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mantencionToEdit={mantencionToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
