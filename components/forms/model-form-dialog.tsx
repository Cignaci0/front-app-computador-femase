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
import { AsyncCombobox } from "@/components/ui/async-combobox"
import { useCallback } from "react"
import { getMarcas } from "@/services/marcaService"

interface ModelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelToEdit?: { id: number; name: string; brand: string; brandId?: number } | null
  onSave: (name: string, brandId: string) => void
}

export function ModelFormDialog({ open, onOpenChange, modelToEdit, onSave }: ModelFormDialogProps) {
  const [name, setName] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])

  const fetchMarcas = useCallback((s: string) => getMarcas(1, 10, s).then(r => r.data || []), [])

  useEffect(() => {
    if (open) {
      if (modelToEdit) {
        setName(modelToEdit.name)
        // Ensure we load the brand correctly for the select
        setSelectedBrand(modelToEdit.brandId ? String(modelToEdit.brandId) : "")
      } else {
        setName("")
        setSelectedBrand("")
      }
    }
  }, [modelToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !selectedBrand) return
    onSave(name.trim(), selectedBrand)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{modelToEdit ? "Editar Modelo" : "Nuevo Modelo"}</DialogTitle>
            <DialogDescription>
              {modelToEdit ? "Modifica los datos del modelo." : "Ingresa los datos del nuevo modelo de equipo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">Nombre del Modelo</Label>
              <Input
                id="model-name"
                placeholder="Ej: ThinkPad T14, OptiPlex 7090..."
                className="bg-secondary/50 border-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-select">Marca</Label>
              <AsyncCombobox 
                value={selectedBrand} 
                onValueChange={setSelectedBrand} 
                fetcher={fetchMarcas} 
                placeholder="Selecciona una marca" 
                preloadItems={modelToEdit && modelToEdit.brandId ? [{ id: modelToEdit.brandId, nombre: modelToEdit.brand }] : []}
                labelKey="nombre"
                valueKey="id"
                renderValue={(item) => item.nombre}
                renderItem={(item) => item.nombre}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || !selectedBrand}>
              Guardar Modelo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
