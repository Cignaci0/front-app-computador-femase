"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, User, Phone, Mail } from "lucide-react"
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
import { ClientFormDialog } from "@/components/forms/client-form-dialog"
import { toast } from "sonner"
import { getClientes, createCliente, updateCliente, deleteCliente } from "@/services/clienteService"
//hola

interface Client {
  id: number
  name: string
  nombre_contacto?: string | null
  telefono?: string | null
  correo?: string | null
  correo2?: string | null
  telefono2?: string | null
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 6 })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch clients from the database
  const fetchClientsData = async (page: number, limitVal: number) => {
    setIsLoading(true)
    try {
      const response = await getClientes(page, limitVal)
      const mapped = (response.data || []).map((item: any) => ({
        id: item.id,
        name: item.nombre || item.name,
        nombre_contacto: item.nombre_contacto || null,
        telefono: item.telefono || null,
        correo: item.correo || null,
        correo2: item.correo2 || null,
        telefono2: item.telefono2 || null,
      }))
      setClients(mapped)
      if (response.meta) {
        setMeta(response.meta)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con la API de clientes")
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and page/limit changes
  useEffect(() => {
    fetchClientsData(currentPage, limit)
  }, [currentPage, limit])

  const handleSaveClient = async (data: {
    nombre: string
    nombre_contacto: string
    telefono: string
    correo: string
    correo2: string
    telefono2: string
  }) => {
    try {
      if (clientToEdit) {
        // Edit
        await updateCliente(clientToEdit.id, data)
        toast.success("Cliente actualizado exitosamente")
      } else {
        // Create
        await createCliente(data)
        toast.success("Cliente creado exitosamente")
      }
      setClientToEdit(null)
      fetchClientsData(currentPage, limit)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el cliente en el servidor")
    }
  }

  const handleDeleteClient = async (id: number) => {
    const clientToDelete = clients.find((c) => c.id === id)
    if (!clientToDelete) return

    if (confirm(`¿Estás seguro de eliminar el cliente "${clientToDelete.name}"?`)) {
      try {
        await deleteCliente(id)
        toast.success("Cliente eliminado exitosamente")
        fetchClientsData(currentPage, limit)
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el cliente del servidor")
      }
    }
  }

  const filteredData = clients.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Clientes</h1>
          <p className="text-muted-foreground">
            Gestión de clientes y sucursales (conectado a la API)
          </p>
        </div>
        <Button onClick={() => {
          setClientToEdit(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente en esta página..."
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
            {isLoading ? "Cargando..." : `${meta.total} clientes registrados`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Nombre</TableHead>
                <TableHead className="text-muted-foreground font-medium">Contacto</TableHead>
                <TableHead className="text-muted-foreground font-medium">Teléfono</TableHead>
                <TableHead className="text-muted-foreground font-medium">Correo</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-semibold text-foreground/90">{item.name}</TableCell>
                  <TableCell>
                    {item.nombre_contacto ? (
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <User className="h-3.5 w-3.5 text-primary/70" />
                        <span>{item.nombre_contacto}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.telefono ? (
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <Phone className="h-3.5 w-3.5 text-primary/70" />
                        <span>{item.telefono}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.correo ? (
                      <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <Mail className="h-3.5 w-3.5 text-primary/70" />
                        <span className="underline decoration-dotted underline-offset-2 decoration-primary/30">{item.correo}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/60">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-border/80 bg-background/95 backdrop-blur-md">
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => {
                            setClientToEdit(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10"
                          onClick={() => handleDeleteClient(item.id)}
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
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando página {meta.page} de {meta.lastPage} ({meta.total} clientes en total)
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

      {/* Client Form Dialog */}
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clientToEdit={clientToEdit}
        onSave={handleSaveClient}
      />
    </div>
  )
}
