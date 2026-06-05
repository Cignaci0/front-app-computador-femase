"use client"

import { useState, useEffect } from "react"
import {
  HardDrive,
  Zap,
  Cpu,
  Layers,
  Wind,
  Video,
  Wifi,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ListFilter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import {
  getComponentes,
  createComponente,
  updateComponente,
  deleteComponente
} from "@/services/componentesService"
import { getMarcas } from "@/services/marcaService"
import { ComponentFormDialog } from "@/components/forms/component-form-dialog"

const COMPONENT_TYPES = [
  { id: "disco-almacenamiento", label: "Discos de Almacenamiento", icon: HardDrive, limit: 3 },
  { id: "fuente-poder", label: "Fuentes de Poder", icon: Zap, limit: 6 },
  { id: "memoria-ram", label: "Memorias RAM", icon: Layers, limit: 6 },
  { id: "placa-madre", label: "Placas Madre", icon: Layers, limit: 6 },
  { id: "procesador", label: "Procesadores", icon: Cpu, limit: 6 },
  { id: "tarjeta-grafica", label: "Tarjetas Gráficas", icon: Video, limit: 6 }
]

export default function ComponentesPage() {
  const [activeTab, setActiveTab] = useState("disco-almacenamiento")
  const [components, setComponents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [componentToEdit, setComponentToEdit] = useState<any | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 10 })
  const [isLoading, setIsLoading] = useState(false)
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])

  // Fetch all brands for dropdown mapping
  const fetchBrands = async () => {
    try {
      const response = await getMarcas(1, 1000)
      const mapped = (response.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
      }))
      setBrands(mapped)
      localStorage.setItem("femase_marcas", JSON.stringify(mapped))
    } catch (error) {
      console.error("Error al cargar marcas:", error)
    }
  }

  // Fetch components based on active tab and page
  const fetchComponentsData = async (type: string, page: number) => {
    setIsLoading(true)
    const activeConfig = COMPONENT_TYPES.find(c => c.id === type)
    const limitVal = activeConfig ? activeConfig.limit : 10
    
    try {
      const response = await getComponentes(type, page, limitVal)
      setComponents(response.data || [])
      if (response.meta) {
        setMeta(response.meta)
      } else {
        // Fallback meta if API lacks meta block
        setMeta({
          total: response.data?.length || 0,
          page: page,
          lastPage: 1,
          limit: limitVal
        })
      }
    } catch (error) {
      console.error(error)
      toast.error(`Error al conectar con la API de ${type}`)
      setComponents([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load brands on mount
  useEffect(() => {
    fetchBrands()
  }, [])

  // Load components when activeTab or page changes
  useEffect(() => {
    setSearchQuery("")
    fetchComponentsData(activeTab, currentPage)
  }, [activeTab, currentPage])

  // Reset page to 1 when changing tab
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(1)
  }

  const handleSaveComponent = async (data: any) => {
    try {
      if (componentToEdit) {
        // Edit
        await updateComponente(activeTab, componentToEdit.id, data)
        toast.success("Componente actualizado exitosamente")
      } else {
        // Create
        await createComponente(activeTab, data)
        toast.success("Componente registrado exitosamente")
      }
      setComponentToEdit(null)
      fetchComponentsData(activeTab, currentPage)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el componente")
    }
  }

  const handleDeleteComponent = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este componente de hardware?")) {
      try {
        await deleteComponente(activeTab, id)
        toast.success("Componente eliminado exitosamente")
        fetchComponentsData(activeTab, currentPage)
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el componente")
      }
    }
  }

  const getBrandName = (idMarca: any) => {
    if (!idMarca) return "Sin Marca"
    if (typeof idMarca === "object") {
      return idMarca.nombre || idMarca.name || "Sin Marca"
    }
    const found = brands.find(b => b.id === Number(idMarca))
    return found ? found.name : `Marca #${idMarca}`
  }

  // Client-side search filtering within the current fetched page list
  const filteredData = components.filter((item) => {
    const brandName = getBrandName(item.id_marca).toLowerCase()
    const modelo = (item.modelo || "").toLowerCase()
    const search = searchQuery.toLowerCase()
    
    // Check fields based on active tab
    const specFields = [
      item.tipo_disco,
      item.capacidad,
      item.tamaño_capacidad,
      item.numero_serie,
      item.potencia,
      item.certificacion,
      item.tipo_tecnologia,
      item.formato,
      item.socket,
      item.chipset,
      item.familia,
      item.frecuencia,
      item.ensamblador,
      item.vram
    ].filter(Boolean).map(val => String(val).toLowerCase())

    return (
      modelo.includes(search) ||
      brandName.includes(search) ||
      specFields.some(field => field.includes(search))
    )
  })

  const renderTableHeaders = () => {
    switch (activeTab) {
      case "disco-almacenamiento":
        return (
          <>
            <TableHead className="text-muted-foreground font-medium">Modelo</TableHead>
            <TableHead className="text-muted-foreground font-medium">Tipo</TableHead>
            <TableHead className="text-muted-foreground font-medium">Capacidad</TableHead>
            <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
          </>
        )
      case "fuente-poder":
        return (
          <>
            <TableHead className="text-muted-foreground font-medium">Modelo</TableHead>
            <TableHead className="text-muted-foreground font-medium">Potencia</TableHead>
            <TableHead className="text-muted-foreground font-medium">Certificación</TableHead>
            <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
          </>
        )
      case "memoria-ram":
        return (
          <>
            <TableHead className="text-muted-foreground font-medium">Nº Interno</TableHead>
            <TableHead className="text-muted-foreground font-medium">Tecnología</TableHead>
            <TableHead className="text-muted-foreground font-medium">Formato</TableHead>
            <TableHead className="text-muted-foreground font-medium">Capacidad</TableHead>
            <TableHead className="text-muted-foreground font-medium">Frecuencia</TableHead>
            <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
          </>
        )
      case "placa-madre":
        return (
          <>
            <TableHead className="text-muted-foreground font-medium">Modelo</TableHead>
            <TableHead className="text-muted-foreground font-medium">Socket</TableHead>
            <TableHead className="text-muted-foreground font-medium">Chipset</TableHead>
            <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
          </>
        )
      case "procesador":
        return (
          <>
            <TableHead className="text-muted-foreground font-medium">Modelo</TableHead>
            <TableHead className="text-muted-foreground font-medium">Familia</TableHead>
            <TableHead className="text-muted-foreground font-medium">Frecuencia</TableHead>
            <TableHead className="text-muted-foreground font-medium">Núcleos / Hilos</TableHead>
            <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
          </>
        )
      case "tarjeta-grafica":
        return (
          <>
            <TableHead className="text-muted-foreground font-medium">Modelo</TableHead>
            <TableHead className="text-muted-foreground font-medium">VRAM</TableHead>
            <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
          </>
        )
      default:
        return null
    }
  }

  const renderTableRows = () => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "N/A"
      return new Date(dateStr).toLocaleDateString("es-CL", { timeZone: "UTC" })
    }

    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
            Cargando componentes...
          </TableCell>
        </TableRow>
      )
    }

    if (filteredData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
            No se encontraron componentes de este tipo.
          </TableCell>
        </TableRow>
      )
    }

    return filteredData.map((item) => {
      const actions = (
        <TableCell className="w-[50px]">
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
                  setComponentToEdit(item)
                  setDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => handleDeleteComponent(item.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )

      const commonCells = (
        <>
          <TableCell>{item.proveedor?.nombre || "N/A"}</TableCell>
          <TableCell className="font-medium">
            {item.factura !== undefined && item.factura !== null ? `$${item.factura.toLocaleString("es-CL")}` : "N/A"}
          </TableCell>
          <TableCell>{formatDate(item.fecha_compra)}</TableCell>
          <TableCell className="font-semibold">{item.uso}</TableCell>
          <TableCell>
            <Badge className={item.activa ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"}>
              {item.activa ? "Activo" : "Inactivo"}
            </Badge>
          </TableCell>
        </>
      )

      switch (activeTab) {
        case "disco-almacenamiento":
          return (
            <TableRow key={item.id} className="border-border">
              <TableCell className="font-semibold">{item.modelo}</TableCell>
              <TableCell>{item.tipo_disco}</TableCell>
              <TableCell>{item.capacidad}</TableCell>
              <TableCell>{getBrandName(item.id_marca)}</TableCell>
              {commonCells}
              {actions}
            </TableRow>
          )
        case "fuente-poder":
          return (
            <TableRow key={item.id} className="border-border">
              <TableCell className="font-semibold">{item.modelo}</TableCell>
              <TableCell>{item.potencia}</TableCell>
              <TableCell>{item.certificacion}</TableCell>
              <TableCell>{getBrandName(item.id_marca)}</TableCell>
              {commonCells}
              {actions}
            </TableRow>
          )
        case "memoria-ram":
          return (
            <TableRow key={item.id} className="border-border">
              <TableCell className="font-mono text-sm font-bold">{item.n_interno || "N/A"}</TableCell>
              <TableCell className="font-semibold">{item.tipo_tecnologia}</TableCell>
              <TableCell>{item.formato}</TableCell>
              <TableCell>{item.capacidad || item.tamaño_capacidad || "N/A"}</TableCell>
              <TableCell>{item.frecuencia || item.velocidad}</TableCell>
              <TableCell>{getBrandName(item.id_marca)}</TableCell>
              {commonCells}
              {actions}
            </TableRow>
          )
        case "placa-madre":
          return (
            <TableRow key={item.id} className="border-border">
              <TableCell className="font-semibold">{item.modelo}</TableCell>
              <TableCell>{item.socket}</TableCell>
              <TableCell>{item.chipset}</TableCell>
              <TableCell>{getBrandName(item.id_marca)}</TableCell>
              {commonCells}
              {actions}
            </TableRow>
          )
        case "procesador":
          return (
            <TableRow key={item.id} className="border-border">
              <TableCell className="font-semibold">{item.modelo}</TableCell>
              <TableCell>{item.familia}</TableCell>
              <TableCell>{item.frecuencia}</TableCell>
              <TableCell>{item.nucleos} / {item.hilos}</TableCell>
              <TableCell>{item.marca || "N/A"}</TableCell>
              {commonCells}
              {actions}
            </TableRow>
          )
        case "tarjeta-grafica":
          return (
            <TableRow key={item.id} className="border-border">
              <TableCell className="font-semibold">{item.modelo}</TableCell>
              <TableCell>{item.vram}</TableCell>
              <TableCell>{getBrandName(item.id_marca)}</TableCell>
              {commonCells}
              {actions}
            </TableRow>
          )
        default:
          return null
      }
    })
  }

  const activeTitle = COMPONENT_TYPES.find((c) => c.id === activeTab)?.label || "Componentes"

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Componentes de Hardware</h1>
          <p className="text-muted-foreground">
            Mantenimiento y catálogo de piezas de hardware para el armado de computadores
          </p>
        </div>
        <Button onClick={() => {
          setComponentToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Componente
        </Button>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Component Tabs Sidebar */}
        <Card className="lg:col-span-1 bg-card border-border h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              Categorías
            </CardTitle>
            <CardDescription>
              Selecciona una categoría de hardware
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {COMPONENT_TYPES.map((type) => {
              const Icon = type.icon
              const isActive = activeTab === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => handleTabChange(type.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{type.label}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Component List Table */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar en ${activeTitle.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50 border-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-semibold">
                {activeTitle} ({meta.total} en total)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      {renderTableHeaders()}
                      <TableHead className="text-muted-foreground font-medium">Proveedor</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Factura</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Fecha Compra</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Stock</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableRows()}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {meta.page} de {meta.lastPage || 1}
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
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.lastPage || 1))}
                    disabled={meta.page >= (meta.lastPage || 1) || isLoading}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Component Form Dialog */}
      <ComponentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={activeTab}
        componentToEdit={componentToEdit}
        onSave={handleSaveComponent}
      />
    </div>
  )
}
