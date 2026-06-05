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
import { getComputadores } from "@/services/computadorService"
import { getEquipos } from "@/services/equipoService"
import { getClientes } from "@/services/clienteService"

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
  const [clienteId, setClienteId] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaMantencion, setFechaMantencion] = useState("")
  const [fechaUltimaMantencion, setFechaUltimaMantencion] = useState("")

  // API option lists
  const [dbComputadores, setDbComputadores] = useState<any[]>([])
  const [dbEquipos, setDbEquipos] = useState<any[]>([])
  const [dbClientes, setDbClientes] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      // Load option lists
      getComputadores(1, 1000)
        .then((res) => setDbComputadores(res.data || []))
        .catch((err) => console.error("Error loading computers", err))

      getEquipos(1, 1000)
        .then((res) => setDbEquipos(res.data || []))
        .catch((err) => console.error("Error loading equipment", err))

      getClientes(1, 1000)
        .then((res) => setDbClientes(res.data || []))
        .catch((err) => console.error("Error loading clients", err))

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
        setClienteId(
          mantencionToEdit.cliente?.id
            ? String(mantencionToEdit.cliente.id)
            : mantencionToEdit.cliente
            ? String(mantencionToEdit.cliente)
            : ""
        )
        setDescripcion(mantencionToEdit.descripcion || "")
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
        setClienteId("")
        setDescripcion("")
        
        // Default dates to today if creating
        const today = new Date().toISOString().substring(0, 10)
        setFechaMantencion(today)
        setFechaUltimaMantencion("")
      }
    }
  }, [open, mantencionToEdit])

  // Update fechaUltimaMantencion based on selected asset (if creating new)
  useEffect(() => {
    if (!open || mantencionToEdit) return;

    if (associationType === "computador" && computadorId && computadorId !== "_null") {
      const comp = dbComputadores.find((c) => String(c.id) === computadorId);
      setFechaUltimaMantencion(comp?.fecha_ultima_mantencion ? comp.fecha_ultima_mantencion.substring(0, 10) : "");
    } else if (associationType === "equipo" && equipoId && equipoId !== "_null") {
      const eq = dbEquipos.find((e) => String(e.id) === equipoId);
      setFechaUltimaMantencion(eq?.fecha_ultima_mantencion ? eq.fecha_ultima_mantencion.substring(0, 10) : "");
    } else {
      setFechaUltimaMantencion("");
    }
  }, [computadorId, equipoId, associationType, dbComputadores, dbEquipos, mantencionToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!encargado || !descripcion || !fechaMantencion) return

    const payload = {
      fecha_mantencion: fechaMantencion,
      encargado,
      descripcion,
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
              <Select 
                value={clienteId} 
                onValueChange={(val) => {
                  setClienteId(val)
                  setComputadorId("")
                  setEquipoId("")
                }}
              >
                <SelectTrigger id="m-cliente" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona un cliente primero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_null">Sin Asignar (Interno / Bodega)</SelectItem>
                  {dbClientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      .filter(comp => clienteId === "_null" ? !comp.cliente : String(comp.cliente?.id) === clienteId)
                      .map((comp) => (
                      <SelectItem key={comp.id} value={String(comp.id)}>
                        {comp.nombre_equipo || "Sin Nombre"} - BIOS: {comp.n_serie_bios || "N/A"}
                      </SelectItem>
                    ))}
                    {dbComputadores.filter(comp => clienteId === "_null" ? !comp.cliente : String(comp.cliente?.id) === clienteId).length === 0 && (
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
                      .filter(eq => clienteId === "_null" ? !eq.cliente : String(eq.cliente?.id) === clienteId)
                      .map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        {eq.tipo_equipo?.nombre || "Equipo"}
                        {eq.pulgadas ? ` - ${eq.pulgadas}"` : ""}
                        {eq.n_serie ? ` - S/N: ${eq.n_serie}` : " - S/N: N/A"}
                      </SelectItem>
                    ))}
                    {dbEquipos.filter(eq => clienteId === "_null" ? !eq.cliente : String(eq.cliente?.id) === clienteId).length === 0 && (
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
