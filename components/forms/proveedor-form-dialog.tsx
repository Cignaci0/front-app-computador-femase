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
  proveedorToEdit?: { id: number; nombre: string; contacto?: string; telefono?: string; email?: string } | null
  onSave: (nombre: string, contacto: string, telefono: string, email: string) => void
}

export function ProveedorFormDialog({ open, onOpenChange, proveedorToEdit, onSave }: ProveedorFormDialogProps) {
  const [nombre, setNombre] = useState("")
  const [contacto, setContacto] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (open) {
      if (proveedorToEdit) {
        setNombre(proveedorToEdit.nombre || "")
        setContacto(proveedorToEdit.contacto || "")
        setTelefono(proveedorToEdit.telefono || "")
        setEmail(proveedorToEdit.email || "")
      } else {
        setNombre("")
        setContacto("")
        setTelefono("")
        setEmail("")
      }
    }
  }, [proveedorToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    onSave(nombre.trim(), contacto.trim(), telefono.trim(), email.trim())
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prov-contacto">Contacto</Label>
              <Input
                id="prov-contacto"
                placeholder="Nombre del contacto..."
                className="bg-secondary/50 border-0"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prov-telefono">Teléfono</Label>
                <Input
                  id="prov-telefono"
                  placeholder="Ej: +569..."
                  className="bg-secondary/50 border-0"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prov-email">Email</Label>
                <Input
                  id="prov-email"
                  placeholder="correo@ejemplo.com"
                  type="email"
                  className="bg-secondary/50 border-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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
