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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Cpu, Key, Layers, Database, ShieldCheck, Check, X, Clipboard } from "lucide-react"
import { useState } from "react"

interface EquipmentInspectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: any | null
}

export function EquipmentInspectDialog({ open, onOpenChange, equipment }: EquipmentInspectDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!equipment) return null

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

  // RAM slots mapping
  const rams = [equipment.memoria_ram_1, equipment.memoria_ram_2, equipment.memoria_ram_3, equipment.memoria_ram_4]
    .filter(Boolean)

  // Storage Disks mapping
  const disks = [
    { disk: equipment.disco_alma_1, sn: equipment.n_serie_disc_alma_1 },
    { disk: equipment.disco_alma_2, sn: equipment.n_serie_disc_alma_2 },
    { disk: equipment.disco_alma_3, sn: equipment.n_serie_disc_alma_3 },
  ].filter(d => d.disk)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[92vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-md">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span>Ficha Técnica Equipo #{equipment.id}</span>
              {getStatusBadge(equipment.estado)}
            </DialogTitle>
          </div>
          <DialogDescription>
            Detalle completo de especificaciones y componentes de hardware.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="general" className="flex items-center justify-center gap-2 py-2">
              <Info className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="hardware" className="flex items-center justify-center gap-2 py-2">
              <Cpu className="h-4 w-4" />
              <span>Hardware</span>
            </TabsTrigger>
            <TabsTrigger value="licencias" className="flex items-center justify-center gap-2 py-2">
              <Key className="h-4 w-4" />
              <span>Red y Licencias</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GENERAL */}
          <TabsContent value="general" className="space-y-4 pt-4 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDetailItem("Tipo de Equipo", equipment.tipo_de_equipo?.nombre)}
              {renderDetailItem("Marca", equipment.marca?.nombre)}
              {renderDetailItem("Modelo", equipment.modelo?.nombre)}
              {renderDetailItem("Cliente / Sucursal", equipment.cliente?.nombre)}
              {equipment.cliente?.nombre_contacto && renderDetailItem("Contacto Cliente", equipment.cliente.nombre_contacto)}
              {equipment.cliente?.telefono && renderDetailItem("Teléfono Cliente", equipment.cliente.telefono, true)}
              {equipment.cliente?.correo && renderDetailItem("Correo Cliente", equipment.cliente.correo, true)}
              {renderDetailItem("Usuario Asignado", equipment.usuario)}
              {renderDetailItem("Nombre de Equipo (Host)", equipment.nombre_equipo, true)}
              {renderDetailItem("Vencimiento Garantía", formatDate(equipment.vencimiento_garantia))}
              {renderDetailItem("Última Actualización", formatDate(equipment.updatedAt))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-lg border border-border/80">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Lector de DVD</span>
                {equipment.dvd ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold gap-1"><Check className="h-3 w-3" /> Sí</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground/60 border-muted-foreground/20 gap-1"><X className="h-3 w-3" /> No</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Cámara Integrada</span>
                {equipment.camara ? (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold gap-1"><Check className="h-3 w-3" /> Sí</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground/60 border-muted-foreground/20 gap-1"><X className="h-3 w-3" /> No</Badge>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: HARDWARE */}
          <TabsContent value="hardware" className="space-y-4 pt-4 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDetailItem("Procesador (CPU)", equipment.procesador ? `${equipment.procesador.marca?.nombre || ""} ${equipment.procesador.familia} ${equipment.procesador.modelo} (${equipment.procesador.socket}, ${equipment.procesador.nucleos || "N/A"} Núcleos)` : "Ninguno")}
              {renderDetailItem("Placa Madre", equipment.placa ? `${equipment.placa.marca?.nombre || ""} ${equipment.placa.modelo} (Socket ${equipment.placa.socket || "N/A"}, Chipset ${equipment.placa.chipset || "N/A"})` : "Ninguno")}
              {renderDetailItem("Tarjeta Gráfica (GPU)", equipment.tarjeta_grafica ? `${equipment.tarjeta_grafica.marca?.nombre || ""} ${equipment.tarjeta_grafica.ensamblador || ""} ${equipment.tarjeta_grafica.modelo} (${equipment.tarjeta_grafica.vram || "N/A"})` : "Ninguno")}
              {renderDetailItem("Fuente de Poder", equipment.fuente ? `${equipment.fuente.marca?.nombre || ""} ${equipment.fuente.modelo} (${equipment.fuente.potencia || "N/A"} - ${equipment.fuente.certificacion || "N/A"})` : "Ninguno")}
            </div>

            {/* RAM CONFIGURATION */}
            <div className="bg-secondary/15 p-4 rounded-lg border border-border/80 space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <Layers className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Configuración de Memoria RAM ({rams.length} slots ocupados)</h4>
              </div>
              {rams.length === 0 ? (
                <div className="text-xs text-muted-foreground italic py-2">Sin memoria RAM configurada.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rams.map((r, i) => (
                    <div key={i} className="bg-secondary/25 p-3 rounded-md border border-border/40">
                      <div className="text-xs text-primary font-bold">Slot {i + 1}</div>
                      <div className="text-sm font-semibold text-foreground mt-1">
                        {r.marca?.nombre || ""} - {r.modelo || "DESCONOCIDO"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                        <span>Tecnología: {r.tipo_tecnologia || "DDR4"}</span>
                        <span>Formato: {r.formato || "DIMM"}</span>
                        <span>Capacidad: {r.capacidad || "N/A"}</span>
                        <span>Frecuencia: {r.frecuencia || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STORAGE CONFIGURATION */}
            <div className="bg-secondary/15 p-4 rounded-lg border border-border/80 space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <Database className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Configuración de Almacenamiento ({disks.length} unidades)</h4>
              </div>
              {disks.length === 0 ? (
                <div className="text-xs text-muted-foreground italic py-2">Sin almacenamiento configurado.</div>
              ) : (
                <div className="space-y-3">
                  {disks.map((dObj, i) => {
                    const d = dObj.disk
                    return (
                      <div key={i} className="bg-secondary/25 p-3 rounded-md border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-primary font-bold">Disco {i + 1}</div>
                          <div className="text-sm font-semibold text-foreground mt-1">
                            {d.marca?.nombre || ""} {d.modelo || ""}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Tipo: {d.tipo_disco || "SSD"} | Capacidad: {d.capacidad || "N/A"}
                          </div>
                        </div>
                        <div className="flex flex-col justify-end md:items-end">
                          <span className="text-xs text-muted-foreground">N° Serie Disco</span>
                          <span className="text-xs font-mono font-semibold text-foreground">{dObj.sn || "N/A"}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: LICENCIAS Y RED */}
          <TabsContent value="licencias" className="space-y-4 pt-4 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDetailItem("N° Serie BIOS", equipment.n_serie_bios, true)}
              {renderDetailItem("N° Serie Cargador Laptop", equipment.n_serie_cargador_note, true)}
              {renderDetailItem("MAC Ethernet 1", equipment.mac_ethernet_1, true)}
              {renderDetailItem("MAC Ethernet 2", equipment.mac_ethernet_2, true)}
              {renderDetailItem("MAC Wifi", equipment.mac_wifi, true)}
              {renderDetailItem("ID TeamViewer", equipment.id_teamviewer, true)}
            </div>

            {/* LICENSES KEYS SECTION */}
            <div className="bg-secondary/15 p-4 rounded-lg border border-border/80 space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">Información de Licencias</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderDetailItem("Licencia Windows", equipment.key_win?.nombre)}
                {renderDetailItem("Key Windows", equipment.key_win?.key, true)}
                {renderDetailItem("Licencia Office", equipment.key_office?.nombre)}
                {renderDetailItem("Key Office", equipment.key_office?.key, true)}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t border-border/50">
          <Button type="button" onClick={() => onOpenChange(false)} className="w-full md:w-auto">
            Cerrar Ficha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
