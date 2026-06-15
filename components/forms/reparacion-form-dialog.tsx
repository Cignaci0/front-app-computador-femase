"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { getClientes, getActivosPorCliente } from "@/services/clienteService"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReparacionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reparacionToEdit?: any | null
  onSave: (data: any) => void
}

export function ReparacionFormDialog({
  open,
  onOpenChange,
  reparacionToEdit,
  onSave,
}: ReparacionFormDialogProps) {
  // Form fields
  const [associationType, setAssociationType] = useState<"computador" | "equipo">("computador")
  const [computadorId, setComputadorId] = useState("")
  const [equipoId, setEquipoId] = useState("")
  const [encargado, setEncargado] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [upgrade, setUpgrade] = useState(false)
  const [mantencion, setMantencion] = useState(false)

  // API option lists
  const [dbComputadores, setDbComputadores] = useState<any[]>([])
  const [dbEquipos, setDbEquipos] = useState<any[]>([])
  const [dbClientes, setDbClientes] = useState<any[]>([])
  const [openCombobox, setOpenCombobox] = useState(false)
  const [searchClient, setSearchClient] = useState("")

  // Fetch clients based on search query
  useEffect(() => {
    if (open) {
      const handler = setTimeout(() => {
        getClientes(1, 10, searchClient)
          .then((res) => setDbClientes(res.data || []))
          .catch((err) => console.error("Error loading clients", err))
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [open, searchClient])

  useEffect(() => {
    if (open) {
      // Pre-populate form if editing
      if (reparacionToEdit) {
        if (reparacionToEdit.computador) {
          setAssociationType("computador")
          setComputadorId(String(reparacionToEdit.computador.id || reparacionToEdit.computador))
          setEquipoId("")
        } else if (reparacionToEdit.equipo) {
          setAssociationType("equipo")
          setEquipoId(String(reparacionToEdit.equipo.id || reparacionToEdit.equipo))
          setComputadorId("")
        } else {
          setAssociationType("computador")
          setComputadorId("")
          setEquipoId("")
        }

        setEncargado(reparacionToEdit.encargado || "")
        setClienteId(
          reparacionToEdit.cliente?.id
            ? String(reparacionToEdit.cliente.id)
            : reparacionToEdit.cliente
            ? String(reparacionToEdit.cliente)
            : ""
        )
        setDescripcion(reparacionToEdit.descripcion || "")
        setUpgrade(reparacionToEdit.upgrade || false)
        setMantencion(reparacionToEdit.mantencion || false)
      } else {
        // Defaults for new record
        setAssociationType("computador")
        setComputadorId("")
        setEquipoId("")
        setEncargado("")
        setClienteId("")
        setDescripcion("")
        setUpgrade(false)
        setMantencion(false)
      }
    } else {
      setAssociationType("computador")
      setComputadorId("")
      setEquipoId("")
      setEncargado("")
      setClienteId("")
      setDescripcion("")
      setDbComputadores([])
      setDbEquipos([])
    }
  }, [open, reparacionToEdit])

  useEffect(() => {
    if (!open) return;
    
    if (clienteId && clienteId !== "_null") {
      getActivosPorCliente(clienteId)
        .then((res) => {
          const items = res.data || [];
          const comps = items.filter((item: any) => item.computador).map((item: any) => ({
            ...item.computador,
            _encargado: item.computador.responsable || item.encargado
          }));
          const eqs = items.filter((item: any) => item.equipo).map((item: any) => ({
            ...item.equipo,
            _encargado: item.encargado
          }));
          setDbComputadores(comps);
          setDbEquipos(eqs);
        })
        .catch((err) => console.error("Error loading assets for client", err));
    } else {
      setDbComputadores([]);
      setDbEquipos([]);
    }
  }, [open, clienteId]);

  useEffect(() => {
    if (!mantencion) {
      setUpgrade(false)
    }
  }, [mantencion])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!encargado || !descripcion) return

    const payload = {
      encargado,
      descripcion,
      upgrade,
      mantencion,
      computador:
        associationType === "computador" && computadorId && computadorId !== "_null"
          ? { id: Number(computadorId) }
          : null,
      equipo:
        associationType === "equipo" && equipoId && equipoId !== "_null"
          ? { id: Number(equipoId) }
          : null,
      cliente: clienteId && clienteId !== "_null" ? { id: Number(clienteId) } : null,
    }

    onSave(payload)
    onOpenChange(false)
  }

  const isFormValid = () => {
    const isAssetSelected =
      (associationType === "computador" && !!computadorId && computadorId !== "_null") ||
      (associationType === "equipo" && !!equipoId && equipoId !== "_null")

    return (
      isAssetSelected &&
      !!encargado &&
      !!descripcion
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>
              {reparacionToEdit ? "Editar Reparación" : "Nueva Reparación"}
            </DialogTitle>
            <DialogDescription>
              {reparacionToEdit
                ? "Modifica los datos del registro de reparación."
                : "Registra una nueva reparación en el sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="r-cliente">Cliente *</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between bg-secondary/50 border-0"
                  >
                    {clienteId && clienteId !== "_null"
                      ? dbClientes.find((c) => String(c.id) === clienteId)?.nombre || "Cliente seleccionado"
                      : "Selecciona un cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Buscar cliente..." 
                      value={searchClient}
                      onValueChange={setSearchClient}
                    />
                    <CommandList>
                      <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                      <CommandGroup>
                        {dbClientes.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={String(c.id)}
                            onSelect={(currentValue) => {
                              setClienteId(currentValue)
                              setComputadorId("")
                              setEquipoId("")
                              setOpenCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                clienteId === String(c.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Association Type Selector */}
            <div className="space-y-2 md:col-span-2">
              <Label>Asociar a *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={associationType === "computador" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setAssociationType("computador")
                    setEquipoId("")
                  }}
                >
                  Computador
                </Button>
                <Button
                  type="button"
                  variant={associationType === "equipo" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setAssociationType("equipo")
                    setComputadorId("")
                  }}
                >
                  Otro Equipo
                </Button>
              </div>
            </div>

            {/* Computador Select */}
            {associationType === "computador" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="r-computador">Computador *</Label>
                <Select value={computadorId} onValueChange={setComputadorId} disabled={!clienteId}>
                  <SelectTrigger id="r-computador" className="bg-secondary/50 border-0">
                    <SelectValue placeholder={clienteId ? "Selecciona un Computador" : "Selecciona un cliente primero"} />
                  </SelectTrigger>
                  <SelectContent>
                    {dbComputadores
                      .filter(comp => String(comp.cliente?.id) === clienteId)
                      .map((comp) => (
                      <SelectItem key={comp.id} value={String(comp.id)}>
                        {comp.nombre_equipo || "Sin Nombre"} - BIOS: {comp.n_serie_bios || "N/A"}
                      </SelectItem>
                    ))}
                    {dbComputadores.filter(comp => String(comp.cliente?.id) === clienteId).length === 0 && (
                      <SelectItem value="empty" disabled>No hay computadores para este cliente</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Equipo Select */}
            {associationType === "equipo" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="r-equipo">Equipo (No Computador) *</Label>
                <Select value={equipoId} onValueChange={setEquipoId} disabled={!clienteId}>
                  <SelectTrigger id="r-equipo" className="bg-secondary/50 border-0">
                    <SelectValue placeholder={clienteId ? "Selecciona un Equipo" : "Selecciona un cliente primero"} />
                  </SelectTrigger>
                  <SelectContent>
                    {dbEquipos
                      .filter(eq => String(eq.cliente?.id) === clienteId)
                      .map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        {eq.tipo_equipo?.nombre || "Equipo"}
                        {eq.pulgadas ? ` - ${eq.pulgadas}"` : ""}
                        {eq.n_serie ? ` - S/N: ${eq.n_serie}` : " - S/N: N/A"}
                      </SelectItem>
                    ))}
                    {dbEquipos.filter(eq => String(eq.cliente?.id) === clienteId).length === 0 && (
                      <SelectItem value="empty" disabled>No hay equipos para este cliente</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Encargado */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="r-encargado">Encargado / Técnico *</Label>
              <Input
                id="r-encargado"
                placeholder="Ej: B.C"
                className="bg-secondary/50 border-0"
                value={encargado}
                onChange={(e) => setEncargado(e.target.value)}
              />
            </div>

            {/* Mantencion Switch */}
            <div className="space-y-2 flex flex-col justify-center rounded-lg border p-3 shadow-sm bg-secondary/20">
              <div className="flex flex-row items-center justify-between mb-1">
                <Label htmlFor="r-mantencion">¿Es Mantención?</Label>
                <Switch
                  id="r-mantencion"
                  checked={mantencion}
                  onCheckedChange={setMantencion}
                />
              </div>
            </div>

            {/* Upgrade Switch */}
            <div className="space-y-2 flex flex-col justify-center rounded-lg border p-3 shadow-sm bg-secondary/20">
              <div className="flex flex-row items-center justify-between mb-1">
                <Label htmlFor="r-upgrade">¿Es Upgrade?</Label>
                <Switch
                  id="r-upgrade"
                  checked={upgrade}
                  onCheckedChange={setUpgrade}
                  disabled={!mantencion}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="r-descripcion">Descripción / Observación *</Label>
              <Textarea
                id="r-descripcion"
                placeholder="Detalle el fallo y la reparación realizada..."
                className="bg-secondary/50 border-0 min-h-[100px]"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/80">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              Guardar Reparación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
