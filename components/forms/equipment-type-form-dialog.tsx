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
import { Textarea } from "@/components/ui/textarea"

interface EquipmentTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  typeToEdit?: { id: number; name: string; description: string } | null
  onSave: (name: string, description: string) => void
}

export function EquipmentTypeFormDialog({ open, onOpenChange, typeToEdit, onSave }: EquipmentTypeFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (open) {
      if (typeToEdit) {
        setName(typeToEdit.name)
        setDescription(typeToEdit.description)
      } else {
        setName("")
        setDescription("")
      }
    }
  }, [typeToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{typeToEdit ? "Editar Tipo de Equipo" : "Nuevo Tipo de Equipo"}</DialogTitle>
            <DialogDescription>
              {typeToEdit ? "Modifica los datos del tipo de equipo." : "Define una nueva categoría de equipos."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type-name">Nombre del Tipo</Label>
              <Input
                id="type-name"
                placeholder="Ej: Desktop, Laptop, Monitor..."
                className="bg-secondary/50 border-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-description">Descripción</Label>
              <Textarea
                id="type-description"
                placeholder="Descripción del tipo de equipo..."
                className="bg-secondary/50 border-0 min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Guardar Tipo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
