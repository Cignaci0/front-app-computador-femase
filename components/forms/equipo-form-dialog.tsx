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
import { Switch } from "@/components/ui/switch"

import { getMarcas } from "@/services/marcaService"
import { getModelos } from "@/services/modeloService"
import { getTiposDeEquipo } from "@/services/tipoDeEquipoService"
import { getClientes } from "@/services/clienteService"
import { getMonitores } from "@/services/monitorService"

interface EquipoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipoToEdit?: any | null
  onSave: (data: any) => void
}

export function EquipoFormDialog({ open, onOpenChange, equipoToEdit, onSave }: EquipoFormDialogProps) {
  const [tipoDeEquipoId, setTipoDeEquipoId] = useState("")
  const [marcaId, setMarcaId] = useState("")
  const [modeloId, setModeloId] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [nombre, setNombre] = useState("")
  const [nSerie, setNSerie] = useState("")
  const [vencimientoGarantia, setVencimientoGarantia] = useState("")
  
  const [hasMonitor, setHasMonitor] = useState(false)
  const [monitorId, setMonitorId] = useState("")

  const [dbBrands, setDbBrands] = useState<{ id: number; nombre: string }[]>([])
  const [dbModels, setDbModels] = useState<{ id: number; name: string; brandId: number }[]>([])
  const [dbTypes, setDbTypes] = useState<{ id: number; nombre: string }[]>([])
  const [dbClientes, setDbClientes] = useState<{ id: number; nombre: string }[]>([])
  const [dbMonitors, setDbMonitors] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      getMarcas(1, 1000).then((res) => setDbBrands(res.data || [])).catch(err => console.error(err))
      getModelos(1, 1000).then((res) => {
        const mapped = (res.data || []).map((m: any) => ({
          id: m.id,
          name: m.nombre,
          brandId: m.marca?.id || Number(m.marca)
        }))
        setDbModels(mapped)
      }).catch(err => console.error(err))
      getTiposDeEquipo(1, 1000).then((res) => setDbTypes(res.data || [])).catch(err => console.error(err))
      getClientes(1, 1000).then((res) => setDbClientes(res.data || [])).catch(err => console.error(err))
      getMonitores(1, 1000).then((res) => setDbMonitors(res.data || [])).catch(err => console.error(err))

      if (equipoToEdit) {
        setTipoDeEquipoId(equipoToEdit.tipo_equipo?.id ? String(equipoToEdit.tipo_equipo.id) : "")
        setMarcaId(equipoToEdit.marca?.id ? String(equipoToEdit.marca.id) : "")
        setModeloId(equipoToEdit.modelo?.id ? String(equipoToEdit.modelo.id) : "")
        setClienteId(equipoToEdit.cliente?.id ? String(equipoToEdit.cliente.id) : "")
        setNombre(equipoToEdit.nombre || "")
        setNSerie(equipoToEdit.n_serie || "")
        
        if (equipoToEdit.fe_exp_garantia) {
          setVencimientoGarantia(equipoToEdit.fe_exp_garantia.substring(0, 10))
        } else {
          setVencimientoGarantia("")
        }

        if (equipoToEdit.monitor?.id) {
          setHasMonitor(true)
          setMonitorId(String(equipoToEdit.monitor.id))
        } else {
          setHasMonitor(false)
          setMonitorId("")
        }
      } else {
        setTipoDeEquipoId("")
        setMarcaId("")
        setModeloId("")
        setClienteId("")
        setNombre("")
        setNSerie("")
        setVencimientoGarantia("")
        setHasMonitor(false)
        setMonitorId("")
      }
    }
  }, [open, equipoToEdit])

  const filteredModels = dbModels.filter(
    (m) => String(m.brandId) === String(marcaId)
  )

  const filteredMonitors = dbMonitors.filter(
    (m) => String(m.marca?.id || m.marca) === String(marcaId)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoDeEquipoId || !marcaId || !modeloId || !vencimientoGarantia || !nombre || !nSerie) return

    onSave({
      cliente: clienteId && clienteId !== "_null" ? Number(clienteId) : null,
      tipo_equipo: Number(tipoDeEquipoId),
      n_serie: nSerie,
      fe_exp_garantia: vencimientoGarantia,
      marca: Number(marcaId),
      modelo: Number(modeloId),
      nombre: nombre,
      monitor: hasMonitor && monitorId && monitorId !== "_null" ? Number(monitorId) : null,
    })
    onOpenChange(false)
  }

  const isFormValid = () => {
    return !!tipoDeEquipoId && !!marcaId && !!modeloId && !!vencimientoGarantia && !!nombre && !!nSerie
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>{equipoToEdit ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
            <DialogDescription>
              {equipoToEdit ? "Modifica los datos del equipo." : "Registra un nuevo equipo (no computador) en el sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eq-name">Nombre del Equipo *</Label>
              <Input
                id="eq-name"
                placeholder="Ej: Impresora Max 550"
                className="bg-secondary/50 border-0"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-nserie">Número de Serie *</Label>
              <Input
                id="eq-nserie"
                placeholder="Ej: 33920fjdk"
                className="bg-secondary/50 border-0"
                value={nSerie}
                onChange={(e) => setNSerie(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-type">Tipo de Equipo *</Label>
              <Select value={tipoDeEquipoId} onValueChange={setTipoDeEquipoId}>
                <SelectTrigger id="eq-type" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {dbTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-warranty">Vencimiento de Garantía *</Label>
              <Input
                id="eq-warranty"
                type="date"
                className="bg-secondary/50 border-0"
                value={vencimientoGarantia}
                onChange={(e) => setVencimientoGarantia(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-brand">Marca *</Label>
              <Select
                value={marcaId}
                onValueChange={(val) => {
                  setMarcaId(val)
                  setModeloId("")
                }}
              >
                <SelectTrigger id="eq-brand" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona marca" />
                </SelectTrigger>
                <SelectContent>
                  {dbBrands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-model">Modelo *</Label>
              <Select value={modeloId} onValueChange={setModeloId} disabled={!marcaId}>
                <SelectTrigger id="eq-model" className="bg-secondary/50 border-0">
                  <SelectValue placeholder={marcaId ? "Selecciona modelo" : "Selecciona marca primero"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="eq-client">Cliente (Opcional)</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger id="eq-client" className="bg-secondary/50 border-0">
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
          </div>

          <div className="flex items-center space-x-3 bg-secondary/20 p-3 rounded-md border border-border mt-2">
            <Switch
              id="eq-has-monitor"
              checked={hasMonitor}
              onCheckedChange={(checked) => {
                setHasMonitor(checked)
                if (!checked) setMonitorId("")
              }}
            />
            <div>
              <Label htmlFor="eq-has-monitor" className="font-semibold cursor-pointer">¿Requiere/Utiliza Monitor?</Label>
              <p className="text-xs text-muted-foreground">Activa esta opción para asociar este equipo a un monitor específico del inventario.</p>
            </div>
          </div>

          {hasMonitor && (
            <div className="space-y-2 bg-secondary/10 p-4 rounded-md border border-border/40 mt-2">
              <Label htmlFor="eq-monitor">Monitor Asociado</Label>
              <Select value={monitorId} onValueChange={setMonitorId} disabled={!marcaId}>
                <SelectTrigger id="eq-monitor" className="bg-secondary/50 border-0">
                  <SelectValue placeholder={marcaId ? "Selecciona monitor" : "Selecciona marca del equipo primero"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_null">Ninguno</SelectItem>
                  {filteredMonitors.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      Monitor {m.marca?.nombre || ""} {m.pulgadas ? `${m.pulgadas}"` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-border/80">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              Guardar Equipo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
