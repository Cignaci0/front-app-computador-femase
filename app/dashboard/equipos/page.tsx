"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Printer } from "lucide-react"
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
import { toast } from "sonner"
import {
  getEquipos,
  createEquipo,
  updateEquipo,
  deleteEquipo,
} from "@/services/equipoService"
import { EquipoFormDialog } from "@/components/forms/equipo-form-dialog"

export default function EquiposPage() {
  const [data, setData] = useState<any[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 10 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [searchDebounced, setSearchDebounced] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [equipoToEdit, setEquipoToEdit] = useState<any | null>(null)

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
      const response = await getEquipos(p, 10)
      if (response && response.data) {
        let items = response.data
        if (s) {
          items = items.filter((item: any) => 
            (item.nombre || "").toLowerCase().includes(s.toLowerCase()) ||
            (item.n_serie || "").toLowerCase().includes(s.toLowerCase())
          )
        }
        setData(items)
        setMeta(response.meta || { total: items.length, page: p, lastPage: 1, limit: 10 })
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al obtener equipos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(page, searchDebounced)
  }, [page, searchDebounced])

  const handleSave = async (formData: any) => {
    try {
      if (equipoToEdit) {
        await updateEquipo(equipoToEdit.id, formData)
        toast.success("Equipo actualizado exitosamente")
      } else {
        await createEquipo(formData)
        toast.success("Equipo creado exitosamente")
      }
      fetchData(page, searchDebounced)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el equipo")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return

    try {
      await deleteEquipo(id)
      toast.success("Equipo eliminado exitosamente")
      fetchData(page, searchDebounced)
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el equipo")
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
          <h1 className="text-2xl font-semibold tracking-tight text-balance flex items-center gap-2">
            Equipos
          </h1>
          <p className="text-muted-foreground">
            Gestión del inventario de equipos generales (impresoras, periféricos, etc.)
          </p>
        </div>
        <Button onClick={() => {
          setEquipoToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o serie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-0"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-medium">Nombre</TableHead>
              <TableHead className="font-medium">N° Serie</TableHead>
              <TableHead className="font-medium">Marca / Modelo</TableHead>
              <TableHead className="font-medium">Tipo</TableHead>
              <TableHead className="font-medium">Cliente</TableHead>
              <TableHead className="font-medium w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-secondary/10">
                <TableCell className="font-semibold">{item.nombre}</TableCell>
                <TableCell className="font-mono text-xs">{item.n_serie}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.marca?.nombre || "N/A"}</span>
                    <span className="text-xs text-muted-foreground">{item.modelo?.nombre || "N/A"}</span>
                  </div>
                </TableCell>
                <TableCell>{item.tipo_equipo?.nombre || "N/A"}</TableCell>
                <TableCell>{item.cliente?.nombre || "Sin Asignar"}</TableCell>
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
                          setEquipoToEdit(item)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron equipos generales registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
      </div>

      <EquipoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipoToEdit={equipoToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
