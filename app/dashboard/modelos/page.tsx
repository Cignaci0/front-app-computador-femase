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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelFormDialog } from "@/components/forms/model-form-dialog"
import { toast } from "sonner"
import { getModelos, createModelo, updateModelo, deleteModelo } from "@/services/modeloService"
import { getMarcas } from "@/services/marcaService"

export default function ModelosPage() {
  const [models, setModels] = useState<{ id: number; name: string; brand: string }[]>([])
  const [availableBrands, setAvailableBrands] = useState<{ id: number; name: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [modelToEdit, setModelToEdit] = useState<{ id: number; name: string; brand: string } | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 6 })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch available brands to map brand name input back to ID
  const fetchAvailableBrands = async () => {
    try {
      const response = await getMarcas(1, 1000)
      const mapped = (response.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
      }))
      setAvailableBrands(mapped)
      localStorage.setItem("femase_marcas", JSON.stringify(mapped))
    } catch (error) {
      console.error("Error al cargar marcas en modelos:", error)
      const stored = localStorage.getItem("femase_marcas")
      if (stored) {
        setAvailableBrands(JSON.parse(stored))
      }
    }
  }

  // Fetch models from the database
  const fetchModelsData = async (page: number, limitVal: number) => {
    setIsLoading(true)
    try {
      const response = await getModelos(page, limitVal)
      // Map API response to frontend structure
      const mapped = (response.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
        brand: item.marca ? (item.marca.nombre || item.marca.name) : "Sin marca",
      }))
      setModels(mapped)
      if (response.meta) {
        setMeta(response.meta)
      }

      // Proactively fetch all models to update localStorage for other parts of the app
      const allModelsResponse = await getModelos(1, 1000)
      const allMapped = (allModelsResponse.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
        brand: item.marca ? (item.marca.nombre || item.marca.name) : "Sin marca",
      }))
      localStorage.setItem("femase_modelos", JSON.stringify(allMapped))
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con la API de modelos")
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and state changes
  useEffect(() => {
    fetchModelsData(currentPage, limit)
    fetchAvailableBrands()
  }, [currentPage, limit])

  const handleSaveModel = async (name: string, brandName: string) => {
    // Lookup brand ID dynamically by brand name
    const matchedBrand = availableBrands.find(
      (b) => b.name.toLowerCase() === brandName.toLowerCase()
    )
    const brandId = matchedBrand ? matchedBrand.id : 1

    try {
      if (modelToEdit) {
        // Edit
        await updateModelo(modelToEdit.id, name, brandId)
        toast.success("Modelo actualizado exitosamente")
      } else {
        // Create
        // Sending {"nombre": name, "marca": brandId}
        await createModelo(name, brandId)
        toast.success("Modelo creado exitosamente")
      }
      setModelToEdit(null)
      fetchModelsData(currentPage, limit)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el modelo en el servidor")
    }
  }

  const handleDeleteModel = async (id: number) => {
    const modelToDelete = models.find((m) => m.id === id)
    if (!modelToDelete) return

    if (confirm(`¿Estás seguro de eliminar el modelo "${modelToDelete.name}"?`)) {
      try {
        await deleteModelo(id)
        toast.success("Modelo eliminado exitosamente")
        fetchModelsData(currentPage, limit)
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el modelo del servidor")
      }
    }
  }

  const filteredData = models.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Modelos</h1>
          <p className="text-muted-foreground">
            Gestión de modelos de equipos (conectado a la API)
          </p>
        </div>
        <Button onClick={() => {
          setModelToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Modelo
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar modelo o marca en esta página..."
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
            {isLoading ? "Cargando..." : `${meta.total} modelos registrados`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Nombre del Modelo</TableHead>
                <TableHead className="text-muted-foreground font-medium">Marca Relacionada</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {item.brand}
                    </Badge>
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
                            setModelToEdit(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => handleDeleteModel(item.id)}
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
                    No se encontraron modelos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.page} de {meta.lastPage} ({meta.total} modelos en total)
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

      {/* Model Form Dialog */}
      <ModelFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        modelToEdit={modelToEdit}
        onSave={handleSaveModel}
      />
    </div>
  )
}

