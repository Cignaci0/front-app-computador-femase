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
import { getMarcas } from "@/services/marcaService"

interface MonitorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monitorToEdit?: { id: number; pulgadas: string; marca?: any } | null
  onSave: (pulgadas: string, marcaId: number) => void
}

export function MonitorFormDialog({ open, onOpenChange, monitorToEdit, onSave }: MonitorFormDialogProps) {
  const [pulgadas, setPulgadas] = useState("")
  const [selectedBrandId, setSelectedBrandId] = useState("")
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    if (open) {
      // Fetch brands to populate the select dropdown
      getMarcas(1, 1000)
        .then((res) => {
          const mapped = (res.data || []).map((m: any) => ({
            id: m.id,
            name: m.nombre || m.name,
          }))
          setBrands(mapped)
        })
        .catch((err) => console.error("Error loading brands:", err))

      if (monitorToEdit) {
        setPulgadas(monitorToEdit.pulgadas)
        const brandIdVal = monitorToEdit.marca?.id || monitorToEdit.marca
        setSelectedBrandId(brandIdVal ? String(brandIdVal) : "")
      } else {
        setPulgadas("")
        setSelectedBrandId("")
      }
    }
  }, [monitorToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pulgadas.trim() || !selectedBrandId) return
    onSave(pulgadas.trim(), Number(selectedBrandId))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{monitorToEdit ? "Editar Monitor" : "Nuevo Monitor"}</DialogTitle>
            <DialogDescription>
              {monitorToEdit ? "Modifica los datos del monitor." : "Ingresa los datos del nuevo monitor."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="monitor-pulgadas">Pulgadas / Tamaño</Label>
              <Input
                id="monitor-pulgadas"
                placeholder="Ej: 24 pulgadas, 32 pulgadas..."
                className="bg-secondary/50 border-0"
                value={pulgadas}
                onChange={(e) => setPulgadas(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-select">Marca</Label>
              <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                <SelectTrigger id="brand-select" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.name}
                    </SelectItem>
                  ))}
                  {brands.length === 0 && (
                    <SelectItem value="_empty" disabled>
                      No hay marcas creadas
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!pulgadas.trim() || !selectedBrandId}>
              Guardar Monitor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
