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
import { ProveedorFormDialog } from "@/components/forms/proveedor-form-dialog"
import { toast } from "sonner"
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from "@/services/proveedorService"

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [proveedorToEdit, setProveedorToEdit] = useState<{ id: number; nombre: string } | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 6 })
  const [isLoading, setIsLoading] = useState(false)

  const fetchProveedoresData = async (page: number, limitVal: number) => {
    setIsLoading(true)
    try {
      const response = await getProveedores(page, limitVal)
      setProveedores(response.data || [])
      if (response.meta) {
        setMeta(response.meta)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con la API de proveedores")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProveedoresData(currentPage, limit)
  }, [currentPage, limit])

  const handleSaveProveedor = async (nombre: string) => {
    try {
      if (proveedorToEdit) {
        await updateProveedor(proveedorToEdit.id, nombre)
        toast.success("Proveedor actualizado exitosamente")
      } else {
        await createProveedor(nombre)
        toast.success("Proveedor creado exitosamente")
      }
      setProveedorToEdit(null)
      fetchProveedoresData(currentPage, limit)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el proveedor en el servidor")
    }
  }

  const handleDeleteProveedor = async (id: number) => {
    const proveedorToDelete = proveedores.find((p) => p.id === id)
    if (!proveedorToDelete) return

    if (confirm(`¿Estás seguro de eliminar el proveedor "${proveedorToDelete.nombre}"?`)) {
      try {
        await deleteProveedor(id)
        toast.success("Proveedor eliminado exitosamente")
        fetchProveedoresData(currentPage, limit)
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el proveedor del servidor")
      }
    }
  }

  const filteredData = proveedores.filter((item) =>
    item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Proveedores</h1>
          <p className="text-muted-foreground">
            Gestión de proveedores de hardware y componentes (conectado a la API)
          </p>
        </div>
        <Button onClick={() => {
          setProveedorToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proveedor en esta página..."
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
            {isLoading ? "Cargando..." : `${meta.total} proveedores registrados`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                <TableHead className="text-muted-foreground font-medium">Nombre</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="text-muted-foreground">#{item.id}</TableCell>
                  <TableCell className="font-medium">{item.nombre}</TableCell>
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
                            setProveedorToEdit(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => handleDeleteProveedor(item.id)}
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
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No se encontraron proveedores.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.page} de {meta.lastPage} ({meta.total} proveedores en total)
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

      {/* Proveedor Form Dialog */}
      <ProveedorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        proveedorToEdit={proveedorToEdit}
        onSave={handleSaveProveedor}
      />
    </div>
  )
}
