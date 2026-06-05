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
import { Badge } from "@/components/ui/badge"
import { EquipmentTypeFormDialog } from "@/components/forms/equipment-type-form-dialog"
import { toast } from "sonner"
import { getTiposDeEquipo, createTipoDeEquipo, updateTipoDeEquipo, deleteTipoDeEquipo } from "@/services/tipoDeEquipoService"

export default function TiposPage() {
  const [types, setTypes] = useState<{ id: number; name: string; description: string; computador?: boolean }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [typeToEdit, setTypeToEdit] = useState<{ id: number; name: string; description: string; computador?: boolean } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 6 })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch types from the database
  const fetchTypesData = async (page: number, limitVal: number) => {
    setIsLoading(true)
    try {
      const response = await getTiposDeEquipo(page, limitVal)
      // Map API response to frontend structure
      const mapped = (response.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
        description: item.descripcion || item.description || "",
        computador: item.computador,
      }))
      setTypes(mapped)
      if (response.meta) {
        setMeta(response.meta)
      }

      // Proactively fetch all types to update localStorage for other parts of the app
      const allTypesResponse = await getTiposDeEquipo(1, 1000)
      const allMapped = (allTypesResponse.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
        description: item.descripcion || item.description || "",
        computador: item.computador,
      }))
      localStorage.setItem("femase_tipos", JSON.stringify(allMapped))
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con la API de tipos de equipo")
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and page/limit changes
  useEffect(() => {
    fetchTypesData(currentPage, limit)
  }, [currentPage, limit])

  const handleSaveType = async (name: string, description: string, computador: boolean) => {
    try {
      if (typeToEdit) {
        // Edit
        await updateTipoDeEquipo(typeToEdit.id, name, description, computador)
        toast.success("Tipo de equipo actualizado exitosamente")
      } else {
        // Create
        await createTipoDeEquipo(name, description, computador)
        toast.success("Tipo de equipo creado exitosamente")
      }
      setTypeToEdit(null)
      fetchTypesData(currentPage, limit)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el tipo de equipo en el servidor")
    }
  }

  const handleDeleteType = async (id: number) => {
    const typeToDelete = types.find((t) => t.id === id)
    if (!typeToDelete) return

    if (confirm(`¿Estás seguro de eliminar el tipo de equipo "${typeToDelete.name}"?`)) {
      try {
        await deleteTipoDeEquipo(id)
        toast.success("Tipo de equipo eliminado exitosamente")
        fetchTypesData(currentPage, limit)
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el tipo de equipo del servidor")
      }
    }
  }

  const filteredData = types.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Tipos de Equipo</h1>
          <p className="text-muted-foreground">
            Gestión de categorías de equipos (conectado a la API)
          </p>
        </div>
        <Button onClick={() => {
          setTypeToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tipo de equipo en esta página..."
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
            {isLoading ? "Cargando..." : `${meta.total} tipos de equipo`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Tipo</TableHead>
                <TableHead className="text-muted-foreground font-medium">Descripción</TableHead>
                <TableHead className="text-muted-foreground font-medium">¿Es PC?</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell>
                    {item.computador ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Sí</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
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
                            setTypeToEdit(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => handleDeleteType(item.id)}
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
                    No se encontraron tipos de equipo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.page} de {meta.lastPage} ({meta.total} tipos en total)
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

      {/* Equipment Type Form Dialog */}
      <EquipmentTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        typeToEdit={typeToEdit}
        onSave={handleSaveType}
      />
    </div>
  )
}

