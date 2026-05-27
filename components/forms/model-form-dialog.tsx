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

interface ModelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelToEdit?: { id: number; name: string; brand: string } | null
  onSave: (name: string, brand: string) => void
}

export function ModelFormDialog({ open, onOpenChange, modelToEdit, onSave }: ModelFormDialogProps) {
  const [name, setName] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    if (open) {
      const storedBrands = localStorage.getItem("femase_marcas")
      if (storedBrands) {
        setBrands(JSON.parse(storedBrands))
      }

      if (modelToEdit) {
        setName(modelToEdit.name)
        setSelectedBrand(modelToEdit.brand)
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
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand-select" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
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
            <Button type="submit" disabled={!name.trim() || !selectedBrand}>
              Guardar Modelo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
