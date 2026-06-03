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
import { Switch } from "@/components/ui/switch"
import { getMarcas } from "@/services/marcaService"
import { getProveedores } from "@/services/proveedorService"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Settings, Receipt } from "lucide-react"

interface ComponentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: string 
  componentToEdit?: any | null
  onSave: (data: any) => void
}

const FIELDS_BY_TYPE: Record<string, { key: string; label: string; placeholder: string; type: 'text' | 'brand' | 'number' }[]> = {
  "disco-almacenamiento": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "tipo_disco", label: "Tipo de Disco", placeholder: "Ej: SSD M.2 NVMe, HDD SATA...", type: "text" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: KC3000, Blue...", type: "text" },
    { key: "capacidad", label: "Capacidad", placeholder: "Ej: 1 TB, 512 GB...", type: "text" },
    { key: "uso", label: "Cantidad", placeholder: "Ej: 5", type: "number" }
  ],
  "fuente-poder": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: ROG Strix 750G, Core Reactor...", type: "text" },
    { key: "potencia", label: "Potencia", placeholder: "Ej: 750W, 850W...", type: "text" },
    { key: "certificacion", label: "Certificación", placeholder: "Ej: 80 Plus Gold, 80 Plus Bronze...", type: "text" },
    { key: "uso", label: "Cantidad", placeholder: "Ej: 5", type: "number" }
  ],
  "memoria-ram": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "tipo_tecnologia", label: "Tipo de Tecnología", placeholder: "Ej: DDR5, DDR4...", type: "text" },
    { key: "formato", label: "Formato", placeholder: "Ej: DIMM, SO-DIMM...", type: "text" },
    { key: "capacidad", label: "Capacidad", placeholder: "Ej: 16 GB, 8 GB...", type: "text" },
    { key: "frecuencia", label: "Frecuencia", placeholder: "Ej: 5200 MHz, 3200 MHz...", type: "text" },
    { key: "uso", label: "Cantidad", placeholder: "Ej: 5", type: "number" }
  ],
  "placa-madre": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: Prime Z790-P, B650 AORUS...", type: "text" },
    { key: "socket", label: "Socket", placeholder: "Ej: LGA1700, AM5...", type: "text" },
    { key: "chipset", label: "Chipset", placeholder: "Ej: Z790, B650...", type: "text" },
    { key: "uso", label: "Cantidad", placeholder: "Ej: 5", type: "number" }
  ],
  "procesador": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "familia", label: "Familia", placeholder: "Ej: Core i7, Ryzen 7...", type: "text" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: 13700K, 7800X3D...", type: "text" },
    { key: "nucleos", label: "Núcleos", placeholder: "Ej: 16 nucleos...", type: "text" },
    { key: "hilos", label: "Hilos", placeholder: "Ej: 24 hilos...", type: "text" },
    { key: "frecuencia", label: "Frecuencia", placeholder: "Ej: 5.40 GHz...", type: "text" },
    { key: "uso", label: "Cantidad", placeholder: "Ej: 5", type: "number" }
  ],
  "tarjeta-grafica": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: Arc A750 ROG Strix, RTX 4070...", type: "text" },
    { key: "vram", label: "VRAM", placeholder: "Ej: 8 GB, 12 GB...", type: "text" },
    { key: "uso", label: "Cantidad", placeholder: "Ej: 5", type: "number" }
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

const UNIT_FIELDS_CONFIG: Record<string, Record<string, { units: string[]; default: string }>> = {
  "disco-almacenamiento": {
    "capacidad": { units: ["GB", "TB"], default: "GB" }
  },
  "fuente-poder": {
    "potencia": { units: ["W"], default: "W" }
  },
  "memoria-ram": {
    "capacidad": { units: ["GB"], default: "GB" },
    "frecuencia": { units: ["MHz"], default: "MHz" }
  },
  "procesador": {
    "frecuencia": { units: ["GHz", "MHz"], default: "GHz" }
  },
  "tarjeta-grafica": {
    "vram": { units: ["GB"], default: "GB" }
  }
}

