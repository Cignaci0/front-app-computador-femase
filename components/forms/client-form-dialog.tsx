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

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientToEdit?: {
    id: number
    name: string
    nombre_contacto?: string | null
    telefono?: string | null
    correo?: string | null
  } | null
  onSave: (data: {
    nombre: string
    nombre_contacto: string
    telefono: string
    correo: string
  }) => void
}

export function ClientFormDialog({ open, onOpenChange, clientToEdit, onSave }: ClientFormDialogProps) {
  const [name, setName] = useState("")
  const [nombreContacto, setNombreContacto] = useState("")
  const [telefono, setTelefono] = useState("")
  const [correo, setCorreo] = useState("")

  useEffect(() => {
    if (open) {
      if (clientToEdit) {
        setName(clientToEdit.name)
        setNombreContacto(clientToEdit.nombre_contacto || "")
        setTelefono(clientToEdit.telefono || "")
        setCorreo(clientToEdit.correo || "")
      } else {
        setName("")
        setNombreContacto("")
        setTelefono("")
        setCorreo("")
      }
    }
  }, [clientToEdit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      nombre: name.trim(),
      nombre_contacto: nombreContacto.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {clientToEdit ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              {clientToEdit ? "Modifica los datos del cliente y su contacto." : "Ingresa los datos del nuevo cliente."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="client-name" className="text-sm font-semibold tracking-wide">
                Nombre del Cliente <span className="text-destructive">*</span>
              </Label>
              <Input
                id="client-name"
                placeholder="Ej: PIE ANTOFAGASTA, FEMASE..."
                className="bg-secondary/40 border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="client-contact" className="text-sm font-semibold tracking-wide">
                Nombre de Contacto
              </Label>
              <Input
                id="client-contact"
                placeholder="Ej: MARIA ANTONIA"
                className="bg-secondary/40 border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                value={nombreContacto}
                onChange={(e) => setNombreContacto(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="client-phone" className="text-sm font-semibold tracking-wide">
                  Teléfono
                </Label>
                <Input
                  id="client-phone"
                  placeholder="Ej: +56932884732"
                  className="bg-secondary/40 border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-email" className="text-sm font-semibold tracking-wide">
                  Correo Electrónico
                </Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="Ej: MariaAntonia@gmail.com"
                  className="bg-secondary/40 border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 border-t border-border/20 pt-4 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-secondary/60">
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Guardar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
