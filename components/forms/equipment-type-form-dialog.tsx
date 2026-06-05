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
import { Switch } from "@/components/ui/switch"

interface EquipmentTypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  typeToEdit?: { id: number; name: string; description: string; computador?: boolean } | null
  onSave: (name: string, description: string, computador: boolean) => void
}

export function EquipmentTypeFormDialog({ open, onOpenChange, typeToEdit, onSave }: EquipmentTypeFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [computador, setComputador] = useState(false)

  useEffect(() => {
    if (open) {
      if (typeToEdit) {
        setName(typeToEdit.name)
        setDescription(typeToEdit.description)
        setComputador(typeToEdit.computador ?? false)
      } else {
        setName("")
        setDescription("")
        setComputador(false)
      }
    }
  }, [typeToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim(), computador)
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
            <div className="flex flex-row items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-4">
              <div className="space-y-0.5">
                <Label className="text-base">¿Es un Computador?</Label>
                <DialogDescription>
                  Activa esto para que aparezca en el formulario de computadores.
                </DialogDescription>
              </div>
              <Switch
                checked={computador}
                onCheckedChange={setComputador}
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
