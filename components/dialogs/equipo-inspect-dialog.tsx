"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clipboard, Printer } from "lucide-react"
import { useState } from "react"

interface EquipoInspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipo: any | null
}

export function EquipoInspectDialog({ open, onOpenChange, equipo }: EquipoInspectDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!equipo) return null

  const handleCopy = (text: string, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Activo</Badge>
      case "MANTENIMIENTO":
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">Mantenimiento</Badge>
      case "BODEGA":
        return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20">Bodega</Badge>
      case "BAJA":
        return <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20">Baja</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderDetailItem = (label: string, value: any, copyable = false) => {
    const displayValue = value === true ? "Sí" : value === false ? "No" : value || "N/A"
    const hasValue = !!value && value !== "N/A"

    return (
      <div className="space-y-1 bg-secondary/15 p-3 rounded-lg border border-border/40 flex flex-col justify-between group relative">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${hasValue ? "font-semibold text-foreground" : "text-muted-foreground/60 italic"}`}>
            {displayValue}
          </span>
          {copyable && hasValue && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
              onClick={() => handleCopy(displayValue, label)}
            >
              {copiedField === label ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Clipboard className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("es-CL", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" })
    } catch {
      return dateStr
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span>Ficha Técnica Equipo</span>
              {getStatusBadge(equipo.estado)}
            </DialogTitle>
          </div>
          <DialogDescription>
            Vista detallada de la información del equipo
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
              Información Principal
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {renderDetailItem("ID del Equipo", equipo.id, true)}
              {renderDetailItem("Tipo", equipo.tipo_equipo?.nombre, true)}
              {renderDetailItem("N° de Serie", equipo.n_serie, true)}
              {renderDetailItem("Marca", equipo.marca?.nombre)}
              {renderDetailItem("Modelo", equipo.modelo?.nombre)}
              {equipo.pulgadas && renderDetailItem("Pulgadas", `${equipo.pulgadas}"`)}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
              Fechas y Garantía
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {renderDetailItem("Garantía", equipo.garantia ? `${equipo.garantia} Meses` : "N/A")}
              {renderDetailItem("Expira Garantía", formatDate(equipo.fe_exp_garantia))}
              {renderDetailItem("Fecha Recibido", formatDate(equipo.fecha_recibido))}
              {renderDetailItem("Fecha Entrega", formatDate(equipo.fecha_entrega))}
            </div>
          </div>

          {equipo.cliente && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                Asignación Actual
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {renderDetailItem("Cliente", equipo.cliente?.nombre)}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/40 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar Detalles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
