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
  const [fechaEgreso, setFechaEgreso] = useState("")
  const [fechaUltimaMantencion, setFechaUltimaMantencion] = useState("")
  const [fechaUltimoDespacho, setFechaUltimoDespacho] = useState("")
  const [estado, setEstado] = useState("PENDIENTE")

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
        setFechaEgreso(mantencionToEdit.fecha_egreso ? mantencionToEdit.fecha_egreso.substring(0, 10) : "")
        setFechaUltimaMantencion(
          mantencionToEdit.fecha_ultima_mantencion
            ? mantencionToEdit.fecha_ultima_mantencion.substring(0, 10)
            : ""
        )
        setFechaUltimoDespacho(
          mantencionToEdit.fecha_ultimo_despacho
            ? mantencionToEdit.fecha_ultimo_despacho.substring(0, 10)
            : ""
        )
        setEstado(mantencionToEdit.estado || "PENDIENTE")
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
        setFechaEgreso(today)
        setFechaUltimaMantencion(today)
        setFechaUltimoDespacho("")
        setEstado("PENDIENTE")
      }
    }
  }, [open, mantencionToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!encargado || !descripcion || !fechaEgreso || !fechaUltimaMantencion || !estado) return

    const payload = {
      fecha_egreso: fechaEgreso,
      fecha_ultima_mantencion: fechaUltimaMantencion,
      fecha_ultimo_despacho: fechaUltimoDespacho || null,
      encargado,
      descripcion,
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
      !!descripcion &&
      !!fechaEgreso &&
      !!fechaUltimaMantencion &&
      !!estado
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
                <Select value={computadorId} onValueChange={setComputadorId}>
                  <SelectTrigger id="m-computador" className="bg-secondary/50 border-0">
                    <SelectValue placeholder="Selecciona un Computador" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbComputadores.map((comp) => (
                      <SelectItem key={comp.id} value={String(comp.id)}>
                        {comp.nombre_equipo || `ID: ${comp.id}`} {comp.usuario ? `(${comp.usuario})` : ""} - Estado: {comp.estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Equipo Select */}
            {associationType === "equipo" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="m-equipo">Equipo (No Computador) *</Label>
                <Select value={equipoId} onValueChange={setEquipoId}>
                  <SelectTrigger id="m-equipo" className="bg-secondary/50 border-0">
                    <SelectValue placeholder="Selecciona un Equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbEquipos.map((eq) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>
                        {eq.nombre || `ID: ${eq.id}`} {eq.n_serie ? `(S/N: ${eq.n_serie})` : ""}
                      </SelectItem>
                    ))}
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

            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="m-cliente">Cliente (Opcional)</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger id="m-cliente" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_null">Ninguno</SelectItem>
                  {dbClientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha Egreso */}
            <div className="space-y-2">
              <Label htmlFor="m-fecha-egreso">Fecha Egreso *</Label>
              <Input
                id="m-fecha-egreso"
                type="date"
                className="bg-secondary/50 border-0"
                value={fechaEgreso}
                onChange={(e) => setFechaEgreso(e.target.value)}
              />
            </div>

            {/* Fecha Última Mantención */}
            <div className="space-y-2">
              <Label htmlFor="m-fecha-ultima">Fecha Última Mantención *</Label>
              <Input
                id="m-fecha-ultima"
                type="date"
                className="bg-secondary/50 border-0"
                value={fechaUltimaMantencion}
                onChange={(e) => setFechaUltimaMantencion(e.target.value)}
              />
            </div>

            {/* Fecha Último Despacho */}
            <div className="space-y-2">
              <Label htmlFor="m-fecha-despacho">Fecha Último Despacho (Opcional)</Label>
              <Input
                id="m-fecha-despacho"
                type="date"
                className="bg-secondary/50 border-0"
                value={fechaUltimoDespacho}
                onChange={(e) => setFechaUltimoDespacho(e.target.value)}
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="m-estado">Estado *</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger id="m-estado" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                  <SelectItem value="EN PROGRESO">EN PROGRESO</SelectItem>
                  <SelectItem value="LISTO">LISTO</SelectItem>
                  <SelectItem value="REPARACION">REPARACION</SelectItem>
                  <SelectItem value="BODEGA">BODEGA</SelectItem>
                  <SelectItem value="COMPLETADO">COMPLETADO</SelectItem>
                </SelectContent>
              </Select>
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
