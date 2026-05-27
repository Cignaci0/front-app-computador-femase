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
import { BrandFormDialog } from "@/components/forms/brand-form-dialog"
import { toast } from "sonner"
import { getMarcas, createMarca, updateMarca, deleteMarca } from "@/services/marcaService"

const defaultModels = [
  { id: 1, name: "OptiPlex 7090", brand: "Dell" },
  { id: 2, name: "ThinkPad T14", brand: "Lenovo" },
  { id: 3, name: "ProDesk 400", brand: "HP" },
  { id: 4, name: "Latitude 5520", brand: "Dell" },
  { id: 5, name: "27UK850", brand: "LG" },
  { id: 6, name: "EliteDesk 800", brand: "HP" },
  { id: 7, name: "ThinkPad X1 Carbon", brand: "Lenovo" },
  { id: 8, name: "LaserJet Pro M404n", brand: "HP" },
  { id: 9, name: "Precision 3640", brand: "Dell" },
  { id: 10, name: "MacBook Pro 14", brand: "Apple" },
]

export default function MarcasPage() {
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])
  const [models, setModels] = useState<{ id: number; name: string; brand: string }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [brandToEdit, setBrandToEdit] = useState<{ id: number; name: string } | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 6 })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch brands from the database
  const fetchBrandsData = async (page: number, limitVal: number) => {
    setIsLoading(true)
    try {
      const response = await getMarcas(page, limitVal)
      // Map "nombre" from database to "name" for frontend UI compatibility
      const mapped = (response.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
      }))
      setBrands(mapped)
      if (response.meta) {
        setMeta(response.meta)
      }

      // Proactively fetch all brands to update localStorage for other parts of the app
      const allBrandsResponse = await getMarcas(1, 1000)
      const allMapped = (allBrandsResponse.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
      }))
      localStorage.setItem("femase_marcas", JSON.stringify(allMapped))
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con la API de marcas")
    } finally {
      setIsLoading(false)
    }
  }

  // Load on mount and when page/limit changes
  useEffect(() => {
    fetchBrandsData(currentPage, limit)

    const storedModels = localStorage.getItem("femase_modelos")
    if (storedModels) {
      setModels(JSON.parse(storedModels))
    } else {
      setModels(defaultModels)
      localStorage.setItem("femase_modelos", JSON.stringify(defaultModels))
    }
  }, [currentPage, limit])

  const handleSaveBrand = async (name: string) => {
    try {
      if (brandToEdit) {
        // Edit
        await updateMarca(brandToEdit.id, name)
        toast.success("Marca actualizada exitosamente")
      } else {
        // Create
        // Sending {"nombre": name, "marca": 1} as requested:
        await createMarca(name, 1)
        toast.success("Marca creada exitosamente")
      }
      setBrandToEdit(null)
      fetchBrandsData(currentPage, limit)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar la marca en el servidor")
    }
  }

  const handleDeleteBrand = async (id: number) => {
    const brandToDelete = brands.find((b) => b.id === id)
    if (!brandToDelete) return

    if (confirm(`¿Estás seguro de eliminar la marca "${brandToDelete.name}"?`)) {
      try {
        await deleteMarca(id)
        toast.success("Marca eliminada exitosamente")
        fetchBrandsData(currentPage, limit)
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar la marca del servidor")
      }
    }
  }

  const getModelCount = (brandName: string) => {
    return models.filter((m) => m.brand.toLowerCase() === brandName.toLowerCase()).length
  }

  const filteredData = brands.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Marcas</h1>
          <p className="text-muted-foreground">
            Gestión de marcas de equipos (conectado a la API)
          </p>
        </div>
        <Button onClick={() => {
          setBrandToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Marca
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marca en esta página..."
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
            {isLoading ? "Cargando..." : `${meta.total} marcas registradas`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Nombre</TableHead>
                <TableHead className="text-muted-foreground font-medium">Total Modelos</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{getModelCount(item.name)} modelos</TableCell>
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
                            setBrandToEdit(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => handleDeleteBrand(item.id)}
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
                    No se encontraron marcas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.page} de {meta.lastPage} ({meta.total} marcas en total)
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

      {/* Brand Form Dialog */}
      <BrandFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brandToEdit={brandToEdit}
        onSave={handleSaveBrand}
      />
    </div>
  )
}

