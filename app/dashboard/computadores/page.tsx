"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
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
import { EquipmentFormDialog } from "@/components/forms/equipment-form-dialog"
import { EquipmentInspectDialog } from "@/components/dialogs/equipment-inspect-dialog"
import { getComputadores, createComputador, updateComputador, deleteComputador } from "@/services/computadorService"
import { getTiposDeEquipo } from "@/services/tipoDeEquipoService"
import { toast } from "sonner"

function getStatusBadge(status: string) {
  const normStatus = (status || "").toUpperCase()
  switch (normStatus) {
    case "ACTIVO":
      return (
        <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
          Activo
        </Badge>
      )
    case "MANTENIMIENTO":
    case "MANTENCIÓN":
      return (
        <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
          Mantención
        </Badge>
      )
    case "BODEGA":
      return (
        <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
          Bodega
        </Badge>
      )
    case "BAJA":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          Baja
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function EquiposPage() {
  const [computers, setComputers] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [equipmentToEdit, setEquipmentToEdit] = useState<any | null>(null)
  const [inspectDialogOpen, setInspectDialogOpen] = useState(false)
  const [equipmentToInspect, setEquipmentToInspect] = useState<any | null>(null)
  
  // Custom types list for filtering
  const [dbTypes, setDbTypes] = useState<any[]>([])

  const limit = 6

  // Fetch list of types for filter dropdown
  useEffect(() => {
    getTiposDeEquipo(1, 100).then((res) => {
      setDbTypes(res.data || [])
    }).catch((err) => console.error(err))
  }, [])

  // Fetch computers paginated
  const fetchComputers = async (page = 1) => {
    setLoading(true)
    try {
      const res = await getComputadores(page, limit)
      setComputers(res.data || [])
      setTotalItems(res.meta?.total || 0)
      setTotalPages(res.meta?.lastPage || 1)
      setCurrentPage(res.meta?.page || page)
    } catch (error) {
      toast.error("Error al cargar computadores de la API")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComputers(currentPage)
  }, [currentPage])

  const handleSaveEquipment = async (data: any) => {
    try {
      if (equipmentToEdit) {
        // Edit
        await updateComputador(equipmentToEdit.id, data)
        toast.success("Equipo actualizado exitosamente")
      } else {
        // Create
        await createComputador(data)
        toast.success("Equipo registrado exitosamente")
      }
      fetchComputers(currentPage)
      setDialogOpen(false)
      setEquipmentToEdit(null)
    } catch (error) {
      toast.error(equipmentToEdit ? "Error al actualizar equipo" : "Error al registrar equipo")
      console.error(error)
    }
  }

  const handleDeleteEquipment = async (id: number) => {
    if (confirm(`¿Estás seguro de eliminar el equipo con ID "${id}"?`)) {
      try {
        await deleteComputador(id)
        toast.success("Equipo eliminado exitosamente")
        fetchComputers(currentPage)
      } catch (error) {
        toast.error("Error al eliminar equipo")
        console.error(error)
      }
    }
  }

  // Filter computers on the client side from fetched list
  const filteredData = computers.filter((item) => {
    const matchesSearch =
      String(item.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.n_serie_bios || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.marca?.nombre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.modelo?.nombre || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.procesador?.familia || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.procesador?.modelo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      [item.memoria_ram_1, item.memoria_ram_2, item.memoria_ram_3, item.memoria_ram_4].some(
        (r) => r && (r.modelo || "").toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      [item.disco_alma_1, item.disco_alma_2, item.disco_alma_3].some(
        (d) => d && (d.modelo || "").toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesStatus =
      statusFilter === "all" ||
      (item.estado || "").toUpperCase() === statusFilter.toUpperCase()

    const matchesType =
      typeFilter === "all" ||
      String(item.tipo_de_equipo?.id || item.tipo_de_equipo) === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("es-CL", { timeZone: "UTC" })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Computadores</h1>
          <p className="text-muted-foreground">
            Gestión del inventario de computadores
          </p>
        </div>
        <Button onClick={() => {
          setEquipmentToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, marca, modelo, procesador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-0"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-secondary/50 border-0">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="MANTENIMIENTO">Mantención</SelectItem>
                  <SelectItem value="BODEGA">Bodega</SelectItem>
                  <SelectItem value="BAJA">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Tipo de Equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  {dbTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-medium">
            {filteredData.length} equipos en esta página
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Nº Serie BIOS</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Tipo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Modelo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Cliente</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Procesador</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Memoria RAM</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Almacenamiento</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Garantía</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                      Cargando equipos...
                    </TableCell>
                  </TableRow>
                ) : filteredData.map((item) => (
                  <TableRow key={item.id} className="border-border">
                    <TableCell className="font-mono text-sm font-bold">{item.n_serie_bios || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {item.tipo_de_equipo?.nombre || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.marca?.nombre || "N/A"}</TableCell>
                    <TableCell>{item.modelo?.nombre || "N/A"}</TableCell>
                    <TableCell>{item.cliente?.nombre || "N/A"}</TableCell>
                    <TableCell className="text-sm">
                      {item.procesador
                        ? `${item.procesador.familia} ${item.procesador.modelo}${
                            item.procesador.frecuencia ? ` (${item.procesador.frecuencia})` : ""
                          }`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(() => {
                        const rams = [item.memoria_ram_1, item.memoria_ram_2, item.memoria_ram_3, item.memoria_ram_4]
                          .filter(Boolean);
                        if (rams.length === 0) return "N/A";
                        return rams.map(r => {
                          const freqPart = r.frecuencia ? ` - ${r.frecuencia}` : "";
                          const ramLabel = `${r.tipo_tecnologia || ""} ${r.formato || ""}`.trim() || "RAM";
                          return `${ramLabel} (${r.capacidad}${freqPart})`;
                        }).join(" + ");
                      })()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(() => {
                        const disks = [item.disco_alma_1, item.disco_alma_2, item.disco_alma_3]
                          .filter(Boolean);
                        if (disks.length === 0) return "N/A";
                        return disks.map(d => `${d.modelo || d.tipo_disco} (${d.capacidad})`).join(" + ");
                      })()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(item.vencimiento_garantia)}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.estado)}</TableCell>
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
                              setEquipmentToInspect(item)
                              setInspectDialogOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Inspeccionar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setEquipmentToEdit(item)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => handleDeleteEquipment(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                      No se encontraron computadores.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({totalItems} equipos en total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Form Dialog */}
      <EquipmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipmentToEdit={equipmentToEdit}
        onSave={handleSaveEquipment}
      />

      {/* Equipment Inspect Dialog */}
      <EquipmentInspectDialog
        open={inspectDialogOpen}
        onOpenChange={setInspectDialogOpen}
        equipment={equipmentToInspect}
      />
    </div>
  )
}
