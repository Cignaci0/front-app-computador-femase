"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Settings, Receipt, Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { AsyncCombobox } from "@/components/ui/async-combobox"

interface ComponentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: string 
  componentToEdit?: any | null
  onSave: (data: any) => void
}

const RAM_SPECS: Record<string, { label: string, frecuencias: string[], capacidades: string[], formatos: string[] }> = {
  "DDR": { label: "DDR (DDR1)", frecuencias: ["200", "266", "333", "400"], capacidades: ["128 MB", "256 MB", "512 MB", "1 GB", "2 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR2": { label: "DDR2", frecuencias: ["400", "533", "667", "800", "1066"], capacidades: ["256 MB", "512 MB", "1 GB", "2 GB", "4 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR3": { label: "DDR3", frecuencias: ["800", "1066", "1333", "1600", "1866", "2133"], capacidades: ["1 GB", "2 GB", "4 GB", "8 GB", "16 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR4": { label: "DDR4", frecuencias: ["1600", "1866", "2133", "2400", "2666", "2933", "3200", "3600+", "4000+", "4266+", "4400+", "4600+", "4800+", "5000+"], capacidades: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB", "128 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR5": { label: "DDR5", frecuencias: ["4800", "5200", "5600", "6000", "6400", "6800", "7200", "7600", "8000", "8400", "8800", "9200+", "9600+", "10000+"], capacidades: ["8 GB", "16 GB", "24 GB", "32 GB", "48 GB", "64 GB", "96 GB", "128 GB"], formatos: ["DIMM", "SO-DIMM", "CAMM2*"] },
}

const DISK_SPECS: Record<string, string[]> = {
  "HDD 3.5\"": ["500 GB", "1 TB", "2 TB", "4 TB", "6 TB", "8 TB", "10 TB", "12 TB", "14 TB", "16 TB", "18 TB", "20 TB", "22 TB", "24 TB", "28 TB"],
  "HDD 2.5\"": ["250 GB", "320 GB", "500 GB", "750 GB", "1 TB", "2 TB", "4 TB", "5 TB"],
  "SSD 2.5\"": ["120 GB", "128 GB", "240 GB", "250 GB", "256 GB", "480 GB", "500 GB", "512 GB", "960 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
  "mSATA": ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"],
  "M.2 SATA 2280": ["120 GB", "128 GB", "240 GB", "250 GB", "256 GB", "480 GB", "500 GB", "512 GB", "1 TB", "2 TB"],
  "M.2 SATA 2242": ["120 GB", "128 GB", "240 GB", "250 GB", "256 GB", "480 GB", "500 GB", "512 GB", "1 TB", "2 TB"],
  "NVMe 2280": ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
  "NVMe 2242": ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
  "NVMe 2230": ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
  "NVMe 2260": ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
  "NVMe 22110": ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB", "16 TB"],
}

const CPU_SPECS: Record<string, Record<string, Record<string, { nucleos: string; hilos: string; frecuencia: string }>>> = {
  "INTEL": {
    "Core i3": {
      "i3-12100": { nucleos: "4", hilos: "8", frecuencia: "4.3 GHz turbo" },
      "i3-13100": { nucleos: "4", hilos: "8", frecuencia: "4.5 GHz turbo" },
      "i3-14100": { nucleos: "4", hilos: "8", frecuencia: "4.7 GHz turbo" },
    },
    "Core i5": {
      "i5-12400": { nucleos: "6", hilos: "12", frecuencia: "4.4 GHz turbo" },
      "i5-13400": { nucleos: "10", hilos: "16", frecuencia: "4.6 GHz turbo" },
      "i5-13600K": { nucleos: "14", hilos: "20", frecuencia: "5.1 GHz turbo" },
      "i5-14600K": { nucleos: "14", hilos: "20", frecuencia: "5.3 GHz turbo" },
    },
    "Core i7": {
      "i7-12700K": { nucleos: "12", hilos: "20", frecuencia: "5.0 GHz turbo" },
      "i7-13700K": { nucleos: "16", hilos: "24", frecuencia: "5.4 GHz turbo" },
      "i7-14700K": { nucleos: "20", hilos: "28", frecuencia: "5.6 GHz turbo" },
    },
    "Core i9": {
      "i9-12900K": { nucleos: "16", hilos: "24", frecuencia: "5.2 GHz turbo" },
      "i9-13900K": { nucleos: "24", hilos: "32", frecuencia: "5.8 GHz turbo" },
      "i9-14900K": { nucleos: "24", hilos: "32", frecuencia: "6.0 GHz turbo" },
    },
    "Core Ultra 5": {
      "Core Ultra 5 125H": { nucleos: "14", hilos: "18", frecuencia: "4.5 GHz turbo" },
      "Core Ultra 5 135H": { nucleos: "14", hilos: "18", frecuencia: "4.6 GHz turbo" },
    },
    "Core Ultra 7": {
      "Core Ultra 7 155H": { nucleos: "16", hilos: "22", frecuencia: "4.8 GHz turbo" },
      "Core Ultra 7 165H": { nucleos: "16", hilos: "22", frecuencia: "5.0 GHz turbo" },
    },
    "Core Ultra 9": {
      "Core Ultra 9 185H": { nucleos: "16", hilos: "22", frecuencia: "5.1 GHz turbo" },
    }
  },
  "AMD": {
    "Ryzen 3": {
      "Ryzen 3 3100": { nucleos: "4", hilos: "8", frecuencia: "3.9 GHz turbo" },
      "Ryzen 3 4100": { nucleos: "4", hilos: "8", frecuencia: "4.0 GHz turbo" },
      "Ryzen 3 5300G": { nucleos: "4", hilos: "8", frecuencia: "4.2 GHz turbo" },
    },
    "Ryzen 5": {
      "Ryzen 5 3600": { nucleos: "6", hilos: "12", frecuencia: "4.2 GHz turbo" },
      "Ryzen 5 5600X": { nucleos: "6", hilos: "12", frecuencia: "4.6 GHz turbo" },
      "Ryzen 5 7600X": { nucleos: "6", hilos: "12", frecuencia: "5.3 GHz turbo" },
      "Ryzen 5 8600G": { nucleos: "6", hilos: "12", frecuencia: "5.0 GHz turbo" },
    },
    "Ryzen 7": {
      "Ryzen 7 3700X": { nucleos: "8", hilos: "16", frecuencia: "4.4 GHz turbo" },
      "Ryzen 7 5800X": { nucleos: "8", hilos: "16", frecuencia: "4.7 GHz turbo" },
      "Ryzen 7 7700X": { nucleos: "8", hilos: "16", frecuencia: "5.4 GHz turbo" },
      "Ryzen 7 7800X3D": { nucleos: "8", hilos: "16", frecuencia: "5.0 GHz turbo" },
    },
    "Ryzen 9": {
      "Ryzen 9 3900X": { nucleos: "12", hilos: "24", frecuencia: "4.6 GHz turbo" },
      "Ryzen 9 5900X": { nucleos: "12", hilos: "24", frecuencia: "4.8 GHz turbo" },
      "Ryzen 9 7900X": { nucleos: "12", hilos: "24", frecuencia: "5.6 GHz turbo" },
      "Ryzen 9 7950X": { nucleos: "16", hilos: "32", frecuencia: "5.7 GHz turbo" },
    },
    "Ryzen Threadripper": {
      "Threadripper 1900X": { nucleos: "8", hilos: "16", frecuencia: "4.0 GHz turbo" },
      "Threadripper 3960X": { nucleos: "24", hilos: "48", frecuencia: "4.5 GHz turbo" },
      "Threadripper 7970X": { nucleos: "32", hilos: "64", frecuencia: "5.3 GHz turbo" },
      "Threadripper 7980X": { nucleos: "64", hilos: "128", frecuencia: "5.1 GHz turbo" },
    },
    "Ryzen Threadripper Pro": {
      "Threadripper Pro 3955WX": { nucleos: "16", hilos: "32", frecuencia: "4.3 GHz turbo" },
      "Threadripper Pro 5975WX": { nucleos: "32", hilos: "64", frecuencia: "4.5 GHz turbo" },
      "Threadripper Pro 7995WX": { nucleos: "96", hilos: "192", frecuencia: "5.1 GHz turbo" },
    }
  }
}

const CPU_CORES = ["4", "6", "8", "10", "12", "14", "16", "20", "24", "32", "64", "96"]
const CPU_THREADS = ["8", "12", "16", "18", "20", "22", "24", "28", "32", "48", "64", "128", "192"]
const CPU_FREQS = ["3.9 GHz turbo", "4.0 GHz turbo", "4.2 GHz turbo", "4.3 GHz turbo", "4.4 GHz turbo", "4.5 GHz turbo", "4.6 GHz turbo", "4.7 GHz turbo", "4.8 GHz turbo", "5.0 GHz turbo", "5.1 GHz turbo", "5.2 GHz turbo", "5.3 GHz turbo", "5.4 GHz turbo", "5.6 GHz turbo", "5.7 GHz turbo", "5.8 GHz turbo", "6.0 GHz turbo"]

const FIELDS_BY_TYPE: Record<string, { key: string; label: string; placeholder: string; type: 'text' | 'brand' | 'number' | 'ram_tech' | 'ram_format' | 'ram_cap' | 'ram_freq' | 'disk_type' | 'disk_cap' | 'cpu_brand' | 'cpu_family' | 'cpu_model' | 'cpu_cores' | 'cpu_threads' | 'cpu_freq' }[]> = {
  "disco-almacenamiento": [
    { key: "id_marca", label: "Marca", placeholder: "Selecciona una marca", type: "brand" },
    { key: "tipo_disco", label: "Tipo de Disco", placeholder: "Ej: SSD M.2 NVMe, HDD SATA...", type: "disk_type" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: KC3000, Blue...", type: "text" },
    { key: "capacidad", label: "Capacidad", placeholder: "Selecciona una capacidad", type: "disk_cap" },
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
    { key: "tipo_tecnologia", label: "Tipo de Tecnología", placeholder: "Tecnología", type: "ram_tech" },
    { key: "formato", label: "Formato", placeholder: "Formato", type: "ram_format" },
    { key: "capacidad", label: "Capacidad", placeholder: "Capacidad", type: "ram_cap" },
    { key: "frecuencia", label: "Frecuencia", placeholder: "Frecuencia", type: "ram_freq" },
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
    { key: "marca", label: "Marca", placeholder: "Selecciona una marca", type: "cpu_brand" },
    { key: "familia", label: "Familia", placeholder: "Ej: Core i7, Ryzen 7...", type: "cpu_family" },
    { key: "modelo", label: "Modelo", placeholder: "Ej: 13700K, 7800X3D...", type: "cpu_model" },
    { key: "nucleos", label: "Núcleos", placeholder: "Ej: 16", type: "cpu_cores" },
    { key: "hilos", label: "Hilos", placeholder: "Ej: 24", type: "cpu_threads" },
    { key: "frecuencia", label: "Frecuencia", placeholder: "Ej: 5.4 GHz turbo", type: "cpu_freq" },
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

  const [openComboboxBrand, setOpenComboboxBrand] = useState(false)
  const [searchBrand, setSearchBrand] = useState("")
  const fetchMarcas = useCallback((s: string) => getMarcas(1, 10, s).then(r => r.data || []), [])

  const [openComboboxProveedor, setOpenComboboxProveedor] = useState(false)
  const [searchProveedor, setSearchProveedor] = useState("")

  useEffect(() => {
    if (open) {
      const handler = setTimeout(() => {
        getMarcas(1, 10, searchBrand)
          .then((res) => {
            const mapped = (res.data || []).map((b: any) => ({ id: b.id, name: b.nombre }))
            setBrands(mapped)
          })
          .catch(err => console.error(err))
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [open, searchBrand])

  useEffect(() => {
    if (open) {
      const handler = setTimeout(() => {
        getProveedores(1, 10, searchProveedor)
          .then((res) => setProveedores(res.data || []))
          .catch(err => console.error(err))
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [open, searchProveedor])

  // Load form values
  useEffect(() => {
    if (open) {
      setActiveTab("specs")

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

        if (componentToEdit.id_marca && typeof componentToEdit.id_marca === "object") {
           setBrands([{ id: componentToEdit.id_marca.id, name: componentToEdit.id_marca.nombre }])
        }
        if (componentToEdit.proveedor) {
           setProveedores([componentToEdit.proveedor])
        }
      } else {
        setProveedorId("")
        setFactura("")
        setFechaCompra("")
      }
      setFormData(initial)
    } else {
      setSearchBrand("")
      setSearchProveedor("")
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
      } else if (f.type === "ram_tech" || f.type === "ram_format" || f.type === "ram_cap" || f.type === "ram_freq" || f.type === "disk_type") {
        if (!String(formData[f.key] || "").trim()) {
          isValid = false
        }
      } else if (f.key !== "id_marca" && f.key !== "uso" && !String(formData[f.key] || "").trim()) {
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
      } else if (f.type === "ram_tech" || f.type === "ram_format" || f.type === "ram_cap" || f.type === "ram_freq" || f.type === "disk_type") {
        submission[f.key] = String(formData[f.key] || "").trim() || ""
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
      if (f.type === "ram_tech" || f.type === "ram_format" || f.type === "ram_cap" || f.type === "ram_freq" || f.type === "disk_type") {
        return !!String(formData[f.key] || "").trim()
      }
      return !!String(formData[f.key] || "").trim() // Text is required
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
                  if (field.type === "cpu_brand") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => {
                            handleFieldChange(field.key, val);
                            handleFieldChange("familia", "");
                            handleFieldChange("modelo", "");
                            handleFieldChange("nucleos", "");
                            handleFieldChange("hilos", "");
                            handleFieldChange("frecuencia", "");
                          }}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INTEL">INTEL</SelectItem>
                            <SelectItem value="AMD">AMD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.type === "cpu_family") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => {
                            handleFieldChange(field.key, val);
                            handleFieldChange("modelo", "");
                            handleFieldChange("nucleos", "");
                            handleFieldChange("hilos", "");
                            handleFieldChange("frecuencia", "");
                          }}
                          disabled={!formData["marca"]}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {formData["marca"] && CPU_SPECS[formData["marca"]] && Object.keys(CPU_SPECS[formData["marca"]]).map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                            {formData[field.key] && formData["marca"] && (!CPU_SPECS[formData["marca"]] || !CPU_SPECS[formData["marca"]][formData[field.key]]) && (
                              <SelectItem value={formData[field.key]}>{formData[field.key]}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.type === "cpu_model") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => {
                            handleFieldChange(field.key, val);
                            const specs = formData["marca"] && CPU_SPECS[formData["marca"]]?.[formData["familia"]]?.[val];
                            if (specs) {
                              handleFieldChange("nucleos", specs.nucleos);
                              handleFieldChange("hilos", specs.hilos);
                              handleFieldChange("frecuencia", specs.frecuencia);
                            }
                          }}
                          disabled={!formData["familia"]}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {formData["marca"] && formData["familia"] && CPU_SPECS[formData["marca"]]?.[formData["familia"]] && Object.keys(CPU_SPECS[formData["marca"]][formData["familia"]]).map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                            {formData[field.key] && formData["familia"] && (!CPU_SPECS[formData["marca"]]?.[formData["familia"]] || !CPU_SPECS[formData["marca"]][formData["familia"]][formData[field.key]]) && (
                              <SelectItem value={formData[field.key]}>{formData[field.key]}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.type === "cpu_cores" || field.type === "cpu_threads" || field.type === "cpu_freq") {
                    const isKnownModel = formData["marca"] && formData["familia"] && formData["modelo"] && CPU_SPECS[formData["marca"]]?.[formData["familia"]]?.[formData["modelo"]];
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Input
                          type={field.type === "cpu_freq" ? "text" : "number"}
                          value={formData[field.key] || ""}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="bg-secondary/50 border-0"
                          readOnly={!!isKnownModel}
                          disabled={!!isKnownModel || !formData["modelo"]}
                        />
                      </div>
                    )
                  }

                  if (field.type === "brand") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <AsyncCombobox
                          value={String(formData[field.key] || "")}
                          onValueChange={(val: string) => handleFieldChange(field.key, val)}
                          fetcher={fetchMarcas}
                          placeholder={field.placeholder}
                          preloadItems={
                            formData[field.key] 
                              ? formData[field.key] === "_null" 
                                ? [{ id: "_null", nombre: "Sin Marca (Ninguno)" }] 
                                : brands.find(b => String(b.id) === String(formData[field.key])) 
                                  ? [{ id: formData[field.key], nombre: brands.find(b => String(b.id) === String(formData[field.key]))?.name }] 
                                  : [{ id: formData[field.key], nombre: "Marca actual" }]
                              : []
                          }
                          extraItems={type === "disco-almacenamiento" ? [{ id: "_null", nombre: "Sin Marca (Ninguno)" }] : []}
                        />
                      </div>
                    )
                  }

                  if (field.type === "disk_type") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => {
                            handleFieldChange(field.key, val)
                            handleFieldChange("capacidad_num", "")
                          }}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(DISK_SPECS).map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                            {formData[field.key] && !DISK_SPECS[formData[field.key]] && (
                              <SelectItem value={formData[field.key]}>{formData[field.key]}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.type === "ram_tech") {
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => setFormData(prev => ({ ...prev, [field.key]: val, formato: "", capacidad: "", frecuencia: "" }))}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(RAM_SPECS).map((tech) => (
                              <SelectItem key={tech} value={tech}>
                                {RAM_SPECS[tech].label}
                              </SelectItem>
                            ))}
                            {formData[field.key] && !RAM_SPECS[formData[field.key]] && (
                              <SelectItem value={formData[field.key]}>{formData[field.key]}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.type === "ram_format") {
                    const selectedTech = formData["tipo_tecnologia"]
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => handleFieldChange(field.key, val)}
                          disabled={!selectedTech}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTech && RAM_SPECS[selectedTech]?.formatos.map((fmt) => (
                              <SelectItem key={fmt} value={fmt}>
                                {fmt}
                              </SelectItem>
                            ))}
                            {formData[field.key] && selectedTech && !RAM_SPECS[selectedTech]?.formatos.includes(formData[field.key]) && (
                              <SelectItem value={formData[field.key]}>{formData[field.key]}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.type === "ram_cap") {
                    const selectedTech = formData["tipo_tecnologia"]
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => handleFieldChange(field.key, val)}
                          disabled={!selectedTech}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTech && RAM_SPECS[selectedTech]?.capacidades.map((cap) => (
                              <SelectItem key={cap} value={cap}>
                                {cap}
                              </SelectItem>
                            ))}
                            {formData[field.key] && selectedTech && !RAM_SPECS[selectedTech]?.capacidades.includes(formData[field.key]) && (
                              <SelectItem value={formData[field.key]}>{formData[field.key]}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (field.type === "ram_freq") {
                    const selectedTech = formData["tipo_tecnologia"]
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <Select
                          value={formData[field.key] || ""}
                          onValueChange={(val) => handleFieldChange(field.key, val)}
                          disabled={!selectedTech}
                        >
                          <SelectTrigger id={field.key} className="bg-secondary/50 border-0">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTech && RAM_SPECS[selectedTech]?.frecuencias.map((freq) => (
                              <SelectItem key={freq} value={`${freq} MHz`}>
                                {freq} MHz
                              </SelectItem>
                            ))}
                            {formData[field.key] && selectedTech && !RAM_SPECS[selectedTech]?.frecuencias.some(f => `${f} MHz` === formData[field.key]) && (
                              <SelectItem value={formData[field.key]}>{formData[field.key]}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  const unitConfig = UNIT_FIELDS_CONFIG[type]?.[field.key]
                  if (unitConfig) {
                    const currentUnit = formData[field.key + "_unit"] || unitConfig.default
                    
                    if (field.type === "disk_cap") {
                      return (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key}>{field.label}</Label>
                          <div className="flex gap-2">
                            <Select
                              value={currentUnit}
                              onValueChange={(val) => {
                                handleFieldChange(field.key + "_unit", val)
                                handleFieldChange(field.key + "_num", "")
                              }}
                            >
                              <SelectTrigger className="w-[80px] bg-secondary/50 border-0">
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
                            <Select
                              value={formData[field.key + "_num"] || ""}
                              onValueChange={(val) => handleFieldChange(field.key + "_num", val)}
                              disabled={!formData["tipo_disco"]}
                            >
                              <SelectTrigger className="flex-1 bg-secondary/50 border-0">
                                <SelectValue placeholder="Capacidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData["tipo_disco"] && DISK_SPECS[formData["tipo_disco"]]?.filter(c => c.endsWith(currentUnit)).map(c => c.replace(currentUnit, "").trim()).map((num) => (
                                  <SelectItem key={num} value={num}>
                                    {num}
                                  </SelectItem>
                                ))}
                                {formData[field.key + "_num"] && formData["tipo_disco"] && (!DISK_SPECS[formData["tipo_disco"]] || !DISK_SPECS[formData["tipo_disco"]].filter(c => c.endsWith(currentUnit)).map(c => c.replace(currentUnit, "").trim()).includes(formData[field.key + "_num"])) && (
                                  <SelectItem value={formData[field.key + "_num"]}>{formData[field.key + "_num"]}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )
                    }

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
                            value={currentUnit}
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
                  <Popover open={openComboboxProveedor} onOpenChange={setOpenComboboxProveedor}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openComboboxProveedor}
                        className="w-full justify-between bg-secondary/50 border-0"
                      >
                        {proveedorId
                          ? proveedores.find((p) => String(p.id) === proveedorId)?.nombre || "Proveedor seleccionado"
                          : "Selecciona un proveedor"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder="Buscar proveedor..." 
                          value={searchProveedor}
                          onValueChange={setSearchProveedor}
                        />
                        <CommandList>
                          <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
                          <CommandGroup>
                            {proveedores.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={String(p.id)}
                                onSelect={(currentValue) => {
                                  setProveedorId(currentValue)
                                  setOpenComboboxProveedor(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    proveedorId === String(p.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {p.nombre}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