function splitValueAndUnit(valStr: string, config: { units: string[]; default: string }) {
  if (!valStr) {
    return { num: "", unit: config.default }
  }
  
  // Match standard numbers (including floats/decimals) and trailing letters
  const match = valStr.match(/^([\d.,]+)\s*(.*)$/)
  if (!match) {
    return { num: valStr, unit: config.default }
  }
  
  const num = match[1]
  const rest = match[2]?.trim() || ""
  
  // Find matching unit case-insensitively
  const foundUnit = config.units.find(
    (u) => u.toLowerCase() === rest.toLowerCase()
  )
  
  return {
    num,
    unit: foundUnit || config.default
  }
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
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([])
  const [activeTab, setActiveTab] = useState("specs")
  const [proveedorId, setProveedorId] = useState("")
  const [factura, setFactura] = useState("")
  const [fechaCompra, setFechaCompra] = useState("")

  // Load brands, proveedores, and form values
  useEffect(() => {
    if (open) {
      setActiveTab("specs")

      // 1. Fetch brands
      const storedBrands = localStorage.getItem("femase_marcas")
      if (storedBrands) {
        setBrands(JSON.parse(storedBrands))
      } else {
        getMarcas(1, 1000).then((res) => {
          const mapped = (res.data || []).map((b: any) => ({ id: b.id, name: b.nombre }))
          setBrands(mapped)
          localStorage.setItem("femase_marcas", JSON.stringify(mapped))
        }).catch(err => console.error("Error fetching brands in dialog:", err))
      }

      // 2. Fetch proveedores
      getProveedores(1, 1000).then((res) => {
        setProveedores(res.data || [])
      }).catch(err => console.error("Error fetching proveedores in dialog:", err))

      // 3. Initialize form data
      const fields = FIELDS_BY_TYPE[type] || []
      const initial: Record<string, any> = {}

      fields.forEach((f) => {
        const unitConfig = UNIT_FIELDS_CONFIG[type]?.[f.key]
        if (componentToEdit) {
          let val = componentToEdit[f.key]

          // Special mapping for id_marca if it's an object in GET
          if (f.key === "id_marca" && componentToEdit.id_marca && typeof componentToEdit.id_marca === "object") {
            val = componentToEdit.id_marca.id
          }

          if (unitConfig) {
            const { num, unit } = splitValueAndUnit(val !== undefined && val !== null ? String(val) : "", unitConfig)
            initial[f.key + "_num"] = num
            initial[f.key + "_unit"] = unit
          } else {
            initial[f.key] = val !== undefined && val !== null ? String(val) : ""
          }
        } else {
          if (unitConfig) {
            initial[f.key + "_num"] = ""
            initial[f.key + "_unit"] = unitConfig.default
          } else {
            initial[f.key] = ""
          }
        }
      })

      if (componentToEdit) {
        initial["activa"] = componentToEdit.activa !== undefined ? componentToEdit.activa : true
        setProveedorId(componentToEdit.proveedor?.id ? String(componentToEdit.proveedor.id) : "")
        setFactura(componentToEdit.factura !== undefined && componentToEdit.factura !== null ? String(componentToEdit.factura) : "")
        setFechaCompra(componentToEdit.fecha_compra ? componentToEdit.fecha_compra.substring(0, 10) : "")
      } else {
        setProveedorId("")
        setFactura("")
        setFechaCompra("")
      }
      setFormData(initial)
    }
  }, [componentToEdit, open, type])

  const handleFieldChange = (key: string, value: any) => {
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
      if (f.key === "uso") {
        if (formData[f.key] === undefined || formData[f.key] === "" || isNaN(Number(formData[f.key]))) {
          isValid = false
        }
      }
      const unitConfig = UNIT_FIELDS_CONFIG[type]?.[f.key]
      if (unitConfig) {
        if (!formData[f.key + "_num"]?.trim()) {
          isValid = false
        }
      } else if (f.key !== "id_marca" && f.key !== "uso" && !formData[f.key]?.trim()) {
        isValid = false
      }
    })

    if (!proveedorId || !factura || isNaN(Number(factura)) || !fechaCompra) {
      isValid = false
    }

    if (!isValid) return

    // Build submission payload
    const submission: Record<string, any> = {}
    fields.forEach((f) => {
      if (f.key === "id_marca") {
        submission[f.key] = formData[f.key] ? Number(formData[f.key]) : null
      } else if (f.key === "uso") {
        submission[f.key] = formData[f.key] !== "" ? Number(formData[f.key]) : 0
      } else if (type === "procesador" && (f.key === "nucleos" || f.key === "hilos")) {
        const parsed = parseInt(formData[f.key], 10)
        submission[f.key] = isNaN(parsed) ? 0 : parsed
      } else {
        const unitConfig = UNIT_FIELDS_CONFIG[type]?.[f.key]
        if (unitConfig) {
          const num = formData[f.key + "_num"]?.trim() || ""
          const unit = formData[f.key + "_unit"] || unitConfig.default
          submission[f.key] = `${num} ${unit}`
        } else {
          submission[f.key] = formData[f.key]?.trim() || ""
        }
      }
    })

    submission["proveedor"] = Number(proveedorId)
    submission["factura"] = Number(factura)
    submission["fecha_compra"] = fechaCompra

    // If editing, also send the activa state
    if (componentToEdit) {
      submission["activa"] = formData["activa"] !== undefined ? formData["activa"] : true
    }

    onSave(submission)
    onOpenChange(false)
  }

  const fields = FIELDS_BY_TYPE[type] || []
  const title = COMPONENT_TITLES[type] || "Componente"

  // Check if form is valid to enable save button
  const isFormValid = () => {
    const specsValid = fields.every((f) => {
      if (f.key === "id_marca" && type === "disco-almacenamiento") {
        return true // Brand is optional
      }
      if (f.key === "id_marca") {
        return !!formData[f.key] // Brand is required
      }
      if (f.key === "uso") {
        return formData[f.key] !== undefined && formData[f.key] !== "" && !isNaN(Number(formData[f.key]))
      }
      const unitConfig = UNIT_FIELDS_CONFIG[type]?.[f.key]
      if (unitConfig) {
        return !!formData[f.key + "_num"]?.trim()
      }
      return !!formData[f.key]?.trim() // Text is required
    })

    const billingValid = !!proveedorId && !!factura && !isNaN(Number(factura)) && !!fechaCompra

    return specsValid && billingValid
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{componentToEdit ? `Editar ${title}` : `Nuevo ${title}`}</DialogTitle>
            <DialogDescription>
              {componentToEdit
                ? "Modifica las especificaciones técnicas y facturación del componente."
                : `Ingresa las especificaciones técnicas y facturación del nuevo ${title.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-lg">
              <TabsTrigger value="specs" className="flex items-center justify-center gap-2 py-2">
                <Settings className="h-4 w-4" />
                <span>Especificaciones</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center justify-center gap-2 py-2">
                <Receipt className="h-4 w-4" />
                <span>Facturación</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="space-y-4 pt-4 outline-none">
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

                  const unitConfig = UNIT_FIELDS_CONFIG[type]?.[field.key]
                  if (unitConfig) {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <div className="flex gap-2">
                          <Input
                            id={field.key}
                            placeholder="Ej: 8, 16, 3200..."
                            className="bg-secondary/50 border-0 flex-1"
                            type="number"
                            step="any"
                            min={0}
                            value={formData[field.key + "_num"] || ""}
                            onChange={(e) => handleFieldChange(field.key + "_num", e.target.value)}
                          />
                          <Select
                            value={formData[field.key + "_unit"] || unitConfig.default}
                            onValueChange={(val) => handleFieldChange(field.key + "_unit", val)}
                          >
                            <SelectTrigger className="w-[100px] bg-secondary/50 border-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {unitConfig.units.map((u) => (
                                <SelectItem key={u} value={u}>
                                  {u}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
                        type={field.type === "number" ? "number" : "text"}
                        min={field.type === "number" ? 0 : undefined}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      />
                    </div>
                  )
                })}

                {componentToEdit && (
                  <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-md border border-border mt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="comp-activa" className="font-semibold cursor-pointer">Componente Activo</Label>
                      <p className="text-xs text-muted-foreground">
                        Define si este componente está disponible para armar equipos.
                      </p>
                    </div>
                    <Switch
                      id="comp-activa"
                      checked={formData["activa"] !== undefined ? formData["activa"] : true}
                      onCheckedChange={(checked) => handleFieldChange("activa", checked)}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4 pt-4 outline-none">
              <div className="grid gap-4 py-2">
                {/* Proveedor */}
                <div className="space-y-2">
                  <Label htmlFor="comp-proveedor">Proveedor *</Label>
                  <Select
                    value={proveedorId}
                    onValueChange={setProveedorId}
                  >
                    <SelectTrigger id="comp-proveedor" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                      {proveedores.length === 0 && (
                        <SelectItem value="_empty" disabled>
                          No hay proveedores registrados
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Factura */}
                <div className="space-y-2">
                  <Label htmlFor="comp-factura">Factura *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                    <Input
                      id="comp-factura"
                      placeholder="Ej: 15000"
                      className="pl-7 bg-secondary/50 border-0"
                      type="number"
                      min={0}
                      value={factura}
                      onChange={(e) => setFactura(e.target.value)}
                    />
                  </div>
                </div>

                {/* Fecha de compra */}
                <div className="space-y-2">
                  <Label htmlFor="comp-fecha-compra">Fecha de Compra *</Label>
                  <Input
                    id="comp-fecha-compra"
                    type="date"
                    className="bg-secondary/50 border-0"
                    value={fechaCompra}
                    onChange={(e) => setFechaCompra(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
