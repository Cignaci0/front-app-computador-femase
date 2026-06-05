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
  const [pulgadas, setPulgadas] = useState("")
  const [estado, setEstado] = useState("EN BODEGA")
  const [isMonitor, setIsMonitor] = useState(false)
  const [nSerie, setNSerie] = useState("")
  const [garantia, setGarantia] = useState("")

  const [dbBrands, setDbBrands] = useState<{ id: number; nombre: string }[]>([])
  const [dbModels, setDbModels] = useState<{ id: number; name: string; brandId: number }[]>([])
  const [dbTypes, setDbTypes] = useState<{ id: number; nombre: string; computador?: boolean }[]>([])

  const STATUSES = ["RECIBIDO", "ENTREGADO"]

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

      if (equipoToEdit) {
        setTipoDeEquipoId(equipoToEdit.tipo_equipo?.id ? String(equipoToEdit.tipo_equipo.id) : "")
        setMarcaId(equipoToEdit.marca?.id ? String(equipoToEdit.marca.id) : "")
        setModeloId(equipoToEdit.modelo?.id ? String(equipoToEdit.modelo.id) : "")
        setNSerie(equipoToEdit.n_serie || "")
        setEstado(equipoToEdit.estado || "EN BODEGA")
        
        if (equipoToEdit.garantia !== undefined && equipoToEdit.garantia !== null) {
          setGarantia(String(equipoToEdit.garantia))
        } else {
          setGarantia("")
        }

        if (equipoToEdit.pulgadas) {
          setIsMonitor(true)
          setPulgadas(equipoToEdit.pulgadas)
        } else {
          setIsMonitor(false)
          setPulgadas("")
        }
      } else {
        setTipoDeEquipoId("")
        setMarcaId("")
        setModeloId("")
        setNSerie("")
        setEstado("RECIBIDO")
        setGarantia("")
        setIsMonitor(false)
        setPulgadas("")
      }
    }
  }, [open, equipoToEdit])

  const filteredModels = dbModels.filter(
    (m) => String(m.brandId) === String(marcaId)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoDeEquipoId || !marcaId || !modeloId || !garantia || !nSerie) return

    onSave({
      tipo_equipo: { id: Number(tipoDeEquipoId) },
      marca: { id: Number(marcaId) },
      modelo: { id: Number(modeloId) },
      n_serie: nSerie,
      pulgadas: isMonitor ? pulgadas : "",
      garantia: Number(garantia),
      estado: estado,
    })
    onOpenChange(false)
  }

  const isFormValid = () => {
    return !!tipoDeEquipoId && !!marcaId && !!modeloId && !!garantia && !!nSerie && (!isMonitor || !!pulgadas)
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
              <Label htmlFor="eq-nserie">Número de Serie *</Label>
              <Input
                id="eq-nserie"
                placeholder="Ej: 33920fjdk"
                className="bg-secondary/50 border-0"
                value={nSerie}
                onChange={(e) => setNSerie(e.target.value)}
              />
            </div>

            {equipoToEdit && (
              <div className="space-y-2">
                <Label htmlFor="eq-status">Estado *</Label>
                <Select value={estado} onValueChange={setEstado} disabled={!equipoToEdit}>
                  <SelectTrigger id="eq-status" className="bg-secondary/50 border-0">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECIBIDO">RECIBIDO</SelectItem>
                    <SelectItem value="ENTREGADO">ENTREGADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="eq-type">Tipo de Equipo *</Label>
              <Select value={tipoDeEquipoId} onValueChange={setTipoDeEquipoId}>
                <SelectTrigger id="eq-type" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {dbTypes.filter(t => !t.computador || String(t.id) === tipoDeEquipoId).map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-warranty">Meses de Garantía *</Label>
              <Select value={garantia} onValueChange={setGarantia}>
                <SelectTrigger id="eq-warranty" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona garantía" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 6, 12, 18].map((mes) => (
                    <SelectItem key={mes} value={String(mes)}>
                      {mes} meses
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          </div>

          <div className="flex items-center space-x-3 bg-secondary/20 p-3 rounded-md border border-border mt-2">
            <Switch
              id="eq-is-monitor"
              checked={isMonitor}
              onCheckedChange={(checked) => {
                setIsMonitor(checked)
                if (!checked) setPulgadas("")
              }}
            />
            <div>
              <Label htmlFor="eq-is-monitor" className="font-semibold cursor-pointer">¿Es un Monitor?</Label>
              <p className="text-xs text-muted-foreground">Activa esta opción si el equipo es un monitor para registrar las pulgadas.</p>
            </div>
          </div>

          {isMonitor && (
            <div className="space-y-2 bg-secondary/10 p-4 rounded-md border border-border/40 mt-2">
              <Label htmlFor="eq-pulgadas">Pulgadas del Monitor *</Label>
              <Input
                id="eq-pulgadas"
                placeholder="Ej: 24, 27, 32..."
                className="bg-secondary/50 border-0 max-w-sm"
                value={pulgadas}
                onChange={(e) => setPulgadas(e.target.value)}
              />
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
