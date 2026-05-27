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

interface BrandFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandToEdit?: { id: number; name: string } | null
  onSave: (name: string) => void
}

export function BrandFormDialog({ open, onOpenChange, brandToEdit, onSave }: BrandFormDialogProps) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (open) {
      if (brandToEdit) {
        setName(brandToEdit.name)
      } else {
        setName("")
      }
    }
  }, [brandToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{brandToEdit ? "Editar Marca" : "Nueva Marca"}</DialogTitle>
            <DialogDescription>
              {brandToEdit ? "Modifica los datos de la marca." : "Ingresa los datos de la nueva marca de equipos."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Nombre de la Marca</Label>
              <Input
                id="brand-name"
                placeholder="Ej: Dell, HP, Lenovo..."
                className="bg-secondary/50 border-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Guardar Marca
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
