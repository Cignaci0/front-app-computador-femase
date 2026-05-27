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
import { getMarcas } from "@/services/marcaService"

interface ComponentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: string // "disco-almacenamiento" | "fuente-poder" | "memoria-ram" | "placa-madre" | "procesador" | "tarjeta-grafica"
  componentToEdit?: any | null
  onSave: (data: any) => void
}

const FIELDS_BY_TYPE: Record<string, { key: string; label: string; placeholder: string; type: 'text' | 'brand' }[]> = {
  "disco-almacenamiento": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "tipo_disco", label: "Tipo de Disco", placeholder: "Ej: SSD M.2 NVMe, HDD SATA...", type: "text" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: KC3000, Blue...", type: "text" },
    { key: "capacidad", label: "Capacidad", placeholder: "Ej: 1 TB, 512 GB...", type: "text" },
  ],
  "fuente-poder": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: ROG Strix 750G, Core Reactor...", type: "text" },
    { key: "potencia", label: "Potencia", placeholder: "Ej: 750W, 850W...", type: "text" },
    { key: "certificacion", label: "Certificación", placeholder: "Ej: 80 Plus Gold, 80 Plus Bronze...", type: "text" }
  ],
  "memoria-ram": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: Fury Beast, Vengeance...", type: "text" },
    { key: "tipo_tecnologia", label: "Tipo de Tecnología", placeholder: "Ej: DDR5, DDR4...", type: "text" },
    { key: "formato", label: "Formato", placeholder: "Ej: DIMM, SO-DIMM...", type: "text" },
    { key: "capacidad", label: "Capacidad", placeholder: "Ej: 16 GB, 8 GB...", type: "text" },
    { key: "frecuencia", label: "Frecuencia", placeholder: "Ej: 5200 MHz, 3200 MHz...", type: "text" }
  ],
  "placa-madre": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: Prime Z790-P, B650 AORUS...", type: "text" },
    { key: "socket", label: "Socket", placeholder: "Ej: LGA1700, AM5...", type: "text" },
    { key: "chipset", label: "Chipset", placeholder: "Ej: Z790, B650...", type: "text" }
  ],
  "procesador": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "familia", label: "Familia", placeholder: "Ej: Core i7, Ryzen 7...", type: "text" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: 13700K, 7800X3D...", type: "text" },
    { key: "socket", label: "Socket", placeholder: "Ej: LGA1700, AM5...", type: "text" },
    { key: "nucleos", label: "Núcleos", placeholder: "Ej: 16 nucleos...", type: "text" },
    { key: "hilos", label: "Hilos", placeholder: "Ej: 24 hilos...", type: "text" },
    { key: "frecuencia", label: "Frecuencia", placeholder: "Ej: 5.40 GHz...", type: "text" }
  ],
  "tarjeta-grafica": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "ensamblador", label: "Ensamblador", placeholder: "Ej: ASUS, MSI, Gigabyte...", type: "text" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: Arc A750 ROG Strix, RTX 4070...", type: "text" },
    { key: "vram", label: "VRAM", placeholder: "Ej: 8 GB, 12 GB...", type: "text" }
  ]
}

const COMPONENT_TITLES: Record<string, string> = {
  "disco-almacenamiento": "Disco de Almacenamiento",
  "fuente-poder": "Fuente de Poder",
  "memoria-ram": "Memoria RAM",
  "placa-madre": "Placa Madre",
  "procesador": "Procesador",
  "tarjeta-grafica": "Tarjeta Gráfica"
}

export function ComponentFormDialog({
  open,
  onOpenChange,
  type,
  componentToEdit,
  onSave
}: ComponentFormDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([])

  // Load brands and form values
  useEffect(() => {
    if (open) {
      // 1. Fetch brands
      const storedBrands = localStorage.getItem("femase_marcas")
      if (storedBrands) {
        setBrands(JSON.parse(storedBrands))
      } else {
        // Fetch from API in background/fallback
        getMarcas(1, 1000).then((res) => {
          const mapped = (res.data || []).map((b: any) => ({ id: b.id, name: b.nombre }))
          setBrands(mapped)
          localStorage.setItem("femase_marcas", JSON.stringify(mapped))
        }).catch(err => console.error("Error fetching brands in dialog:", err))
      }

      // 2. Initialize form data
      const fields = FIELDS_BY_TYPE[type] || []
      const initial: Record<string, any> = {}

      fields.forEach((f) => {
        if (componentToEdit) {
          let val = componentToEdit[f.key]

          // Especial mapping for id_marca if it's an object in GET
          if (f.key === "id_marca" && componentToEdit.id_marca && typeof componentToEdit.id_marca === "object") {
            val = componentToEdit.id_marca.id
          }

          initial[f.key] = val !== undefined && val !== null ? String(val) : ""
        } else {
          initial[f.key] = ""
        }
      })
      setFormData(initial)
    }
  }, [componentToEdit, open, type])

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that required fields (non-optional brand fields, and non-empty text) are provided
    const fields = FIELDS_BY_TYPE[type] || []
    let isValid = true

    fields.forEach((f) => {
      // id_marca is optional for disco-almacenamiento, but required for others
      if (f.key === "id_marca" && type !== "disco-almacenamiento" && !formData[f.key]) {
        isValid = false
      }
      if (f.key !== "id_marca" && !formData[f.key]?.trim()) {
        isValid = false
      }
    })

    if (!isValid) return

    // Build submission payload
    const submission: Record<string, any> = {}
    fields.forEach((f) => {
      if (f.key === "id_marca") {
        submission[f.key] = formData[f.key] ? Number(formData[f.key]) : null
      } else if (type === "procesador" && (f.key === "nucleos" || f.key === "hilos")) {
        const parsed = parseInt(formData[f.key], 10)
        submission[f.key] = isNaN(parsed) ? 0 : parsed
      } else {
        submission[f.key] = formData[f.key]?.trim() || ""
      }
    })

    onSave(submission)
    onOpenChange(false)
  }

  const fields = FIELDS_BY_TYPE[type] || []
  const title = COMPONENT_TITLES[type] || "Componente"

  // Check if form is valid to enable save button
  const isFormValid = () => {
    return fields.every((f) => {
      if (f.key === "id_marca" && type === "disco-almacenamiento") {
        return true // Brand is optional
      }
      if (f.key === "id_marca") {
        return !!formData[f.key] // Brand is required
      }
      return !!formData[f.key]?.trim() // Text is required
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{componentToEdit ? `Editar ${title}` : `Nuevo ${title}`}</DialogTitle>
            <DialogDescription>
              {componentToEdit
                ? "Modifica las especificaciones técnicas del componente."
                : `Ingresa las especificaciones técnicas del nuevo ${title.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {fields.map((field) => {
              if (field.type === "brand") {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Select
                      value={formData[field.key]}
                      onValueChange={(val) => handleFieldChange(field.key, val)}
                    >
                      <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {type === "disco-almacenamiento" && (
                          <SelectItem value="_null">Sin Marca (Ninguno)</SelectItem>
                        )}
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
                          </SelectItem>
                        ))}
                        {brands.length === 0 && (
                          <SelectItem value="_empty" disabled>
                            No hay marcas registradas
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )
              }

              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    placeholder={field.placeholder}
                    className="bg-secondary/50 border-0"
                    value={formData[field.key] || ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                </div>
              )
            })}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              Guardar Componente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
