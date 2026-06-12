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
import { getComputadores } from "@/services/computadorService"
import { getEquipos } from "@/services/equipoService"
import { getClientes, getActivosPorCliente } from "@/services/clienteService"
import { getEncargadosPorComputador } from "@/services/mantencionService"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MantencionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mantencionToEdit?: any | null
  onSave: (data: any) => void
}

export function MantencionFormDialog({
  open,
  onOpenChange,
  mantencionToEdit,
  onSave,
}: MantencionFormDialogProps) {
  // Form fields
  const [associationType, setAssociationType] = useState<"computador" | "equipo">("computador")
  const [computadorId, setComputadorId] = useState("")
  const [equipoId, setEquipoId] = useState("")
  const [encargado, setEncargado] = useState("")
  const [responsable, setResponsable] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [upgrade, setUpgrade] = useState(false)
  const [estado, setEstado] = useState("LISTO")
  const [fechaMantencion, setFechaMantencion] = useState("")
  const [fechaUltimaMantencion, setFechaUltimaMantencion] = useState("")

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
      if (mantencionToEdit) {
        if (mantencionToEdit.computador) {
          setAssociationType("computador")
          setComputadorId(String(mantencionToEdit.computador.id || mantencionToEdit.computador))
          setEquipoId("")
        } else if (mantencionToEdit.equipo) {
          setAssociationType("equipo")
          setEquipoId(String(mantencionToEdit.equipo.id || mantencionToEdit.equipo))
          setComputadorId("")
        } else {
          setAssociationType("computador")
          setComputadorId("")
          setEquipoId("")
        }

        setEncargado(mantencionToEdit.encargado || "")
        setResponsable(mantencionToEdit.responsable || "")
        setClienteId(
          mantencionToEdit.cliente?.id
            ? String(mantencionToEdit.cliente.id)
            : mantencionToEdit.cliente
            ? String(mantencionToEdit.cliente)
            : ""
        )
        setDescripcion(mantencionToEdit.descripcion || "")
        setUpgrade(mantencionToEdit.upgrade || false)
        setEstado(mantencionToEdit.estado || "LISTO")
        setFechaMantencion(mantencionToEdit.fecha_mantencion ? mantencionToEdit.fecha_mantencion.substring(0, 10) : "")
        setFechaUltimaMantencion(
          mantencionToEdit.fecha_ultima_mantencion
            ? mantencionToEdit.fecha_ultima_mantencion.substring(0, 10)
            : ""
        )
      } else {
        // Defaults for new record
        setAssociationType("computador")
        setComputadorId("")
        setEquipoId("")
        setEncargado("")
        setResponsable("")
        setClienteId("")
        setDescripcion("")
        setUpgrade(false)
        setEstado("LISTO")
        
        // Default dates to today if creating
        const today = new Date().toISOString().substring(0, 10)
        setFechaMantencion(today)
        setFechaUltimaMantencion("")
      }
    } else {
      setAssociationType("computador")
      setComputadorId("")
      setEquipoId("")
      setEncargado("")
      setResponsable("")
      setClienteId("")
      setDescripcion("")
      setFechaUltimaMantencion("")
      setDbComputadores([])
      setDbEquipos([])
    }
  }, [open, mantencionToEdit])

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

  // Update fechaUltimaMantencion and responsable based on selected asset (if creating new)
  useEffect(() => {
    if (!open || mantencionToEdit) return;

    if (associationType === "computador" && computadorId && computadorId !== "_null") {
      const comp = dbComputadores.find((c) => String(c.id) === computadorId);
      setFechaUltimaMantencion(comp?.fecha_ultima_mantencion ? comp.fecha_ultima_mantencion.substring(0, 10) : "");
      if (comp?.responsable) setResponsable(comp.responsable);
      else if (comp?._encargado) setResponsable(comp._encargado);
    } else if (associationType === "equipo" && equipoId && equipoId !== "_null") {
      const eq = dbEquipos.find((e) => String(e.id) === equipoId);
      setFechaUltimaMantencion(eq?.fecha_ultima_mantencion ? eq.fecha_ultima_mantencion.substring(0, 10) : "");
      if (eq?._encargado) setResponsable(eq._encargado);
    } else {
      setFechaUltimaMantencion("");
      setResponsable("");
    }
  }, [computadorId, equipoId, associationType, dbComputadores, dbEquipos, mantencionToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!encargado || !descripcion || !fechaMantencion) return

    const payload = {
      fecha_mantencion: fechaMantencion,
      encargado,
      responsable,
      descripcion,
      upgrade,
      estado,
      computador:
        associationType === "computador" && computadorId && computadorId !== "_null"
          ? Number(computadorId)
          : null,
      equipo:
        associationType === "equipo" && equipoId && equipoId !== "_null"
          ? Number(equipoId)
          : null,
      cliente: clienteId && clienteId !== "_null" ? Number(clienteId) : null,
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
      !!responsable &&
      !!descripcion &&
      !!fechaMantencion
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>
              {mantencionToEdit ? "Editar Mantención" : "Nueva Mantención"}
            </DialogTitle>
            <DialogDescription>
              {mantencionToEdit
                ? "Modifica los datos del registro de mantención."
                : "Registra una nueva mantención en el sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="m-cliente">Cliente *</Label>
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
                <Label htmlFor="m-computador">Computador *</Label>
                <Select value={computadorId} onValueChange={setComputadorId} disabled={!clienteId}>
                  <SelectTrigger id="m-computador" className="bg-secondary/50 border-0">
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
                <Label htmlFor="m-equipo">Equipo (No Computador) *</Label>
                <Select value={equipoId} onValueChange={setEquipoId} disabled={!clienteId}>
                  <SelectTrigger id="m-equipo" className="bg-secondary/50 border-0">
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
            <div className="space-y-2">
              <Label htmlFor="m-encargado">Encargado / Técnico *</Label>
              <Input
                id="m-encargado"
                placeholder="Ej: B.C"
                className="bg-secondary/50 border-0"
                value={encargado}
                onChange={(e) => setEncargado(e.target.value)}
              />
            </div>

            {/* Fecha Mantención */}
            <div className="space-y-2">
              <Label htmlFor="m-fecha-mantencion">Fecha Mantención *</Label>
              <Input
                id="m-fecha-mantencion"
                type="date"
                className="bg-secondary/50 border-0"
                value={fechaMantencion}
                onChange={(e) => setFechaMantencion(e.target.value)}
              />
            </div>

            {/* Fecha Última Mantención */}
            <div className="space-y-2">
              <Label htmlFor="m-fecha-ultima">Fecha Última Mantención</Label>
              <Input
                id="m-fecha-ultima"
                type="date"
                className="bg-secondary/50 border-0 text-muted-foreground"
                value={fechaUltimaMantencion}
                disabled
              />
            </div>

            {/* Responsable */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="m-responsable">Responsable *</Label>
              <Input
                id="m-responsable"
                placeholder="Nombre del responsable del equipo"
                className="bg-secondary/50 border-0"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
              />
            </div>

            {/* Estado (Solo visible al editar) */}
            {mantencionToEdit && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="m-estado">Estado *</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id="m-estado" className="bg-secondary/50 border-0">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LISTO">LISTO</SelectItem>
                    <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            
            {/* Upgrade Switch */}
            <div className="space-y-2 md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/20">
              <div className="space-y-0.5">
                <Label htmlFor="m-upgrade">¿Es un Upgrade?</Label>
                <div className="text-[13px] text-muted-foreground">
                  Marcar si esta mantención incluye un upgrade de hardware.
                </div>
              </div>
              <Switch
                id="m-upgrade"
                checked={upgrade}
                onCheckedChange={setUpgrade}
              />
            </div>

            {/* Descripción */}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="m-descripcion">Descripción / Observación *</Label>
              <Textarea
                id="m-descripcion"
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
              Guardar Mantención
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
