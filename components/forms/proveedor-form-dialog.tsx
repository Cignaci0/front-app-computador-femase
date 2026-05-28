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

interface ProveedorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedorToEdit?: { id: number; nombre: string } | null
  onSave: (nombre: string) => void
}

export function ProveedorFormDialog({ open, onOpenChange, proveedorToEdit, onSave }: ProveedorFormDialogProps) {
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    if (open) {
      if (proveedorToEdit) {
        setNombre(proveedorToEdit.nombre)
      } else {
        setNombre("")
      }
    }
  }, [proveedorToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    onSave(nombre.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{proveedorToEdit ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
            <DialogDescription>
              {proveedorToEdit ? "Modifica los datos del proveedor." : "Ingresa los datos del nuevo proveedor de hardware."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prov-name">Nombre del Proveedor</Label>
              <Input
                id="prov-name"
                placeholder="Ej: PC FACTORY, SP Digital..."
                className="bg-secondary/50 border-0"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nombre.trim()}>
              Guardar Proveedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
