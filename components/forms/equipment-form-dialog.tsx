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
import { AsyncCombobox } from "@/components/ui/async-combobox"
import { useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, Info, Key, Layers, Database, Receipt } from "lucide-react"
import { getProveedores } from "@/services/proveedorService"

import { getMarcas } from "@/services/marcaService"
import { getModelos } from "@/services/modeloService"
import { getTiposDeEquipo } from "@/services/tipoDeEquipoService"
import { getComponentes } from "@/services/componentesService"
import { getClientes } from "@/services/clienteService"
import { getLicenciasWin, getLicenciasOffice } from "@/services/licenciaService"

interface EquipmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipmentToEdit?: any | null
  onSave: (data: any) => void
}

const STATUSES = ["RECIBIDO", "LISTO", "ENTREGADO"]

const RAM_SPECS: Record<string, { label: string, frecuencias: string[], capacidades: string[], formatos: string[] }> = {
  "DDR": { label: "DDR (DDR1)", frecuencias: ["200", "266", "333", "400"], capacidades: ["128 MB", "256 MB", "512 MB", "1 GB", "2 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR2": { label: "DDR2", frecuencias: ["400", "533", "667", "800", "1066"], capacidades: ["256 MB", "512 MB", "1 GB", "2 GB", "4 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR3": { label: "DDR3", frecuencias: ["800", "1066", "1333", "1600", "1866", "2133"], capacidades: ["1 GB", "2 GB", "4 GB", "8 GB", "16 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR4": { label: "DDR4", frecuencias: ["1600", "1866", "2133", "2400", "2666", "2933", "3200", "3600+", "4000+", "4266+", "4400+", "4600+", "4800+", "5000+"], capacidades: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB", "128 GB"], formatos: ["DIMM", "SO-DIMM"] },
  "DDR5": { label: "DDR5", frecuencias: ["4800", "5200", "5600", "6000", "6400", "6800", "7200", "7600", "8000", "8400", "8800", "9200+", "9600+", "10000+"], capacidades: ["8 GB", "16 GB", "24 GB", "32 GB", "48 GB", "64 GB", "96 GB", "128 GB"], formatos: ["DIMM", "SO-DIMM", "CAMM2*"] },
}

const DISK_SPECS: Record<string, string[]> = {
  "HDD 3.5\"": ["20 GB", "40 GB", "80 GB", "120 GB", "160 GB", "250 GB", "320 GB", "400 GB", "500 GB", "640 GB", "750 GB", "1 TB", "2 TB", "3 TB", "4 TB", "6 TB", "8 TB", "10 TB", "12 TB", "14 TB", "16 TB", "18 TB", "20 TB", "22 TB"],
  "HDD 2.5\"": ["30 GB", "40 GB", "60 GB", "80 GB", "120 GB", "160 GB", "250 GB", "320 GB", "500 GB", "640 GB", "750 GB", "1 TB", "2 TB", "4 TB", "5 TB"],
  "SSD 2.5\" SATA": ["16 GB", "30 GB", "32 GB", "60 GB", "64 GB", "120 GB", "128 GB", "240 GB", "250 GB", "256 GB", "480 GB", "500 GB", "512 GB", "960 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
  "mSATA": ["8 GB", "16 GB", "32 GB", "64 GB", "120 GB", "128 GB", "240 GB", "256 GB", "480 GB", "500 GB", "512 GB", "1 TB"],
  "M.2 SATA 2280": ["32 GB", "64 GB", "120 GB", "128 GB", "240 GB", "250 GB", "256 GB", "480 GB", "500 GB", "512 GB", "960 GB", "1 TB", "2 TB", "4 TB"],
  "M.2 SATA 2242": ["16 GB", "32 GB", "64 GB", "120 GB", "128 GB", "240 GB", "256 GB", "480 GB", "512 GB", "1 TB", "2 TB"],
  "NVMe 2280": ["120 GB", "128 GB", "240 GB", "250 GB", "256 GB", "480 GB", "500 GB", "512 GB", "960 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
  "NVMe 2242": ["128 GB", "250 GB", "256 GB", "500 GB", "512 GB", "1 TB", "2 TB"],
  "NVMe 2230": ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
  "NVMe 2260": ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
  "NVMe 22110": ["240 GB", "256 GB", "480 GB", "512 GB", "960 GB"]
}

const CPU_SPECS: Record<string, Record<string, Record<string, { nucleos: string; hilos: string; frecuencia: string }>>> = {
  "INTEL": {
    "Celeron": {
      "G1610": { nucleos: "2", hilos: "2", frecuencia: "2.6 GHz" },
      "J1900": { nucleos: "4", hilos: "4", frecuencia: "2.42 GHz" },
      "E3300": { nucleos: "2", hilos: "2", frecuencia: "2.5 GHz" },
      "E3400": { nucleos: "2", hilos: "2", frecuencia: "2.6 GHz" },
      "J4115": { nucleos: "4", hilos: "4", frecuencia: "2.5 GHz" },
      "N4000": { nucleos: "2", hilos: "2", frecuencia: "2.6 GHz" },
      "N4020": { nucleos: "2", hilos: "2", frecuencia: "2.8 GHz" },
      "N4100": { nucleos: "4", hilos: "4", frecuencia: "2.4 GHz" },
      "N4500": { nucleos: "2", hilos: "2", frecuencia: "2.8 GHz" },
    },
    "Pentium": {
      "E5200": { nucleos: "2", hilos: "2", frecuencia: "2.5 GHz" },
      "Gold 6405U": { nucleos: "2", hilos: "4", frecuencia: "2.4 GHz" },
      "Gold 7505": { nucleos: "2", hilos: "4", frecuencia: "3.5 GHz turbo" },
      "Silver N5030": { nucleos: "4", hilos: "4", frecuencia: "3.1 GHz turbo" },
    },
    "Core i3": {
      "i3-2100": { nucleos: "2", hilos: "4", frecuencia: "3.1 GHz" },
      "i3-2120": { nucleos: "2", hilos: "4", frecuencia: "3.3 GHz" },
      "i3-4005U": { nucleos: "2", hilos: "4", frecuencia: "1.7 GHz" },
      "i3-4130": { nucleos: "2", hilos: "4", frecuencia: "3.4 GHz" },
      "i3-4130T": { nucleos: "2", hilos: "4", frecuencia: "2.9 GHz" },
      "i3-4150": { nucleos: "2", hilos: "4", frecuencia: "3.5 GHz" },
      "i3-4160": { nucleos: "2", hilos: "4", frecuencia: "3.6 GHz" },
      "i3-4160T": { nucleos: "2", hilos: "4", frecuencia: "3.1 GHz" },
      "i3-4170": { nucleos: "2", hilos: "4", frecuencia: "3.7 GHz" },
      "i3-6006U": { nucleos: "2", hilos: "4", frecuencia: "2.0 GHz" },
      "i3-6100": { nucleos: "2", hilos: "4", frecuencia: "3.7 GHz" },
      "i3-6100T": { nucleos: "2", hilos: "4", frecuencia: "3.2 GHz" },
      "i3-6100U": { nucleos: "2", hilos: "4", frecuencia: "2.3 GHz" },
      "i3-7020U": { nucleos: "2", hilos: "4", frecuencia: "2.3 GHz" },
      "i3-9100": { nucleos: "4", hilos: "4", frecuencia: "4.2 GHz turbo" },
      "i3-1005G1": { nucleos: "2", hilos: "4", frecuencia: "3.4 GHz turbo" },
      "i3-10100": { nucleos: "4", hilos: "8", frecuencia: "4.3 GHz turbo" },
      "i3-10110U": { nucleos: "2", hilos: "4", frecuencia: "4.1 GHz turbo" },
      "i3-1115G4": { nucleos: "2", hilos: "4", frecuencia: "4.1 GHz turbo" },
      "i3-12100": { nucleos: "4", hilos: "8", frecuencia: "4.3 GHz turbo" },
      "i3-1215U": { nucleos: "6", hilos: "8", frecuencia: "4.4 GHz turbo" },
      "i3-13100": { nucleos: "4", hilos: "8", frecuencia: "4.5 GHz turbo" },
      "i3-1315U": { nucleos: "6", hilos: "8", frecuencia: "4.5 GHz turbo" },
      "i3-14100": { nucleos: "4", hilos: "8", frecuencia: "4.7 GHz turbo" },
    },
    "Core i5": {
      "i5-520M": { nucleos: "2", hilos: "4", frecuencia: "2.93 GHz turbo" },
      "i5-2400": { nucleos: "4", hilos: "4", frecuencia: "3.4 GHz turbo" },
      "i5-2520M": { nucleos: "2", hilos: "4", frecuencia: "3.2 GHz turbo" },
      "i5-3470S": { nucleos: "4", hilos: "4", frecuencia: "3.6 GHz turbo" },
      "i5-4300M": { nucleos: "2", hilos: "4", frecuencia: "3.3 GHz turbo" },
      "i5-4310M": { nucleos: "2", hilos: "4", frecuencia: "3.4 GHz turbo" },
      "i5-4570S": { nucleos: "4", hilos: "4", frecuencia: "3.6 GHz turbo" },
      "i5-4570T": { nucleos: "2", hilos: "4", frecuencia: "3.6 GHz turbo" },
      "i5-4590T": { nucleos: "4", hilos: "4", frecuencia: "3.0 GHz turbo" },
      "i5-5200U": { nucleos: "2", hilos: "4", frecuencia: "2.7 GHz turbo" },
      "i5-5300U": { nucleos: "2", hilos: "4", frecuencia: "2.9 GHz turbo" },
      "i5-6200U": { nucleos: "2", hilos: "4", frecuencia: "2.8 GHz turbo" },
      "i5-6300U": { nucleos: "2", hilos: "4", frecuencia: "3.0 GHz turbo" },
      "i5-6400": { nucleos: "4", hilos: "4", frecuencia: "3.3 GHz turbo" },
      "i5-6400T": { nucleos: "4", hilos: "4", frecuencia: "2.8 GHz turbo" },
      "i5-6500": { nucleos: "4", hilos: "4", frecuencia: "3.6 GHz turbo" },
      "i5-6500T": { nucleos: "4", hilos: "4", frecuencia: "3.1 GHz turbo" },
      "i5-7200U": { nucleos: "2", hilos: "4", frecuencia: "3.1 GHz turbo" },
      "i5-7500": { nucleos: "4", hilos: "4", frecuencia: "3.8 GHz turbo" },
      "i5-8250U": { nucleos: "4", hilos: "8", frecuencia: "3.4 GHz turbo" },
      "i5-8265U": { nucleos: "4", hilos: "8", frecuencia: "3.9 GHz turbo" },
      "i5-8350U": { nucleos: "4", hilos: "8", frecuencia: "3.6 GHz turbo" },
      "i5-8400": { nucleos: "6", hilos: "6", frecuencia: "4.0 GHz turbo" },
      "i5-8400T": { nucleos: "6", hilos: "6", frecuencia: "3.3 GHz turbo" },
      "i5-8500": { nucleos: "6", hilos: "6", frecuencia: "4.1 GHz turbo" },
      "i5-8500T": { nucleos: "6", hilos: "6", frecuencia: "3.5 GHz turbo" },
      "i5-9400": { nucleos: "6", hilos: "6", frecuencia: "4.1 GHz turbo" },
      "i5-9400F": { nucleos: "6", hilos: "6", frecuencia: "4.1 GHz turbo" },
      "i5-9500": { nucleos: "6", hilos: "6", frecuencia: "4.4 GHz turbo" },
      "i5-1035G1": { nucleos: "4", hilos: "8", frecuencia: "3.6 GHz turbo" },
      "i5-10400": { nucleos: "6", hilos: "12", frecuencia: "4.3 GHz turbo" },
      "i5-12400": { nucleos: "6", hilos: "12", frecuencia: "4.4 GHz turbo" },
      "i5-12450H": { nucleos: "8", hilos: "12", frecuencia: "4.4 GHz turbo" },
      "i5-13400": { nucleos: "10", hilos: "16", frecuencia: "4.6 GHz turbo" },
      "i5-13600K": { nucleos: "14", hilos: "20", frecuencia: "5.1 GHz turbo" },
      "i5-14600K": { nucleos: "14", hilos: "20", frecuencia: "5.3 GHz turbo" },
    },
    "Core i7": {
      "i7-4770S": { nucleos: "4", hilos: "8", frecuencia: "3.9 GHz turbo" },
      "i7-4790S": { nucleos: "4", hilos: "8", frecuencia: "4.0 GHz turbo" },
      "i7-6500U": { nucleos: "2", hilos: "4", frecuencia: "3.1 GHz turbo" },
      "i7-7700": { nucleos: "4", hilos: "8", frecuencia: "4.2 GHz turbo" },
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
    "Athlon": {
      "3020e": { nucleos: "2", hilos: "2", frecuencia: "2.6 GHz turbo" },
      "Athlon Silver 3050U": { nucleos: "2", hilos: "2", frecuencia: "3.2 GHz turbo" },
    },
    "Serie A / FX": {
      "A4-9125": { nucleos: "2", hilos: "2", frecuencia: "2.6 GHz turbo" },
      "A10-9620P": { nucleos: "4", hilos: "4", frecuencia: "3.4 GHz turbo" },
      "FX-6300": { nucleos: "6", hilos: "6", frecuencia: "4.1 GHz turbo" },
    },
    "Ryzen 3": {
      "Ryzen 3 3100": { nucleos: "4", hilos: "8", frecuencia: "3.9 GHz turbo" },
      "Ryzen 3 3250U": { nucleos: "2", hilos: "4", frecuencia: "3.5 GHz turbo" },
      "Ryzen 3 3300U": { nucleos: "4", hilos: "4", frecuencia: "3.5 GHz turbo" },
      "Ryzen 3 4100": { nucleos: "4", hilos: "8", frecuencia: "4.0 GHz turbo" },
      "Ryzen 3 4300U": { nucleos: "4", hilos: "4", frecuencia: "3.7 GHz turbo" },
      "Ryzen 3 5300G": { nucleos: "4", hilos: "8", frecuencia: "4.2 GHz turbo" },
      "Ryzen 3 7320U": { nucleos: "4", hilos: "8", frecuencia: "4.1 GHz turbo" },
    },
    "Ryzen 5": {
      "Ryzen 5 2500U": { nucleos: "4", hilos: "8", frecuencia: "3.6 GHz turbo" },
      "Ryzen 5 3600": { nucleos: "6", hilos: "12", frecuencia: "4.2 GHz turbo" },
      "Ryzen 5 4000 Series": { nucleos: "6", hilos: "6", frecuencia: "4.0 GHz turbo" },
      "Ryzen 5 5600U": { nucleos: "6", hilos: "12", frecuencia: "4.2 GHz turbo" },
      "Ryzen 5 5600X": { nucleos: "6", hilos: "12", frecuencia: "4.6 GHz turbo" },
      "Ryzen 5 5625U": { nucleos: "6", hilos: "12", frecuencia: "4.3 GHz turbo" },
      "Ryzen 5 7600X": { nucleos: "6", hilos: "12", frecuencia: "5.3 GHz turbo" },
      "Ryzen 5 8600G": { nucleos: "6", hilos: "12", frecuencia: "5.0 GHz turbo" },
    },
    "Ryzen 7": {
      "Ryzen 7 3700X": { nucleos: "8", hilos: "16", frecuencia: "4.4 GHz turbo" },
      "Ryzen 7 4800H": { nucleos: "8", hilos: "16", frecuencia: "4.2 GHz turbo" },
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

export function EquipmentFormDialog({ open, onOpenChange, equipmentToEdit, onSave }: EquipmentFormDialogProps) {
  // Navigation tab state
  
  

  const [activeTab, setActiveTab] = useState("general")

  const formatMacAddress = (value: string) => {
    const cleaned = value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    const formatted = cleaned.match(/.{1,2}/g)?.join(':') || '';
    return formatted.substring(0, 17);
  }

  // Form states matching backend entity relationships & columns
  const [tipoDeEquipoId, setTipoDeEquipoId] = useState("")
  const [marcaId, setMarcaId] = useState("")
  const [modeloId, setModeloId] = useState("")
  const [estado, setEstado] = useState("RECIBIDO")
  const [vencimientoGarantia, setVencimientoGarantia] = useState("")
  const [vendidoFemase, setVendidoFemase] = useState(false)

  // Facturacion states
  const [proveedorId, setProveedorId] = useState("")
  const [factura, setFactura] = useState("")
  const [fechaCompra, setFechaCompra] = useState("")
  const [dbProveedores, setDbProveedores] = useState<{ id: number; nombre: string }[]>([])
  const [openComboboxProveedor, setOpenComboboxProveedor] = useState(false)
  const [searchProveedor, setSearchProveedor] = useState("")
  const fetchProveedores = useCallback((s: string) => getProveedores(1, 10, s).then(r => r.data || []), [])

  // Custom added fields from Computador entity
  const [clienteId, setClienteId] = useState("")
  const [usuario, setUsuario] = useState("")
  const [nombreEquipo, setNombreEquipo] = useState("")
  const [nSerieCargadorNote, setNSerieCargadorNote] = useState("")
  const [nSerieBios, setNSerieBios] = useState("")
  const [macEthernet1, setMacEthernet1] = useState("")
  const [macEthernet2, setMacEthernet2] = useState("")
  const [macWifi, setMacWifi] = useState("")
  const [keyWinId, setKeyWinId] = useState("")
  const [keyOfficeId, setKeyOfficeId] = useState("")
  const [dbWinLicenses, setDbWinLicenses] = useState<any[]>([])
  const [dbOfficeLicenses, setDbOfficeLicenses] = useState<any[]>([])
  const [dvd, setDvd] = useState(false)
  const [camara, setCamara] = useState(false)
  const [idTeamviewer, setIdTeamviewer] = useState("")

  // Hardware states
  const [procesadorId, setProcesadorId] = useState("")
  const [tarjetaGraficaId, setTarjetaGraficaId] = useState("")
  const [fuenteId, setFuenteId] = useState("")
  const [placaId, setPlacaId] = useState("")

  // RAM configuration states
  const [ramSlots, setRamSlots] = useState("1") // "1" | "2" | "3" | "4"
  const [memoriaRam1Id, setMemoriaRam1Id] = useState("")
  const [memoriaRam2Id, setMemoriaRam2Id] = useState("")
  const [memoriaRam3Id, setMemoriaRam3Id] = useState("")
  const [memoriaRam4Id, setMemoriaRam4Id] = useState("")

  // Storage Disk configuration states
  const [diskSlots, setDiskSlots] = useState("1") // "1" | "2" | "3"
  const [discoAlma1Id, setDiscoAlma1Id] = useState("")
  const [nSerieDiscAlma1, setNSerieDiscAlma1] = useState("")
  const [discoAlma2Id, setDiscoAlma2Id] = useState("")
  const [nSerieDiscAlma2, setNSerieDiscAlma2] = useState("")
  const [discoAlma3Id, setDiscoAlma3Id] = useState("")
  const [nSerieDiscAlma3, setNSerieDiscAlma3] = useState("")

  // Mode states ('existing' | 'manual')
  const [procesadorMode, setProcesadorMode] = useState<"existing" | "manual">("existing")
  const [placaMode, setPlacaMode] = useState<"existing" | "manual">("existing")
  const [fuenteMode, setFuenteMode] = useState<"existing" | "manual">("existing")
  const [tarjetaGraficaMode, setTarjetaGraficaMode] = useState<"existing" | "manual">("existing")

  const [ram1Mode, setRam1Mode] = useState<"existing" | "manual">("existing")
  const [ram2Mode, setRam2Mode] = useState<"existing" | "manual">("existing")
  const [ram3Mode, setRam3Mode] = useState<"existing" | "manual">("existing")
  const [ram4Mode, setRam4Mode] = useState<"existing" | "manual">("existing")

  const [disco1Mode, setDisco1Mode] = useState<"existing" | "manual">("existing")
  const [disco2Mode, setDisco2Mode] = useState<"existing" | "manual">("existing")
  const [disco3Mode, setDisco3Mode] = useState<"existing" | "manual">("existing")

  // Manual component fields
  const [mProcesador, setMProcesador] = useState({ id: "", marca: "", familia: "", modelo: "", nucleos: "", hilos: "", frecuencia: "" })
  const [mPlaca, setMPlaca] = useState({ id: "", marca: "", modelo: "", socket: "", chipset: "" })
  const [mFuente, setMFuente] = useState({ id: "", marca: "", modelo: "", potencia: "", certificacion: "" })
  const [mTarjetaGrafica, setMTarjetaGrafica] = useState({ id: "", marca: "", modelo: "", vram: "" })

  const [mRam1, setMRam1] = useState({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })
  const [mRam2, setMRam2] = useState({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })
  const [mRam3, setMRam3] = useState({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })
  const [mRam4, setMRam4] = useState({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })

  const [mDisco1, setMDisco1] = useState({ id: "", marca: "", tipo_disco: "", modelo: "", capacidad: "" })
  const [mDisco2, setMDisco2] = useState({ id: "", marca: "", tipo_disco: "", modelo: "", capacidad: "" })
  const [mDisco3, setMDisco3] = useState({ id: "", marca: "", tipo_disco: "", modelo: "", capacidad: "" })

  const fetchMarcas = useCallback((s: string) => getMarcas(1, 10, s).then(r => r.data || []), [])
  const fetchModelos = useCallback((s: string) => getModelos(1, 10, s, marcaId ? Number(marcaId) : undefined).then(r => (r.data || []).map((m: any) => ({ id: m.id, nombre: m.name || m.nombre, brandId: m.marca?.id }))), [marcaId])
  const fetchTipos = useCallback((s: string) => getTiposDeEquipo(1, 10, s).then(r => r.data || []), [])
  const fetchClientes = useCallback((s: string) => getClientes(1, 10, s).then(r => r.data || []), [])
  
  const fetchWinLic = useCallback((s: string) => getLicenciasWin(1, 10, s).then(r => r.data || []), [])
  const fetchOfficeLic = useCallback((s: string) => getLicenciasOffice(1, 10, s).then(r => r.data || []), [])

  const fetchCpu = useCallback((s: string) => getComponentes('procesador', 1, 10, s).then(r => (r.data || []).filter((c: any) => c.uso > 0 || String(c.id) === String(procesadorId))), [procesadorId])
  const fetchPlaca = useCallback((s: string) => getComponentes('placa-madre', 1, 10, s).then(r => (r.data || []).filter((c: any) => c.uso > 0 || String(c.id) === String(placaId))), [placaId])
  const fetchGpu = useCallback((s: string) => getComponentes('tarjeta-grafica', 1, 10, s).then(r => (r.data || []).filter((c: any) => c.uso > 0 || String(c.id) === String(tarjetaGraficaId))), [tarjetaGraficaId])
  const fetchFuente = useCallback((s: string) => getComponentes('fuente-poder', 1, 10, s).then(r => (r.data || []).filter((c: any) => c.uso > 0 || String(c.id) === String(fuenteId))), [fuenteId])
  
  const fetchRam = useCallback((s: string) => getComponentes('memoria-ram', 1, 10, s).then(r => (r.data || []).filter((c: any) => c.uso > 0 || [memoriaRam1Id, memoriaRam2Id, memoriaRam3Id, memoriaRam4Id].includes(String(c.id)))), [memoriaRam1Id, memoriaRam2Id, memoriaRam3Id, memoriaRam4Id])
  const fetchDisk = useCallback((s: string) => getComponentes('disco-almacenamiento', 1, 10, s).then(r => (r.data || []).filter((c: any) => c.uso > 0 || [discoAlma1Id, discoAlma2Id, discoAlma3Id].includes(String(c.id)))), [discoAlma1Id, discoAlma2Id, discoAlma3Id])

  // Catalog lists
  const [dbBrands, setDbBrands] = useState<{ id: number; nombre: string }[]>([])
  const [dbModels, setDbModels] = useState<{ id: number; nombre: string; brandId: number }[]>([])
  const [dbTypes, setDbTypes] = useState<{ id: number; nombre: string; computador?: boolean }[]>([])
  const [dbClientes, setDbClientes] = useState<{ id: number; nombre: string }[]>([])

  const [cpus, setCpus] = useState<any[]>([])
  const [rams, setRams] = useState<any[]>([])
  const [disks, setDisks] = useState<any[]>([])
  const [gpus, setGpus] = useState<any[]>([])
  const [powers, setPowers] = useState<any[]>([])
  const [plates, setPlates] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      // 1. Fetch catalog data
      getMarcas(1, 1000).then((res) => setDbBrands(res.data || [])).catch(err => console.error(err))

      getModelos(1, 1000).then((res) => {
        const mapped = (res.data || []).map((m: any) => ({
          id: m.id,
          nombre: m.nombre,
          brandId: m.marca?.id || Number(m.marca)
        }))
        setDbModels(mapped)
      }).catch(err => console.error(err))

      getTiposDeEquipo(1, 1000).then((res) => setDbTypes(res.data || [])).catch(err => console.error(err))
      getClientes(1, 1000).then((res) => setDbClientes(res.data || [])).catch(err => console.error(err))
      getLicenciasWin(1, 1000).then((res) => setDbWinLicenses(res.data || [])).catch(err => console.error(err))
      getLicenciasOffice(1, 1000).then((res) => setDbOfficeLicenses(res.data || [])).catch(err => console.error(err))

      // 2. Fetch hardware components
      getComponentes("procesador", 1, 1000).then((res) => setCpus(res.data || [])).catch(err => console.error(err))
      getComponentes("memoria-ram", 1, 1000).then((res) => setRams(res.data || [])).catch(err => console.error(err))
      getComponentes("disco-almacenamiento", 1, 1000).then((res) => setDisks(res.data || [])).catch(err => console.error(err))
      getComponentes("tarjeta-grafica", 1, 1000).then((res) => setGpus(res.data || [])).catch(err => console.error(err))
      getComponentes("fuente-poder", 1, 1000).then((res) => setPowers(res.data || [])).catch(err => console.error(err))
      getComponentes("placa-madre", 1, 1000).then((res) => setPlates(res.data || [])).catch(err => console.error(err))
      getProveedores(1, 1000).then((res) => setDbProveedores(res.data || [])).catch(err => console.error(err))

      // Reset manual modes & inputs
      setProcesadorMode("existing")
      setPlacaMode("existing")
      setFuenteMode("existing")
      setTarjetaGraficaMode("existing")
      setRam1Mode("existing")
      setRam2Mode("existing")
      setRam3Mode("existing")
      setRam4Mode("existing")
      setDisco1Mode("existing")
      setDisco2Mode("existing")
      setDisco3Mode("existing")

      setMProcesador({ id: "", marca: "", familia: "", modelo: "", nucleos: "", hilos: "", frecuencia: "" })
      setMPlaca({ id: "", marca: "", modelo: "", socket: "", chipset: "" })
      setMFuente({ id: "", marca: "", modelo: "", potencia: "", certificacion: "" })
      setMTarjetaGrafica({ id: "", marca: "", modelo: "", vram: "" })
      setMRam1({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })
      setMRam2({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })
      setMRam3({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })
      setMRam4({ id: "", marca: "", tipo_tecnologia: "", formato: "", capacidad: "", frecuencia: "" })
      setMDisco1({ id: "", marca: "", tipo_disco: "", modelo: "", capacidad: "" })
      setMDisco2({ id: "", marca: "", tipo_disco: "", modelo: "", capacidad: "" })
      setMDisco3({ id: "", marca: "", tipo_disco: "", modelo: "", capacidad: "" })

      // 3. Initialize or map fields for edit
      if (equipmentToEdit) {
        setTipoDeEquipoId(equipmentToEdit.tipo_de_equipo?.id ? String(equipmentToEdit.tipo_de_equipo.id) : "")
        setMarcaId(equipmentToEdit.marca?.id ? String(equipmentToEdit.marca.id) : "")
        setModeloId(equipmentToEdit.modelo?.id ? String(equipmentToEdit.modelo.id) : "")
        setEstado(equipmentToEdit.estado || "RECIBIDO")

        if (equipmentToEdit.vencimiento_garantia) {
          setVencimientoGarantia(String(equipmentToEdit.vencimiento_garantia))
        } else {
          setVencimientoGarantia("")
        }

        setVendidoFemase(equipmentToEdit.vendido_femase || false)

        setClienteId(equipmentToEdit.cliente?.id ? String(equipmentToEdit.cliente.id) : "")
        setUsuario(equipmentToEdit.usuario || "")
        setNombreEquipo(equipmentToEdit.nombre_equipo || "")
        setNSerieCargadorNote(equipmentToEdit.n_serie_cargador_note || "")
        setNSerieBios(equipmentToEdit.n_serie_bios || "")
        setMacEthernet1(equipmentToEdit.mac_ethernet_1 || "")
        setMacEthernet2(equipmentToEdit.mac_ethernet_2 || "")
        setMacWifi(equipmentToEdit.mac_wifi || "")
        setKeyWinId(equipmentToEdit.lice_clie ? "clie" : (equipmentToEdit.key_win?.id ? String(equipmentToEdit.key_win.id) : ""))
        setKeyOfficeId(equipmentToEdit.lice_marca ? "marca" : (equipmentToEdit.key_office?.id ? String(equipmentToEdit.key_office.id) : ""))
        setDvd(!!equipmentToEdit.dvd)
        setCamara(!!equipmentToEdit.camara)
        setIdTeamviewer(equipmentToEdit.id_teamviewer || "")

        setProveedorId(equipmentToEdit.proveedor?.id ? String(equipmentToEdit.proveedor.id) : "")
        setFactura(equipmentToEdit.factura !== undefined && equipmentToEdit.factura !== null ? String(equipmentToEdit.factura) : "")
        setFechaCompra(equipmentToEdit.fecha_compra ? equipmentToEdit.fecha_compra.substring(0, 10) : "")

        // Tarjeta Gráfica
        if (equipmentToEdit.tarjeta_grafica) {
          if (equipmentToEdit.tarjeta_grafica.particular === false) {
            setTarjetaGraficaMode("manual")
            setMTarjetaGrafica({
              id: String(equipmentToEdit.tarjeta_grafica.id || ""),
              marca: String(equipmentToEdit.tarjeta_grafica.id_marca?.id || equipmentToEdit.tarjeta_grafica.id_marca || ""),
              modelo: equipmentToEdit.tarjeta_grafica.modelo || "",
              vram: equipmentToEdit.tarjeta_grafica.vram || "",
            })
            setTarjetaGraficaId("")
          } else {
            setTarjetaGraficaMode("existing")
            setTarjetaGraficaId(String(equipmentToEdit.tarjeta_grafica.id))
          }
        } else {
          setTarjetaGraficaMode("existing")
          setTarjetaGraficaId("")
        }

        // Procesador
        if (equipmentToEdit.procesador) {
          if (equipmentToEdit.procesador.particular === false) {
            setProcesadorMode("manual")
            let parsedMarca = String(equipmentToEdit.procesador.marca || "");
            if (!parsedMarca) {
              const fam = equipmentToEdit.procesador.familia;
              if (fam) {
                if (CPU_SPECS["INTEL"] && CPU_SPECS["INTEL"][fam]) parsedMarca = "INTEL";
                else if (CPU_SPECS["AMD"] && CPU_SPECS["AMD"][fam]) parsedMarca = "AMD";
              }
            }
            setMProcesador({
              id: String(equipmentToEdit.procesador.id || ""),
              marca: parsedMarca,
              familia: equipmentToEdit.procesador.familia || "",
              modelo: equipmentToEdit.procesador.modelo || "",
              nucleos: String(equipmentToEdit.procesador.nucleos ?? ""),
              hilos: String(equipmentToEdit.procesador.hilos ?? ""),
              frecuencia: equipmentToEdit.procesador.frecuencia || "",
            })
            setProcesadorId("")
          } else {
            setProcesadorMode("existing")
            setProcesadorId(String(equipmentToEdit.procesador.id))
          }
        } else {
          setProcesadorMode("existing")
          setProcesadorId("")
        }

        // Placa Madre
        if (equipmentToEdit.placa) {
          if (equipmentToEdit.placa.particular === false) {
            setPlacaMode("manual")
            setMPlaca({
              id: String(equipmentToEdit.placa.id || ""),
              marca: String(equipmentToEdit.placa.id_marca?.id || equipmentToEdit.placa.id_marca || ""),
              modelo: equipmentToEdit.placa.modelo || "",
              socket: equipmentToEdit.placa.socket || "",
              chipset: equipmentToEdit.placa.chipset || "",
            })
            setPlacaId("")
          } else {
            setPlacaMode("existing")
            setPlacaId(String(equipmentToEdit.placa.id))
          }
        } else {
          setPlacaMode("existing")
          setPlacaId("")
        }

        // Fuente
        if (equipmentToEdit.fuente) {
          if (equipmentToEdit.fuente.particular === false) {
            setFuenteMode("manual")
            setMFuente({
              id: String(equipmentToEdit.fuente.id || ""),
              marca: String(equipmentToEdit.fuente.id_marca?.id || equipmentToEdit.fuente.id_marca || ""),
              modelo: equipmentToEdit.fuente.modelo || "",
              potencia: equipmentToEdit.fuente.potencia || "",
              certificacion: equipmentToEdit.fuente.certificacion || "",
            })
            setFuenteId("")
          } else {
            setFuenteMode("existing")
            setFuenteId(String(equipmentToEdit.fuente.id))
          }
        } else {
          setFuenteMode("existing")
          setFuenteId("")
        }

        // Map RAM slots and ids
        const ram1 = equipmentToEdit.memoria_ram_1
        const ram2 = equipmentToEdit.memoria_ram_2
        const ram3 = equipmentToEdit.memoria_ram_3
        const ram4 = equipmentToEdit.memoria_ram_4

        if (ram1) {
          if (ram1.particular === false) {
            setRam1Mode("manual")
            setMRam1({
              id: String(ram1.id || ""),
              marca: String(ram1.id_marca?.id || ram1.id_marca || ""),
              tipo_tecnologia: ram1.tipo_tecnologia || "",
              formato: ram1.formato || "",
              capacidad: ram1.capacidad || "",
              frecuencia: ram1.frecuencia || "",
            })
            setMemoriaRam1Id("")
          } else {
            setRam1Mode("existing")
            setMemoriaRam1Id(String(ram1.id))
          }
        } else {
          setRam1Mode("existing")
          setMemoriaRam1Id("")
        }

        if (ram2) {
          if (ram2.particular === false) {
            setRam2Mode("manual")
            setMRam2({
              id: String(ram2.id || ""),
              marca: String(ram2.id_marca?.id || ram2.id_marca || ""),
              tipo_tecnologia: ram2.tipo_tecnologia || "",
              formato: ram2.formato || "",
              capacidad: ram2.capacidad || "",
              frecuencia: ram2.frecuencia || "",
            })
            setMemoriaRam2Id("")
          } else {
            setRam2Mode("existing")
            setMemoriaRam2Id(String(ram2.id))
          }
        } else {
          setRam2Mode("existing")
          setMemoriaRam2Id("")
        }

        if (ram3) {
          if (ram3.particular === false) {
            setRam3Mode("manual")
            setMRam3({
              id: String(ram3.id || ""),
              marca: String(ram3.id_marca?.id || ram3.id_marca || ""),
              tipo_tecnologia: ram3.tipo_tecnologia || "",
              formato: ram3.formato || "",
              capacidad: ram3.capacidad || "",
              frecuencia: ram3.frecuencia || "",
            })
            setMemoriaRam3Id("")
          } else {
            setRam3Mode("existing")
            setMemoriaRam3Id(String(ram3.id))
          }
        } else {
          setRam3Mode("existing")
          setMemoriaRam3Id("")
        }

        if (ram4) {
          if (ram4.particular === false) {
            setRam4Mode("manual")
            setMRam4({
              id: String(ram4.id || ""),
              marca: String(ram4.id_marca?.id || ram4.id_marca || ""),
              tipo_tecnologia: ram4.tipo_tecnologia || "",
              formato: ram4.formato || "",
              capacidad: ram4.capacidad || "",
              frecuencia: ram4.frecuencia || "",
            })
            setMemoriaRam4Id("")
          } else {
            setRam4Mode("existing")
            setMemoriaRam4Id(String(ram4.id))
          }
        } else {
          setRam4Mode("existing")
          setMemoriaRam4Id("")
        }

        if (ram4) setRamSlots("4")
        else if (ram3) setRamSlots("3")
        else if (ram2) setRamSlots("2")
        else setRamSlots("1")

        // Map storage disk slots, ids and serial numbers
        const disk1 = equipmentToEdit.disco_alma_1
        const disk2 = equipmentToEdit.disco_alma_2
        const disk3 = equipmentToEdit.disco_alma_3

        if (disk1) {
          if (disk1.particular === false) {
            setDisco1Mode("manual")
            setMDisco1({
              id: String(disk1.id || ""),
              marca: String(disk1.id_marca?.id || disk1.id_marca || ""),
              tipo_disco: disk1.tipo_disco || "",
              modelo: disk1.modelo || "",
              capacidad: disk1.capacidad || "",
            })
            setDiscoAlma1Id("")
          } else {
            setDisco1Mode("existing")
            setDiscoAlma1Id(String(disk1.id))
          }
        } else {
          setDisco1Mode("existing")
          setDiscoAlma1Id("")
        }

        if (disk2) {
          if (disk2.particular === false) {
            setDisco2Mode("manual")
            setMDisco2({
              id: String(disk2.id || ""),
              marca: String(disk2.id_marca?.id || disk2.id_marca || ""),
              tipo_disco: disk2.tipo_disco || "",
              modelo: disk2.modelo || "",
              capacidad: disk2.capacidad || "",
            })
            setDiscoAlma2Id("")
          } else {
            setDisco2Mode("existing")
            setDiscoAlma2Id(String(disk2.id))
          }
        } else {
          setDisco2Mode("existing")
          setDiscoAlma2Id("")
        }

        if (disk3) {
          if (disk3.particular === false) {
            setDisco3Mode("manual")
            setMDisco3({
              id: String(disk3.id || ""),
              marca: String(disk3.id_marca?.id || disk3.id_marca || ""),
              tipo_disco: disk3.tipo_disco || "",
              modelo: disk3.modelo || "",
              capacidad: disk3.capacidad || "",
            })
            setDiscoAlma3Id("")
          } else {
            setDisco3Mode("existing")
            setDiscoAlma3Id(String(disk3.id))
          }
        } else {
          setDisco3Mode("existing")
          setDiscoAlma3Id("")
        }

        setNSerieDiscAlma1(equipmentToEdit.n_serie_disc_alma_1 || "")
        setNSerieDiscAlma2(equipmentToEdit.n_serie_disc_alma_2 || "")
        setNSerieDiscAlma3(equipmentToEdit.n_serie_disc_alma_3 || "")

        if (disk3) setDiskSlots("3")
        else if (disk2) setDiskSlots("2")
        else setDiskSlots("1")

        setActiveTab("general")
      } else {
        setTipoDeEquipoId("")
        setMarcaId("")
        setModeloId("")
        setEstado("RECIBIDO")
        setVencimientoGarantia("")
        setClienteId("")
        setUsuario("")
        setNombreEquipo("")
        setNSerieCargadorNote("")
        setNSerieBios("")
        setMacEthernet1("")
        setMacEthernet2("")
        setMacWifi("")
        setKeyWinId("")
        setKeyOfficeId("")
        setDvd(false)
        setCamara(false)
        setIdTeamviewer("")

        setProveedorId("")
        setFactura("")
        setFechaCompra("")

        setProcesadorId("")
        setTarjetaGraficaMode("existing")
        setTarjetaGraficaId("")
        setMTarjetaGrafica({ id: "", marca: "", modelo: "", vram: "" })
        setFuenteId("")
        setPlacaId("")

        setRamSlots("1")
        setMemoriaRam1Id("")
        setMemoriaRam2Id("")
        setMemoriaRam3Id("")
        setMemoriaRam4Id("")

        setDiskSlots("1")
        setDiscoAlma1Id("")
        setDiscoAlma2Id("")
        setDiscoAlma3Id("")

        setNSerieDiscAlma1("")
        setNSerieDiscAlma2("")
        setNSerieDiscAlma3("")

        setActiveTab("general")
      }
    }
  }, [equipmentToEdit, open])

  // Filter models based on the selected brand
  const filteredModels = dbModels.filter(
    (m) => String(m.brandId) === String(marcaId)
  )

  // Filter licenses based on active status, but keep currently selected license as option
  const winLicensesOptions = [...dbWinLicenses]
  if (equipmentToEdit?.key_win && !winLicensesOptions.some((lic) => lic.id === equipmentToEdit.key_win.id)) {
    winLicensesOptions.push(equipmentToEdit.key_win)
  }
  const filteredWinLicenses = winLicensesOptions.filter((lic) => lic.activa || String(lic.id) === String(keyWinId))

  const officeLicensesOptions = [...dbOfficeLicenses]
  if (equipmentToEdit?.key_office && !officeLicensesOptions.some((lic) => lic.id === equipmentToEdit.key_office.id)) {
    officeLicensesOptions.push(equipmentToEdit.key_office)
  }
  const filteredOfficeLicenses = officeLicensesOptions.filter((lic) => lic.activa || String(lic.id) === String(keyOfficeId))

  // Filter hardware components: only show those that have activa === true OR are currently selected in the equipment
  const filteredCpus = cpus.filter((c) => (c.activa && c.uso > 0) || String(c.id) === String(procesadorId))
  const filteredPlates = plates.filter((pl) => (pl.activa && pl.uso > 0) || String(pl.id) === String(placaId))
  const filteredGpus = gpus.filter((g) => (g.activa && g.uso > 0) || String(g.id) === String(tarjetaGraficaId))
  const filteredPowers = powers.filter((p) => (p.activa && p.uso > 0) || String(p.id) === String(fuenteId))

  const getAvailableRamsForSlot = (slotNum: number) => {
    const selectedInOtherSlots = [
      slotNum !== 1 ? memoriaRam1Id : "",
      slotNum !== 2 ? memoriaRam2Id : "",
      slotNum !== 3 ? memoriaRam3Id : "",
      slotNum !== 4 ? memoriaRam4Id : "",
    ].filter(Boolean).filter(id => id !== "_null" && id !== "");

    return rams.filter((r) => {
      const rIdStr = String(r.id);
      const selectedCountInOtherSlots = selectedInOtherSlots.filter(id => id === rIdStr).length;

      let dbUsageCount = 0;
      if (equipmentToEdit) {
        if (equipmentToEdit.memoria_ram_1?.id && String(equipmentToEdit.memoria_ram_1.id) === rIdStr) dbUsageCount++;
        if (equipmentToEdit.memoria_ram_2?.id && String(equipmentToEdit.memoria_ram_2.id) === rIdStr) dbUsageCount++;
        if (equipmentToEdit.memoria_ram_3?.id && String(equipmentToEdit.memoria_ram_3.id) === rIdStr) dbUsageCount++;
        if (equipmentToEdit.memoria_ram_4?.id && String(equipmentToEdit.memoria_ram_4.id) === rIdStr) dbUsageCount++;
      }

      const availableStock = r.uso + dbUsageCount - selectedCountInOtherSlots;

      const isSelectedInThisSlot =
        (slotNum === 1 && memoriaRam1Id === rIdStr) ||
        (slotNum === 2 && memoriaRam2Id === rIdStr) ||
        (slotNum === 3 && memoriaRam3Id === rIdStr) ||
        (slotNum === 4 && memoriaRam4Id === rIdStr);

      return isSelectedInThisSlot || availableStock > 0;
    });
  };

  const getCalculatedRamStockForSlot = (ram: any, slotNum: number) => {
    const rIdStr = String(ram.id);
    const selectedInOtherSlots = [
      slotNum !== 1 ? memoriaRam1Id : "",
      slotNum !== 2 ? memoriaRam2Id : "",
      slotNum !== 3 ? memoriaRam3Id : "",
      slotNum !== 4 ? memoriaRam4Id : "",
    ].filter(Boolean).filter(id => id !== "_null" && id !== "");

    const selectedCountInOtherSlots = selectedInOtherSlots.filter(id => id === rIdStr).length;

    let dbUsageCount = 0;
    if (equipmentToEdit) {
      if (equipmentToEdit.memoria_ram_1?.id && String(equipmentToEdit.memoria_ram_1.id) === rIdStr) dbUsageCount++;
      if (equipmentToEdit.memoria_ram_2?.id && String(equipmentToEdit.memoria_ram_2.id) === rIdStr) dbUsageCount++;
      if (equipmentToEdit.memoria_ram_3?.id && String(equipmentToEdit.memoria_ram_3.id) === rIdStr) dbUsageCount++;
      if (equipmentToEdit.memoria_ram_4?.id && String(equipmentToEdit.memoria_ram_4.id) === rIdStr) dbUsageCount++;
    }

    return ram.uso + dbUsageCount - selectedCountInOtherSlots;
  };

  const getAvailableDisksForSlot = (slotNum: number) => {
    const selectedInOtherSlots = [
      slotNum !== 1 ? discoAlma1Id : "",
      slotNum !== 2 ? discoAlma2Id : "",
      slotNum !== 3 ? discoAlma3Id : "",
    ].filter(Boolean).filter(id => id !== "_null" && id !== "");

    return disks.filter((d) => {
      const dIdStr = String(d.id);
      const selectedCountInOtherSlots = selectedInOtherSlots.filter(id => id === dIdStr).length;

      let dbUsageCount = 0;
      if (equipmentToEdit) {
        if (equipmentToEdit.disco_alma_1?.id && String(equipmentToEdit.disco_alma_1.id) === dIdStr) dbUsageCount++;
        if (equipmentToEdit.disco_alma_2?.id && String(equipmentToEdit.disco_alma_2.id) === dIdStr) dbUsageCount++;
        if (equipmentToEdit.disco_alma_3?.id && String(equipmentToEdit.disco_alma_3.id) === dIdStr) dbUsageCount++;
      }

      const availableStock = d.uso + dbUsageCount - selectedCountInOtherSlots;

      const isSelectedInThisSlot =
        (slotNum === 1 && discoAlma1Id === dIdStr) ||
        (slotNum === 2 && discoAlma2Id === dIdStr) ||
        (slotNum === 3 && discoAlma3Id === dIdStr);

      return isSelectedInThisSlot || availableStock > 0;
    });
  };

  const getCalculatedDiskStockForSlot = (disk: any, slotNum: number) => {
    const dIdStr = String(disk.id);
    const selectedInOtherSlots = [
      slotNum !== 1 ? discoAlma1Id : "",
      slotNum !== 2 ? discoAlma2Id : "",
      slotNum !== 3 ? discoAlma3Id : "",
    ].filter(Boolean).filter(id => id !== "_null" && id !== "");

    const selectedCountInOtherSlots = selectedInOtherSlots.filter(id => id === dIdStr).length;

    let dbUsageCount = 0;
    if (equipmentToEdit) {
      if (equipmentToEdit.disco_alma_1?.id && String(equipmentToEdit.disco_alma_1.id) === dIdStr) dbUsageCount++;
      if (equipmentToEdit.disco_alma_2?.id && String(equipmentToEdit.disco_alma_2.id) === dIdStr) dbUsageCount++;
      if (equipmentToEdit.disco_alma_3?.id && String(equipmentToEdit.disco_alma_3.id) === dIdStr) dbUsageCount++;
    }

    return disk.uso + dbUsageCount - selectedCountInOtherSlots;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoDeEquipoId || !marcaId || !modeloId || !estado || (vendidoFemase && !vencimientoGarantia)) return

    onSave({
      tipo_de_equipo: Number(tipoDeEquipoId),
      marca: Number(marcaId),
      modelo: Number(modeloId),
      estado,
      vendido_femase: vendidoFemase,
      vencimiento_garantia: !vendidoFemase ? null : Number(vencimientoGarantia),
      cliente: clienteId ? Number(clienteId) : null,
      usuario: usuario || "",
      nombre_equipo: nombreEquipo || "",
      n_serie_cargador_note: nSerieCargadorNote || "",
      n_serie_bios: nSerieBios || "",
      mac_ethernet_1: macEthernet1 || "",
      mac_ethernet_2: macEthernet2 || "",
      mac_wifi: macWifi || "",
      lice_clie: keyWinId === "clie",
      key_win: keyWinId && keyWinId !== "_null" && keyWinId !== "clie" ? Number(keyWinId) : null,
      lice_marca: keyOfficeId === "marca",
      key_office: keyOfficeId && keyOfficeId !== "_null" && keyOfficeId !== "marca" ? Number(keyOfficeId) : null,
      dvd,
      camara,
      id_teamviewer: idTeamviewer || "",
      proveedor: proveedorId ? Number(proveedorId) : null,
      factura: factura ? Number(factura) : null,
      fecha_compra: fechaCompra || null,

      procesador:
        procesadorMode === "manual"
          ? {
            id: mProcesador.id ? Number(mProcesador.id) : null,
            marca: mProcesador.marca || null,
            familia: mProcesador.familia || "",
            modelo: mProcesador.modelo || "",
            frecuencia: mProcesador.frecuencia || "",
            nucleos: mProcesador.nucleos ? Number(mProcesador.nucleos) : null,
            hilos: mProcesador.hilos ? Number(mProcesador.hilos) : null,
          }
          : procesadorId && procesadorId !== "_null"
            ? Number(procesadorId)
            : null,

      placa:
        placaMode === "manual"
          ? {
            id: mPlaca.id ? Number(mPlaca.id) : null,
            marca: mPlaca.marca ? Number(mPlaca.marca) : null,
            modelo: mPlaca.modelo || "",
            socket: mPlaca.socket || "",
            chipset: mPlaca.chipset || "",
          }
          : placaId && placaId !== "_null"
            ? Number(placaId)
            : null,

      tarjeta_grafica:
        tarjetaGraficaMode === "manual"
          ? {
            id: mTarjetaGrafica.id ? Number(mTarjetaGrafica.id) : null,
            marca: mTarjetaGrafica.marca ? Number(mTarjetaGrafica.marca) : null,
            modelo: mTarjetaGrafica.modelo || "",
            vram: mTarjetaGrafica.vram || "",
          }
          : tarjetaGraficaId && tarjetaGraficaId !== "_null"
            ? Number(tarjetaGraficaId)
            : null,

      fuente:
        fuenteMode === "manual"
          ? {
            id: mFuente.id ? Number(mFuente.id) : null,
            marca: mFuente.marca ? Number(mFuente.marca) : null,
            modelo: mFuente.modelo || "",
            potencia: mFuente.potencia || "",
            certificacion: mFuente.certificacion || "",
          }
          : fuenteId && fuenteId !== "_null"
            ? Number(fuenteId)
            : null,

      // RAM
      memoria_ram_1:
        Number(ramSlots) >= 1
          ? ram1Mode === "manual"
            ? {
              id: mRam1.id ? Number(mRam1.id) : null,
              marca: mRam1.marca ? Number(mRam1.marca) : null,
              tipo_tecnologia: mRam1.tipo_tecnologia || "",
              formato: mRam1.formato || "",
              capacidad: mRam1.capacidad || "",
              frecuencia: mRam1.frecuencia || "",
            }
            : memoriaRam1Id && memoriaRam1Id !== "_null"
              ? Number(memoriaRam1Id)
              : null
          : null,

      memoria_ram_2:
        Number(ramSlots) >= 2
          ? ram2Mode === "manual"
            ? {
              id: mRam2.id ? Number(mRam2.id) : null,
              marca: mRam2.marca ? Number(mRam2.marca) : null,
              tipo_tecnologia: mRam2.tipo_tecnologia || "",
              formato: mRam2.formato || "",
              capacidad: mRam2.capacidad || "",
              frecuencia: mRam2.frecuencia || "",
            }
            : memoriaRam2Id && memoriaRam2Id !== "_null"
              ? Number(memoriaRam2Id)
              : null
          : null,

      memoria_ram_3:
        Number(ramSlots) >= 3
          ? ram3Mode === "manual"
            ? {
              id: mRam3.id ? Number(mRam3.id) : null,
              marca: mRam3.marca ? Number(mRam3.marca) : null,
              tipo_tecnologia: mRam3.tipo_tecnologia || "",
              formato: mRam3.formato || "",
              capacidad: mRam3.capacidad || "",
              frecuencia: mRam3.frecuencia || "",
            }
            : memoriaRam3Id && memoriaRam3Id !== "_null"
              ? Number(memoriaRam3Id)
              : null
          : null,

      memoria_ram_4:
        Number(ramSlots) >= 4
          ? ram4Mode === "manual"
            ? {
              id: mRam4.id ? Number(mRam4.id) : null,
              marca: mRam4.marca ? Number(mRam4.marca) : null,
              tipo_tecnologia: mRam4.tipo_tecnologia || "",
              formato: mRam4.formato || "",
              capacidad: mRam4.capacidad || "",
              frecuencia: mRam4.frecuencia || "",
            }
            : memoriaRam4Id && memoriaRam4Id !== "_null"
              ? Number(memoriaRam4Id)
              : null
          : null,

      // Storage Disks
      disco_alma_1:
        Number(diskSlots) >= 1
          ? disco1Mode === "manual"
            ? {
              id: mDisco1.id ? Number(mDisco1.id) : null,
              marca: mDisco1.marca ? Number(mDisco1.marca) : null,
              tipo_disco: mDisco1.tipo_disco || "",
              modelo: mDisco1.modelo || "",
              capacidad: mDisco1.capacidad || "",
            }
            : discoAlma1Id && discoAlma1Id !== "_null"
              ? Number(discoAlma1Id)
              : null
          : null,

      disco_alma_2:
        Number(diskSlots) >= 2
          ? disco2Mode === "manual"
            ? {
              id: mDisco2.id ? Number(mDisco2.id) : null,
              marca: mDisco2.marca ? Number(mDisco2.marca) : null,
              tipo_disco: mDisco2.tipo_disco || "",
              modelo: mDisco2.modelo || "",
              capacidad: mDisco2.capacidad || "",
            }
            : discoAlma2Id && discoAlma2Id !== "_null"
              ? Number(discoAlma2Id)
              : null
          : null,

      disco_alma_3:
        Number(diskSlots) >= 3
          ? disco3Mode === "manual"
            ? {
              id: mDisco3.id ? Number(mDisco3.id) : null,
              marca: mDisco3.marca ? Number(mDisco3.marca) : null,
              tipo_disco: mDisco3.tipo_disco || "",
              modelo: mDisco3.modelo || "",
              capacidad: mDisco3.capacidad || "",
            }
            : discoAlma3Id && discoAlma3Id !== "_null"
              ? Number(discoAlma3Id)
              : null
          : null,

      // Disk Serial numbers
      n_serie_disc_alma_1: Number(diskSlots) >= 1 ? nSerieDiscAlma1 || "" : null,
      n_serie_disc_alma_2: Number(diskSlots) >= 2 ? nSerieDiscAlma2 || "" : null,
      n_serie_disc_alma_3: Number(diskSlots) >= 3 ? nSerieDiscAlma3 || "" : null,
    })
    onOpenChange(false)
  }

  const isFormValid = () => {
    const basicValid = !!tipoDeEquipoId && !!marcaId && !!modeloId && !!estado && (!vendidoFemase || !!vencimientoGarantia)
    
    const hasMac = !!macEthernet1?.trim() || !!macEthernet2?.trim() || !!macWifi?.trim()
    const hasBios = !!nSerieBios?.trim()
    
    const hasRam = (ram1Mode === "existing" && !!memoriaRam1Id && memoriaRam1Id !== "_null") || 
                   (ram1Mode === "manual" && !!mRam1.marca && !!mRam1.capacidad)
                  
    const hasDisk = (disco1Mode === "existing" && !!discoAlma1Id && discoAlma1Id !== "_null") || 
                    (disco1Mode === "manual" && !!mDisco1.marca && !!mDisco1.capacidad)

    const isValidBase = basicValid && hasMac && hasBios && hasRam && hasDisk

    if (equipmentToEdit && estado === "LISTO") {
      const hasWin = !!keyWinId && keyWinId !== "_null"
      const hasOffice = !!keyOfficeId && keyOfficeId !== "_null"
      return isValidBase && hasWin && hasOffice && !!idTeamviewer?.trim()
    }

    return isValidBase
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] max-h-[92vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>{equipmentToEdit ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
            <DialogDescription>
              {equipmentToEdit ? "Modifica la ficha técnica y los componentes del equipo." : "Registra un nuevo equipo en el inventario."}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50 p-1 rounded-lg">
              <TabsTrigger value="general" className="flex items-center justify-center gap-2 py-2">
                <Info className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="hardware" className="flex items-center justify-center gap-2 py-2">
                <Cpu className="h-4 w-4" />
                <span>Hardware</span>
              </TabsTrigger>
              <TabsTrigger value="detalles" className="flex items-center justify-center gap-2 py-2">
                <Key className="h-4 w-4" />
                <span>Detalles</span>
              </TabsTrigger>
              <TabsTrigger value="facturacion" className="flex items-center justify-center gap-2 py-2">
                <Receipt className="h-4 w-4" />
                <span>Facturación</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: INFORMACION GENERAL */}
            <TabsContent value="general" className="space-y-4 pt-4 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eq-type">Tipo de Equipo *</Label>
                  <AsyncCombobox value={tipoDeEquipoId} onValueChange={setTipoDeEquipoId} fetcher={fetchTipos} placeholder="Selecciona tipo de equipo" preloadItems={dbTypes} filterItem={t => t.computador || String(t.id) === tipoDeEquipoId} />
                </div>

                {equipmentToEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="eq-status">Estado *</Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger id="eq-status" className="bg-secondary/50 border-0">
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="eq-brand">Marca *</Label>
                  <AsyncCombobox value={marcaId} onValueChange={(val) => { setMarcaId(val); setModeloId(""); }} fetcher={fetchMarcas} placeholder="Selecciona marca" preloadItems={dbBrands} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-model">Modelo *</Label>
                  <AsyncCombobox value={modeloId} onValueChange={setModeloId} disabled={!marcaId} fetcher={fetchModelos} labelKey="nombre" placeholder={marcaId ? "Selecciona modelo" : "Selecciona marca primero"} preloadItems={dbModels} />
                </div>



                <div className="space-y-2">
                  <Label htmlFor="eq-user">Tipo de usuario</Label>
                  <Input
                    id="eq-user"
                    placeholder="Ej: ADMINISTRACION, SOPORTE..."
                    className="bg-secondary/50 border-0"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-name">Nombre de Equipo</Label>
                  <Input
                    id="eq-name"
                    placeholder="Ej: PC-FMC-910"
                    className="bg-secondary/50 border-0"
                    value={nombreEquipo}
                    onChange={(e) => setNombreEquipo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-warranty">Garantía (Meses) {vendidoFemase ? "*" : ""}</Label>
                  <Select value={vencimientoGarantia} onValueChange={setVencimientoGarantia} disabled={!vendidoFemase}>
                    <SelectTrigger id="eq-warranty" className="bg-secondary/50 border-0">
                      <SelectValue placeholder={!vendidoFemase ? "N/A" : "Selecciona"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 meses</SelectItem>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="18">18 meses</SelectItem>
                    </SelectContent>
                  </Select>
                  {vendidoFemase && equipmentToEdit?.vencimiento_garantia_fecha && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vence el: {new Date(equipmentToEdit.vencimiento_garantia_fecha).toLocaleDateString("es-CL", { timeZone: "UTC" })}
                    </p>
                  )}
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 h-10 px-3 bg-secondary/20 rounded-md border border-border">
                    <Switch id="eq-vendido" checked={vendidoFemase} onCheckedChange={setVendidoFemase} />
                    <Label htmlFor="eq-vendido" className="font-semibold cursor-pointer">Vendido por Femase</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: COMPONENTES DE HARDWARE */}
            <TabsContent value="hardware" className="space-y-6 pt-4 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Procesador */}
                <div className="space-y-2 col-span-1 md:col-span-2 bg-secondary/5 p-4 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="eq-cpu" className="font-semibold text-sm">Procesador (CPU)</Label>
                    <div className="flex bg-secondary/60 p-0.5 rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setProcesadorMode("existing")}
                        className={`px-2 py-1 rounded-md transition-all ${procesadorMode === "existing"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setProcesadorMode("manual")}
                        className={`px-2 py-1 rounded-md transition-all ${procesadorMode === "manual"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Ingreso Manual
                      </button>
                    </div>
                  </div>

                  {procesadorMode === "existing" ? (
                    <AsyncCombobox value={procesadorId} onValueChange={setProcesadorId} fetcher={fetchCpu} placeholder="Selecciona un procesador" preloadItems={filteredCpus} renderItem={(c) => (<div className="flex flex-col"><span>{c.marca?.nombre || c.marca} {c.familia} {c.modelo}</span><span className="text-xs text-muted-foreground">{c.nucleos} Cores / {c.hilos} Threads - {c.frecuencia} - Stock: {c.uso}</span></div>)} renderValue={(c) => `${c.marca?.nombre || c.marca} ${c.familia} ${c.modelo}`} />
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-3 bg-secondary/10 p-3 rounded-md border border-border/30">
                      <div className="space-y-1">
                        <Label className="text-xs">Marca *</Label>
                        <Select
                          value={mProcesador.marca}
                          onValueChange={(val) => setMProcesador({ ...mProcesador, marca: val, familia: "", modelo: "", nucleos: "", hilos: "", frecuencia: "" })}
                        >
                          <SelectTrigger className="bg-secondary/50 border-0 h-8 text-xs">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INTEL">INTEL</SelectItem>
                            <SelectItem value="AMD">AMD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Familia</Label>
                        <Select
                          value={mProcesador.familia}
                          onValueChange={(val) => setMProcesador({ ...mProcesador, familia: val, modelo: "", nucleos: "", hilos: "", frecuencia: "" })}
                          disabled={!mProcesador.marca}
                        >
                          <SelectTrigger className="bg-secondary/50 border-0 h-8 text-xs">
                            <SelectValue placeholder="Familia" />
                          </SelectTrigger>
                          <SelectContent>
                            {mProcesador.marca && CPU_SPECS[mProcesador.marca] && Object.keys(CPU_SPECS[mProcesador.marca]).map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                            {mProcesador.familia && mProcesador.marca && (!CPU_SPECS[mProcesador.marca] || !CPU_SPECS[mProcesador.marca][mProcesador.familia]) && (
                              <SelectItem value={mProcesador.familia}>{mProcesador.familia}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Modelo</Label>
                        <Select
                          value={mProcesador.modelo}
                          onValueChange={(val) => {
                            const specs = mProcesador.marca && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia]?.[val];
                            if (specs) {
                              setMProcesador({ ...mProcesador, modelo: val, nucleos: specs.nucleos, hilos: specs.hilos, frecuencia: specs.frecuencia });
                            } else {
                              setMProcesador({ ...mProcesador, modelo: val });
                            }
                          }}
                          disabled={!mProcesador.familia}
                        >
                          <SelectTrigger className="bg-secondary/50 border-0 h-8 text-xs">
                            <SelectValue placeholder="Modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            {mProcesador.marca && mProcesador.familia && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia] && Object.keys(CPU_SPECS[mProcesador.marca][mProcesador.familia]).map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                            {mProcesador.modelo && mProcesador.familia && (!CPU_SPECS[mProcesador.marca]?.[mProcesador.familia] || !CPU_SPECS[mProcesador.marca][mProcesador.familia][mProcesador.modelo]) && (
                              <SelectItem value={mProcesador.modelo}>{mProcesador.modelo}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Frecuencia</Label>
                        <Input
                          placeholder="Ej: 3.4 GHz..."
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mProcesador.frecuencia}
                          onChange={(e) => setMProcesador({ ...mProcesador, frecuencia: e.target.value })}
                          readOnly={!!(mProcesador.marca && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia]?.[mProcesador.modelo])}
                          disabled={!!(mProcesador.marca && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia]?.[mProcesador.modelo]) || !mProcesador.modelo}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Núcleos</Label>
                        <Input
                          type="number"
                          placeholder="Ej: 8"
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mProcesador.nucleos}
                          onChange={(e) => setMProcesador({ ...mProcesador, nucleos: e.target.value })}
                          readOnly={!!(mProcesador.marca && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia]?.[mProcesador.modelo])}
                          disabled={!!(mProcesador.marca && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia]?.[mProcesador.modelo]) || !mProcesador.modelo}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Hilos</Label>
                        <Input
                          type="number"
                          placeholder="Ej: 16"
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mProcesador.hilos}
                          onChange={(e) => setMProcesador({ ...mProcesador, hilos: e.target.value })}
                          readOnly={!!(mProcesador.marca && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia]?.[mProcesador.modelo])}
                          disabled={!!(mProcesador.marca && CPU_SPECS[mProcesador.marca]?.[mProcesador.familia]?.[mProcesador.modelo]) || !mProcesador.modelo}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Placa Madre */}
                <div className="space-y-2 col-span-1 md:col-span-2 bg-secondary/5 p-4 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="eq-plate" className="font-semibold text-sm">Placa Madre</Label>
                    <div className="flex bg-secondary/60 p-0.5 rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setPlacaMode("existing")}
                        className={`px-2 py-1 rounded-md transition-all ${placaMode === "existing"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlacaMode("manual")}
                        className={`px-2 py-1 rounded-md transition-all ${placaMode === "manual"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Ingreso Manual
                      </button>
                    </div>
                  </div>

                  {placaMode === "existing" ? (
                    <AsyncCombobox value={placaId} onValueChange={setPlacaId} fetcher={fetchPlaca} placeholder="Selecciona una placa madre" preloadItems={filteredPlates} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">Socket: {p.socket} - Chipset: {p.chipset} - Stock: {p.uso}</span></div>)} renderValue={(p) => `${p.marca?.nombre || p.marca} ${p.modelo}`} />
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-3 bg-secondary/10 p-3 rounded-md border border-border/30">
                      <div className="space-y-1">
                        <Label className="text-xs">Marca *</Label>
                        <AsyncCombobox value={mPlaca.marca} onValueChange={(val) => setMPlaca({ ...mPlaca, marca: val })} fetcher={fetchMarcas} placeholder="Seleccionar" preloadItems={dbBrands} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Modelo</Label>
                        <Input
                          placeholder="Ej: B550M, H610M..."
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mPlaca.modelo}
                          onChange={(e) => setMPlaca({ ...mPlaca, modelo: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Socket</Label>
                        <Input
                          placeholder="Ej: AM4, LGA1700..."
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mPlaca.socket}
                          onChange={(e) => setMPlaca({ ...mPlaca, socket: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Chipset</Label>
                        <Input
                          placeholder="Ej: AMD B550, Intel H610..."
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mPlaca.chipset}
                          onChange={(e) => setMPlaca({ ...mPlaca, chipset: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tarjeta Gráfica */}
                <div className="space-y-2 bg-secondary/5 p-4 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="eq-gpu" className="font-semibold text-sm">Tarjeta Gráfica (GPU)</Label>
                    <div className="flex bg-secondary/60 p-0.5 rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setTarjetaGraficaMode("existing")}
                        className={`px-2 py-1 rounded-md transition-all ${tarjetaGraficaMode === "existing"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setTarjetaGraficaMode("manual")}
                        className={`px-2 py-1 rounded-md transition-all ${tarjetaGraficaMode === "manual"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Ingreso Manual
                      </button>
                    </div>
                  </div>

                  {tarjetaGraficaMode === "existing" ? (
                    <AsyncCombobox value={tarjetaGraficaId} onValueChange={setTarjetaGraficaId} fetcher={fetchGpu} placeholder="Selecciona una tarjeta gráfica" preloadItems={[{id: "_null", marca: "Sin Tarjeta Gráfica", modelo: ""}, ...filteredGpus]} renderItem={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : (<div className="flex flex-col"><span>{g.marca?.nombre || g.marca} {g.modelo}</span><span className="text-xs text-muted-foreground">VRAM: {g.vram} - Stock: {g.uso}</span></div>)} renderValue={(g) => g.id === "_null" ? "Sin Tarjeta Gráfica" : `${g.marca?.nombre || g.marca} ${g.modelo}`} />
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-3 bg-secondary/10 p-3 rounded-md border border-border/30">
                      <div className="space-y-1">
                        <Label className="text-xs">Marca *</Label>
                        <AsyncCombobox value={mTarjetaGrafica.marca} onValueChange={(val) => setMTarjetaGrafica({ ...mTarjetaGrafica, marca: val })} fetcher={fetchMarcas} placeholder="Seleccionar" preloadItems={dbBrands} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Modelo</Label>
                        <Input
                          placeholder="Ej: RTX 4060, RX 7600..."
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mTarjetaGrafica.modelo}
                          onChange={(e) => setMTarjetaGrafica({ ...mTarjetaGrafica, modelo: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">VRAM</Label>
                        <Input
                          placeholder="Ej: 8 GB, 12 GB..."
                          className="bg-secondary/50 border-0 h-8 text-xs"
                          value={mTarjetaGrafica.vram}
                          onChange={(e) => setMTarjetaGrafica({ ...mTarjetaGrafica, vram: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Fuente de Poder */}
                <div className="space-y-2 bg-secondary/5 p-4 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="eq-power" className="font-semibold text-sm">Fuente de Poder</Label>
                    <div className="flex bg-secondary/60 p-0.5 rounded-md text-xs">
                      <button
                        type="button"
                        onClick={() => setFuenteMode("existing")}
                        className={`px-2 py-1 rounded-md transition-all ${fuenteMode === "existing"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setFuenteMode("manual")}
                        className={`px-2 py-1 rounded-md transition-all ${fuenteMode === "manual"
                            ? "bg-background text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Ingreso Manual
                      </button>
                    </div>
                  </div>

                  {fuenteMode === "existing" ? (
                    <AsyncCombobox value={fuenteId} onValueChange={setFuenteId} fetcher={fetchFuente} placeholder="Selecciona una fuente de poder" preloadItems={filteredPowers} renderItem={(p) => (<div className="flex flex-col"><span>{p.marca?.nombre || p.marca} {p.modelo}</span><span className="text-xs text-muted-foreground">{p.potencia} - {p.certificacion} - Stock: {p.uso}</span></div>)} renderValue={(p) => `${p.marca?.nombre || p.marca} ${p.modelo}`} />
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2 bg-secondary/10 p-2 rounded border border-border/30 text-xs">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Marca *</Label>
                        <AsyncCombobox value={mFuente.marca} onValueChange={(val) => setMFuente({ ...mFuente, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Modelo</Label>
                        <Input
                          placeholder="Ej: Smart 700W..."
                          className="bg-secondary/50 border-0 h-7 text-[10px]"
                          value={mFuente.modelo}
                          onChange={(e) => setMFuente({ ...mFuente, modelo: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Potencia</Label>
                        <Input
                          placeholder="Ej: 700W..."
                          className="bg-secondary/50 border-0 h-7 text-[10px]"
                          value={mFuente.potencia}
                          onChange={(e) => setMFuente({ ...mFuente, potencia: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Certificación</Label>
                        <Input
                          placeholder="Ej: 80 Plus..."
                          className="bg-secondary/50 border-0 h-7 text-[10px]"
                          value={mFuente.certificacion}
                          onChange={(e) => setMFuente({ ...mFuente, certificacion: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN DINÁMICA: MEMORIAS RAM */}
              <div className="bg-secondary/15 p-4 rounded-lg border border-border/80 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Configuración de Memoria RAM</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ram-slots-select" className="text-xs text-muted-foreground">Slots ocupados:</Label>
                    <Select value={ramSlots} onValueChange={setRamSlots}>
                      <SelectTrigger id="ram-slots-select" className="w-[80px] h-8 bg-secondary/80 border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Number(ramSlots) >= 1 && (
                    <div className="space-y-2 bg-secondary/5 p-3 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ram-1" className="text-xs font-semibold">Memoria RAM Slot 1</Label>
                        <div className="flex bg-secondary/60 p-0.5 rounded-md text-[10px]">
                          <button
                            type="button"
                            onClick={() => setRam1Mode("existing")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram1Mode === "existing" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setRam1Mode("manual")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram1Mode === "manual" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {ram1Mode === "existing" ? (
                        <AsyncCombobox value={memoriaRam1Id} onValueChange={setMemoriaRam1Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 1" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 1) > 0 || String(r.id) === memoriaRam1Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 1)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : `${r.marca?.nombre || r.marca} ${r.capacidad} ${r.frecuencia}`} />
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-2 bg-secondary/10 p-2 rounded border border-border/20">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Marca *</Label>
                            <AsyncCombobox value={mRam1.marca} onValueChange={(val) => setMRam1({ ...mRam1, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Tecnología</Label>
                            <Select
                              value={mRam1.tipo_tecnologia}
                              onValueChange={(val) => setMRam1({ ...mRam1, tipo_tecnologia: val, formato: "", capacidad: "", frecuencia: "" })}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Tecnología" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(RAM_SPECS).map((tech) => (
                                  <SelectItem key={tech} value={tech}>
                                    {RAM_SPECS[tech].label}
                                  </SelectItem>
                                ))}
                                {mRam1.tipo_tecnologia && !RAM_SPECS[mRam1.tipo_tecnologia] && (
                                  <SelectItem value={mRam1.tipo_tecnologia}>{mRam1.tipo_tecnologia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Formato</Label>
                            <Select
                              value={mRam1.formato}
                              onValueChange={(val) => setMRam1({ ...mRam1, formato: val })}
                              disabled={!mRam1.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Formato" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam1.tipo_tecnologia && RAM_SPECS[mRam1.tipo_tecnologia]?.formatos.map((fmt) => (
                                  <SelectItem key={fmt} value={fmt}>
                                    {fmt}
                                  </SelectItem>
                                ))}
                                {mRam1.formato && mRam1.tipo_tecnologia && !RAM_SPECS[mRam1.tipo_tecnologia]?.formatos.includes(mRam1.formato) && (
                                  <SelectItem value={mRam1.formato}>{mRam1.formato}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Capacidad</Label>
                            <Select
                              value={mRam1.capacidad}
                              onValueChange={(val) => setMRam1({ ...mRam1, capacidad: val })}
                              disabled={!mRam1.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Capacidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam1.tipo_tecnologia && RAM_SPECS[mRam1.tipo_tecnologia]?.capacidades.map((cap) => (
                                  <SelectItem key={cap} value={cap}>
                                    {cap}
                                  </SelectItem>
                                ))}
                                {mRam1.capacidad && mRam1.tipo_tecnologia && !RAM_SPECS[mRam1.tipo_tecnologia]?.capacidades.includes(mRam1.capacidad) && (
                                  <SelectItem value={mRam1.capacidad}>{mRam1.capacidad}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px]">Frecuencia</Label>
                            <Select
                              value={mRam1.frecuencia}
                              onValueChange={(val) => setMRam1({ ...mRam1, frecuencia: val })}
                              disabled={!mRam1.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Frecuencia" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam1.tipo_tecnologia && RAM_SPECS[mRam1.tipo_tecnologia]?.frecuencias.map((freq) => (
                                  <SelectItem key={freq} value={`${freq} MHz`}>
                                    {freq} MHz
                                  </SelectItem>
                                ))}
                                {mRam1.frecuencia && mRam1.tipo_tecnologia && !RAM_SPECS[mRam1.tipo_tecnologia]?.frecuencias.some(f => `${f} MHz` === mRam1.frecuencia) && (
                                  <SelectItem value={mRam1.frecuencia}>{mRam1.frecuencia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {Number(ramSlots) >= 2 && (
                    <div className="space-y-2 bg-secondary/5 p-3 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ram-2" className="text-xs font-semibold">Memoria RAM Slot 2</Label>
                        <div className="flex bg-secondary/60 p-0.5 rounded-md text-[10px]">
                          <button
                            type="button"
                            onClick={() => setRam2Mode("existing")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram2Mode === "existing" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setRam2Mode("manual")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram2Mode === "manual" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {ram2Mode === "existing" ? (
                        <AsyncCombobox value={memoriaRam2Id} onValueChange={setMemoriaRam2Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 2" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 2) > 0 || String(r.id) === memoriaRam2Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 2)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : `${r.marca?.nombre || r.marca} ${r.capacidad} ${r.frecuencia}`} />
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-2 bg-secondary/10 p-2 rounded border border-border/20">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Marca *</Label>
                            <AsyncCombobox value={mRam2.marca} onValueChange={(val) => setMRam2({ ...mRam2, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Tecnología</Label>
                            <Select
                              value={mRam2.tipo_tecnologia}
                              onValueChange={(val) => setMRam2({ ...mRam2, tipo_tecnologia: val, formato: "", capacidad: "", frecuencia: "" })}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Tecnología" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(RAM_SPECS).map((tech) => (
                                  <SelectItem key={tech} value={tech}>
                                    {RAM_SPECS[tech].label}
                                  </SelectItem>
                                ))}
                                {mRam2.tipo_tecnologia && !RAM_SPECS[mRam2.tipo_tecnologia] && (
                                  <SelectItem value={mRam2.tipo_tecnologia}>{mRam2.tipo_tecnologia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Formato</Label>
                            <Select
                              value={mRam2.formato}
                              onValueChange={(val) => setMRam2({ ...mRam2, formato: val })}
                              disabled={!mRam2.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Formato" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam2.tipo_tecnologia && RAM_SPECS[mRam2.tipo_tecnologia]?.formatos.map((fmt) => (
                                  <SelectItem key={fmt} value={fmt}>
                                    {fmt}
                                  </SelectItem>
                                ))}
                                {mRam2.formato && mRam2.tipo_tecnologia && !RAM_SPECS[mRam2.tipo_tecnologia]?.formatos.includes(mRam2.formato) && (
                                  <SelectItem value={mRam2.formato}>{mRam2.formato}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Capacidad</Label>
                            <Select
                              value={mRam2.capacidad}
                              onValueChange={(val) => setMRam2({ ...mRam2, capacidad: val })}
                              disabled={!mRam2.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Capacidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam2.tipo_tecnologia && RAM_SPECS[mRam2.tipo_tecnologia]?.capacidades.map((cap) => (
                                  <SelectItem key={cap} value={cap}>
                                    {cap}
                                  </SelectItem>
                                ))}
                                {mRam2.capacidad && mRam2.tipo_tecnologia && !RAM_SPECS[mRam2.tipo_tecnologia]?.capacidades.includes(mRam2.capacidad) && (
                                  <SelectItem value={mRam2.capacidad}>{mRam2.capacidad}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px]">Frecuencia</Label>
                            <Select
                              value={mRam2.frecuencia}
                              onValueChange={(val) => setMRam2({ ...mRam2, frecuencia: val })}
                              disabled={!mRam2.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Frecuencia" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam2.tipo_tecnologia && RAM_SPECS[mRam2.tipo_tecnologia]?.frecuencias.map((freq) => (
                                  <SelectItem key={freq} value={`${freq} MHz`}>
                                    {freq} MHz
                                  </SelectItem>
                                ))}
                                {mRam2.frecuencia && mRam2.tipo_tecnologia && !RAM_SPECS[mRam2.tipo_tecnologia]?.frecuencias.some(f => `${f} MHz` === mRam2.frecuencia) && (
                                  <SelectItem value={mRam2.frecuencia}>{mRam2.frecuencia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {Number(ramSlots) >= 3 && (
                    <div className="space-y-2 bg-secondary/5 p-3 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ram-3" className="text-xs font-semibold">Memoria RAM Slot 3</Label>
                        <div className="flex bg-secondary/60 p-0.5 rounded-md text-[10px]">
                          <button
                            type="button"
                            onClick={() => setRam3Mode("existing")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram3Mode === "existing" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setRam3Mode("manual")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram3Mode === "manual" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {ram3Mode === "existing" ? (
                        <AsyncCombobox value={memoriaRam3Id} onValueChange={setMemoriaRam3Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 3" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 3) > 0 || String(r.id) === memoriaRam3Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 3)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : `${r.marca?.nombre || r.marca} ${r.capacidad} ${r.frecuencia}`} />
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-2 bg-secondary/10 p-2 rounded border border-border/20">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Marca *</Label>
                            <AsyncCombobox value={mRam3.marca} onValueChange={(val) => setMRam3({ ...mRam3, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Tecnología</Label>
                            <Select
                              value={mRam3.tipo_tecnologia}
                              onValueChange={(val) => setMRam3({ ...mRam3, tipo_tecnologia: val, formato: "", capacidad: "", frecuencia: "" })}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Tecnología" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(RAM_SPECS).map((tech) => (
                                  <SelectItem key={tech} value={tech}>
                                    {RAM_SPECS[tech].label}
                                  </SelectItem>
                                ))}
                                {mRam3.tipo_tecnologia && !RAM_SPECS[mRam3.tipo_tecnologia] && (
                                  <SelectItem value={mRam3.tipo_tecnologia}>{mRam3.tipo_tecnologia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Formato</Label>
                            <Select
                              value={mRam3.formato}
                              onValueChange={(val) => setMRam3({ ...mRam3, formato: val })}
                              disabled={!mRam3.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Formato" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam3.tipo_tecnologia && RAM_SPECS[mRam3.tipo_tecnologia]?.formatos.map((fmt) => (
                                  <SelectItem key={fmt} value={fmt}>
                                    {fmt}
                                  </SelectItem>
                                ))}
                                {mRam3.formato && mRam3.tipo_tecnologia && !RAM_SPECS[mRam3.tipo_tecnologia]?.formatos.includes(mRam3.formato) && (
                                  <SelectItem value={mRam3.formato}>{mRam3.formato}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Capacidad</Label>
                            <Select
                              value={mRam3.capacidad}
                              onValueChange={(val) => setMRam3({ ...mRam3, capacidad: val })}
                              disabled={!mRam3.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Capacidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam3.tipo_tecnologia && RAM_SPECS[mRam3.tipo_tecnologia]?.capacidades.map((cap) => (
                                  <SelectItem key={cap} value={cap}>
                                    {cap}
                                  </SelectItem>
                                ))}
                                {mRam3.capacidad && mRam3.tipo_tecnologia && !RAM_SPECS[mRam3.tipo_tecnologia]?.capacidades.includes(mRam3.capacidad) && (
                                  <SelectItem value={mRam3.capacidad}>{mRam3.capacidad}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px]">Frecuencia</Label>
                            <Select
                              value={mRam3.frecuencia}
                              onValueChange={(val) => setMRam3({ ...mRam3, frecuencia: val })}
                              disabled={!mRam3.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Frecuencia" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam3.tipo_tecnologia && RAM_SPECS[mRam3.tipo_tecnologia]?.frecuencias.map((freq) => (
                                  <SelectItem key={freq} value={`${freq} MHz`}>
                                    {freq} MHz
                                  </SelectItem>
                                ))}
                                {mRam3.frecuencia && mRam3.tipo_tecnologia && !RAM_SPECS[mRam3.tipo_tecnologia]?.frecuencias.some(f => `${f} MHz` === mRam3.frecuencia) && (
                                  <SelectItem value={mRam3.frecuencia}>{mRam3.frecuencia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {Number(ramSlots) >= 4 && (
                    <div className="space-y-2 bg-secondary/5 p-3 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ram-4" className="text-xs font-semibold">Memoria RAM Slot 4</Label>
                        <div className="flex bg-secondary/60 p-0.5 rounded-md text-[10px]">
                          <button
                            type="button"
                            onClick={() => setRam4Mode("existing")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram4Mode === "existing" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setRam4Mode("manual")}
                            className={`px-1.5 py-0.5 rounded transition-all ${ram4Mode === "manual" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {ram4Mode === "existing" ? (
                        <AsyncCombobox value={memoriaRam4Id} onValueChange={setMemoriaRam4Id} fetcher={fetchRam} placeholder="Selecciona RAM para slot 4" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...rams]} filterItem={(r) => r.id === "_null" || getCalculatedRamStockForSlot(r, 4) > 0 || String(r.id) === memoriaRam4Id} renderItem={(r) => r.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{r.marca?.nombre || r.marca} {r.tipo_tecnologia} {r.capacidad} {r.frecuencia}</span><span className="text-xs text-muted-foreground">{r.formato} - Stock disp: {getCalculatedRamStockForSlot(r, 4)}</span></div>)} renderValue={(r) => r.id === "_null" ? "Ninguno" : `${r.marca?.nombre || r.marca} ${r.capacidad} ${r.frecuencia}`} />
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-2 bg-secondary/10 p-2 rounded border border-border/20">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Marca *</Label>
                            <AsyncCombobox value={mRam4.marca} onValueChange={(val) => setMRam4({ ...mRam4, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Tecnología</Label>
                            <Select
                              value={mRam4.tipo_tecnologia}
                              onValueChange={(val) => setMRam4({ ...mRam4, tipo_tecnologia: val, formato: "", capacidad: "", frecuencia: "" })}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Tecnología" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(RAM_SPECS).map((tech) => (
                                  <SelectItem key={tech} value={tech}>
                                    {RAM_SPECS[tech].label}
                                  </SelectItem>
                                ))}
                                {mRam4.tipo_tecnologia && !RAM_SPECS[mRam4.tipo_tecnologia] && (
                                  <SelectItem value={mRam4.tipo_tecnologia}>{mRam4.tipo_tecnologia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Formato</Label>
                            <Select
                              value={mRam4.formato}
                              onValueChange={(val) => setMRam4({ ...mRam4, formato: val })}
                              disabled={!mRam4.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Formato" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam4.tipo_tecnologia && RAM_SPECS[mRam4.tipo_tecnologia]?.formatos.map((fmt) => (
                                  <SelectItem key={fmt} value={fmt}>
                                    {fmt}
                                  </SelectItem>
                                ))}
                                {mRam4.formato && mRam4.tipo_tecnologia && !RAM_SPECS[mRam4.tipo_tecnologia]?.formatos.includes(mRam4.formato) && (
                                  <SelectItem value={mRam4.formato}>{mRam4.formato}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Capacidad</Label>
                            <Select
                              value={mRam4.capacidad}
                              onValueChange={(val) => setMRam4({ ...mRam4, capacidad: val })}
                              disabled={!mRam4.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Capacidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam4.tipo_tecnologia && RAM_SPECS[mRam4.tipo_tecnologia]?.capacidades.map((cap) => (
                                  <SelectItem key={cap} value={cap}>
                                    {cap}
                                  </SelectItem>
                                ))}
                                {mRam4.capacidad && mRam4.tipo_tecnologia && !RAM_SPECS[mRam4.tipo_tecnologia]?.capacidades.includes(mRam4.capacidad) && (
                                  <SelectItem value={mRam4.capacidad}>{mRam4.capacidad}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px]">Frecuencia</Label>
                            <Select
                              value={mRam4.frecuencia}
                              onValueChange={(val) => setMRam4({ ...mRam4, frecuencia: val })}
                              disabled={!mRam4.tipo_tecnologia}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Frecuencia" />
                              </SelectTrigger>
                              <SelectContent>
                                {mRam4.tipo_tecnologia && RAM_SPECS[mRam4.tipo_tecnologia]?.frecuencias.map((freq) => (
                                  <SelectItem key={freq} value={`${freq} MHz`}>
                                    {freq} MHz
                                  </SelectItem>
                                ))}
                                {mRam4.frecuencia && mRam4.tipo_tecnologia && !RAM_SPECS[mRam4.tipo_tecnologia]?.frecuencias.some(f => `${f} MHz` === mRam4.frecuencia) && (
                                  <SelectItem value={mRam4.frecuencia}>{mRam4.frecuencia}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN DINÁMICA: DISCOS DE ALMACENAMIENTO */}
              <div className="bg-secondary/15 p-4 rounded-lg border border-border/80 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Configuración de Discos de Almacenamiento</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="disk-slots-select" className="text-xs text-muted-foreground">Discos ocupados:</Label>
                    <Select value={diskSlots} onValueChange={setDiskSlots}>
                      <SelectTrigger id="disk-slots-select" className="w-[80px] h-8 bg-secondary/80 border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* DISCO 1 */}
                  {Number(diskSlots) >= 1 && (
                    <div className="space-y-3 bg-secondary/5 p-3 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="disk-1" className="text-xs font-semibold">Disco de Almacenamiento 1</Label>
                        <div className="flex bg-secondary/60 p-0.5 rounded-md text-[10px]">
                          <button
                            type="button"
                            onClick={() => setDisco1Mode("existing")}
                            className={`px-1.5 py-0.5 rounded transition-all ${disco1Mode === "existing" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setDisco1Mode("manual")}
                            className={`px-1.5 py-0.5 rounded transition-all ${disco1Mode === "manual" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {disco1Mode === "existing" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Disco 1</Label>
                            <AsyncCombobox value={discoAlma1Id} onValueChange={setDiscoAlma1Id} fetcher={fetchDisk} placeholder="Selecciona disco 1" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...disks]} filterItem={(d) => d.id === "_null" || getCalculatedDiskStockForSlot(d, 1) > 0 || String(d.id) === discoAlma1Id} renderItem={(d) => d.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{d.marca?.nombre || d.marca} {d.modelo}</span><span className="text-xs text-muted-foreground">{d.tipo_disco} {d.capacidad} - Stock: {getCalculatedDiskStockForSlot(d, 1)}</span></div>)} renderValue={(d) => d.id === "_null" ? "Ninguno" : `${d.marca?.nombre || d.marca} ${d.modelo}`} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">N° Serie Disco 1</Label>
                            <Input
                              id="disk-1-sn"
                              placeholder="Ej: E823_8FA6_BF53..."
                              className="bg-secondary/50 border-0 h-8 text-xs"
                              value={nSerieDiscAlma1}
                              onChange={(e) => setNSerieDiscAlma1(e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 bg-secondary/10 p-2 rounded border border-border/20">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Marca *</Label>
                            <AsyncCombobox value={mDisco1.marca} onValueChange={(val) => setMDisco1({ ...mDisco1, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Tipo Disco</Label>
                            <Select
                              value={mDisco1.tipo_disco}
                              onValueChange={(val) => setMDisco1({ ...mDisco1, tipo_disco: val, capacidad: "" })}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Tipo de Disco" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(DISK_SPECS).map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                                {mDisco1.tipo_disco && !DISK_SPECS[mDisco1.tipo_disco] && (
                                  <SelectItem value={mDisco1.tipo_disco}>{mDisco1.tipo_disco}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Modelo</Label>
                            <Input
                              placeholder="Ej: Crucial P3..."
                              className="bg-secondary/50 border-0 h-7 text-[10px]"
                              value={mDisco1.modelo}
                              onChange={(e) => setMDisco1({ ...mDisco1, modelo: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Capacidad</Label>
                            <div className="flex gap-1">
                              <Select
                                value={mDisco1.capacidad.includes("TB") ? "TB" : "GB"}
                                onValueChange={(val) => setMDisco1({ ...mDisco1, capacidad: val })}
                              >
                                <SelectTrigger className="w-[60px] bg-secondary/50 border-0 h-7 text-[10px] px-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GB">GB</SelectItem>
                                  <SelectItem value="TB">TB</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={mDisco1.capacidad.replace("GB", "").replace("TB", "").trim()}
                                onValueChange={(val) => {
                                  const unit = mDisco1.capacidad.includes("TB") ? "TB" : "GB";
                                  setMDisco1({ ...mDisco1, capacidad: `${val} ${unit}` })
                                }}
                                disabled={!mDisco1.tipo_disco}
                              >
                                <SelectTrigger className="flex-1 bg-secondary/50 border-0 h-7 text-[10px] px-1">
                                  <SelectValue placeholder="Nº" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mDisco1.tipo_disco && DISK_SPECS[mDisco1.tipo_disco]?.filter(c => c.endsWith(mDisco1.capacidad.includes("TB") ? "TB" : "GB")).map(c => c.replace(mDisco1.capacidad.includes("TB") ? "TB" : "GB", "").trim()).map((num) => (
                                    <SelectItem key={num} value={num}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                  {mDisco1.capacidad.replace("GB", "").replace("TB", "").trim() && mDisco1.tipo_disco && (!DISK_SPECS[mDisco1.tipo_disco] || !DISK_SPECS[mDisco1.tipo_disco].filter(c => c.endsWith(mDisco1.capacidad.includes("TB") ? "TB" : "GB")).map(c => c.replace(mDisco1.capacidad.includes("TB") ? "TB" : "GB", "").trim()).includes(mDisco1.capacidad.replace("GB", "").replace("TB", "").trim())) && (
                                    <SelectItem value={mDisco1.capacidad.replace("GB", "").replace("TB", "").trim()}>{mDisco1.capacidad.replace("GB", "").replace("TB", "").trim()}</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px]">N° Serie Disco 1</Label>
                            <Input
                              id="disk-1-sn-manual"
                              placeholder="Ej: E823_8FA6_BF53..."
                              className="bg-secondary/50 border-0 h-7 text-[10px]"
                              value={nSerieDiscAlma1}
                              onChange={(e) => setNSerieDiscAlma1(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISCO 2 */}
                  {Number(diskSlots) >= 2 && (
                    <div className="space-y-3 bg-secondary/5 p-3 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="disk-2" className="text-xs font-semibold">Disco de Almacenamiento 2</Label>
                        <div className="flex bg-secondary/60 p-0.5 rounded-md text-[10px]">
                          <button
                            type="button"
                            onClick={() => setDisco2Mode("existing")}
                            className={`px-1.5 py-0.5 rounded transition-all ${disco2Mode === "existing" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setDisco2Mode("manual")}
                            className={`px-1.5 py-0.5 rounded transition-all ${disco2Mode === "manual" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {disco2Mode === "existing" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Disco 2</Label>
                            <AsyncCombobox value={discoAlma2Id} onValueChange={setDiscoAlma2Id} fetcher={fetchDisk} placeholder="Selecciona disco 2" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...disks]} filterItem={(d) => d.id === "_null" || getCalculatedDiskStockForSlot(d, 2) > 0 || String(d.id) === discoAlma2Id} renderItem={(d) => d.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{d.marca?.nombre || d.marca} {d.modelo}</span><span className="text-xs text-muted-foreground">{d.tipo_disco} {d.capacidad} - Stock: {getCalculatedDiskStockForSlot(d, 2)}</span></div>)} renderValue={(d) => d.id === "_null" ? "Ninguno" : `${d.marca?.nombre || d.marca} ${d.modelo}`} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">N° Serie Disco 2</Label>
                            <Input
                              id="disk-2-sn"
                              placeholder="Ej: E823_8FA6_BF53..."
                              className="bg-secondary/50 border-0 h-8 text-xs"
                              value={nSerieDiscAlma2}
                              onChange={(e) => setNSerieDiscAlma2(e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 bg-secondary/10 p-2 rounded border border-border/20">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Marca *</Label>
                            <AsyncCombobox value={mDisco2.marca} onValueChange={(val) => setMDisco2({ ...mDisco2, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Tipo Disco</Label>
                            <Select
                              value={mDisco2.tipo_disco}
                              onValueChange={(val) => setMDisco2({ ...mDisco2, tipo_disco: val, capacidad: "" })}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Tipo de Disco" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(DISK_SPECS).map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                                {mDisco2.tipo_disco && !DISK_SPECS[mDisco2.tipo_disco] && (
                                  <SelectItem value={mDisco2.tipo_disco}>{mDisco2.tipo_disco}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Modelo</Label>
                            <Input
                              placeholder="Ej: Crucial P3..."
                              className="bg-secondary/50 border-0 h-7 text-[10px]"
                              value={mDisco2.modelo}
                              onChange={(e) => setMDisco2({ ...mDisco2, modelo: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Capacidad</Label>
                            <div className="flex gap-1">
                              <Select
                                value={mDisco2.capacidad.includes("TB") ? "TB" : "GB"}
                                onValueChange={(val) => setMDisco2({ ...mDisco2, capacidad: val })}
                              >
                                <SelectTrigger className="w-[60px] bg-secondary/50 border-0 h-7 text-[10px] px-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GB">GB</SelectItem>
                                  <SelectItem value="TB">TB</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={mDisco2.capacidad.replace("GB", "").replace("TB", "").trim()}
                                onValueChange={(val) => {
                                  const unit = mDisco2.capacidad.includes("TB") ? "TB" : "GB";
                                  setMDisco2({ ...mDisco2, capacidad: `${val} ${unit}` })
                                }}
                                disabled={!mDisco2.tipo_disco}
                              >
                                <SelectTrigger className="flex-1 bg-secondary/50 border-0 h-7 text-[10px] px-1">
                                  <SelectValue placeholder="Nº" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mDisco2.tipo_disco && DISK_SPECS[mDisco2.tipo_disco]?.filter(c => c.endsWith(mDisco2.capacidad.includes("TB") ? "TB" : "GB")).map(c => c.replace(mDisco2.capacidad.includes("TB") ? "TB" : "GB", "").trim()).map((num) => (
                                    <SelectItem key={num} value={num}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                  {mDisco2.capacidad.replace("GB", "").replace("TB", "").trim() && mDisco2.tipo_disco && (!DISK_SPECS[mDisco2.tipo_disco] || !DISK_SPECS[mDisco2.tipo_disco].filter(c => c.endsWith(mDisco2.capacidad.includes("TB") ? "TB" : "GB")).map(c => c.replace(mDisco2.capacidad.includes("TB") ? "TB" : "GB", "").trim()).includes(mDisco2.capacidad.replace("GB", "").replace("TB", "").trim())) && (
                                    <SelectItem value={mDisco2.capacidad.replace("GB", "").replace("TB", "").trim()}>{mDisco2.capacidad.replace("GB", "").replace("TB", "").trim()}</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px]">N° Serie Disco 2</Label>
                            <Input
                              id="disk-2-sn-manual"
                              placeholder="Ej: E823_8FA6_BF53..."
                              className="bg-secondary/50 border-0 h-7 text-[10px]"
                              value={nSerieDiscAlma2}
                              onChange={(e) => setNSerieDiscAlma2(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISCO 3 */}
                  {Number(diskSlots) >= 3 && (
                    <div className="space-y-3 bg-secondary/5 p-3 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="disk-3" className="text-xs font-semibold">Disco de Almacenamiento 3</Label>
                        <div className="flex bg-secondary/60 p-0.5 rounded-md text-[10px]">
                          <button
                            type="button"
                            onClick={() => setDisco3Mode("existing")}
                            className={`px-1.5 py-0.5 rounded transition-all ${disco3Mode === "existing" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Existente
                          </button>
                          <button
                            type="button"
                            onClick={() => setDisco3Mode("manual")}
                            className={`px-1.5 py-0.5 rounded transition-all ${disco3Mode === "manual" ? "bg-background text-foreground font-medium shadow-sm" : "text-muted-foreground"
                              }`}
                          >
                            Manual
                          </button>
                        </div>
                      </div>

                      {disco3Mode === "existing" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Disco 3</Label>
                            <AsyncCombobox value={discoAlma3Id} onValueChange={setDiscoAlma3Id} fetcher={fetchDisk} placeholder="Selecciona disco 3" preloadItems={[{id: "_null", marca: "Ninguno", modelo: ""}, ...disks]} filterItem={(d) => d.id === "_null" || getCalculatedDiskStockForSlot(d, 3) > 0 || String(d.id) === discoAlma3Id} renderItem={(d) => d.id === "_null" ? "Ninguno" : (<div className="flex flex-col"><span>{d.marca?.nombre || d.marca} {d.modelo}</span><span className="text-xs text-muted-foreground">{d.tipo_disco} {d.capacidad} - Stock: {getCalculatedDiskStockForSlot(d, 3)}</span></div>)} renderValue={(d) => d.id === "_null" ? "Ninguno" : `${d.marca?.nombre || d.marca} ${d.modelo}`} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">N° Serie Disco 3</Label>
                            <Input
                              id="disk-3-sn"
                              placeholder="Ej: E823_8FA6_BF53..."
                              className="bg-secondary/50 border-0 h-8 text-xs"
                              value={nSerieDiscAlma3}
                              onChange={(e) => setNSerieDiscAlma3(e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 bg-secondary/10 p-2 rounded border border-border/20">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Marca *</Label>
                            <AsyncCombobox value={mDisco3.marca} onValueChange={(val) => setMDisco3({ ...mDisco3, marca: val })} fetcher={fetchMarcas} placeholder="Marca" preloadItems={dbBrands} className="h-7 text-[10px]" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Tipo Disco</Label>
                            <Select
                              value={mDisco3.tipo_disco}
                              onValueChange={(val) => setMDisco3({ ...mDisco3, tipo_disco: val, capacidad: "" })}
                            >
                              <SelectTrigger className="bg-secondary/50 border-0 h-7 text-[10px]">
                                <SelectValue placeholder="Tipo de Disco" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(DISK_SPECS).map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                                {mDisco3.tipo_disco && !DISK_SPECS[mDisco3.tipo_disco] && (
                                  <SelectItem value={mDisco3.tipo_disco}>{mDisco3.tipo_disco}</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Modelo</Label>
                            <Input
                              placeholder="Ej: Crucial P3..."
                              className="bg-secondary/50 border-0 h-7 text-[10px]"
                              value={mDisco3.modelo}
                              onChange={(e) => setMDisco3({ ...mDisco3, modelo: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Capacidad</Label>
                            <div className="flex gap-1">
                              <Select
                                value={mDisco3.capacidad.includes("TB") ? "TB" : "GB"}
                                onValueChange={(val) => setMDisco3({ ...mDisco3, capacidad: val })}
                              >
                                <SelectTrigger className="w-[60px] bg-secondary/50 border-0 h-7 text-[10px] px-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GB">GB</SelectItem>
                                  <SelectItem value="TB">TB</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={mDisco3.capacidad.replace("GB", "").replace("TB", "").trim()}
                                onValueChange={(val) => {
                                  const unit = mDisco3.capacidad.includes("TB") ? "TB" : "GB";
                                  setMDisco3({ ...mDisco3, capacidad: `${val} ${unit}` })
                                }}
                                disabled={!mDisco3.tipo_disco}
                              >
                                <SelectTrigger className="flex-1 bg-secondary/50 border-0 h-7 text-[10px] px-1">
                                  <SelectValue placeholder="Nº" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mDisco3.tipo_disco && DISK_SPECS[mDisco3.tipo_disco]?.filter(c => c.endsWith(mDisco3.capacidad.includes("TB") ? "TB" : "GB")).map(c => c.replace(mDisco3.capacidad.includes("TB") ? "TB" : "GB", "").trim()).map((num) => (
                                    <SelectItem key={num} value={num}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                  {mDisco3.capacidad.replace("GB", "").replace("TB", "").trim() && mDisco3.tipo_disco && (!DISK_SPECS[mDisco3.tipo_disco] || !DISK_SPECS[mDisco3.tipo_disco].filter(c => c.endsWith(mDisco3.capacidad.includes("TB") ? "TB" : "GB")).map(c => c.replace(mDisco3.capacidad.includes("TB") ? "TB" : "GB", "").trim()).includes(mDisco3.capacidad.replace("GB", "").replace("TB", "").trim())) && (
                                    <SelectItem value={mDisco3.capacidad.replace("GB", "").replace("TB", "").trim()}>{mDisco3.capacidad.replace("GB", "").replace("TB", "").trim()}</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-[10px]">N° Serie Disco 3</Label>
                            <Input
                              id="disk-3-sn-manual"
                              placeholder="Ej: E823_8FA6_BF53..."
                              className="bg-secondary/50 border-0 h-7 text-[10px]"
                              value={nSerieDiscAlma3}
                              onChange={(e) => setNSerieDiscAlma3(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: DETALLES Y LICENCIAS */}
            <TabsContent value="detalles" className="space-y-4 pt-4 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eq-sn-bios">N° Serie BIOS</Label>
                  <Input
                    id="eq-sn-bios"
                    placeholder="Ej: 5CG438175P"
                    className="bg-secondary/50 border-0"
                    value={nSerieBios}
                    onChange={(e) => setNSerieBios(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-sn-loader">N° Serie Cargador Laptop</Label>
                  <Input
                    id="eq-sn-loader"
                    placeholder="Ej: WHHWK0CCXJXO7E"
                    className="bg-secondary/50 border-0"
                    value={nSerieCargadorNote}
                    onChange={(e) => setNSerieCargadorNote(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-mac-eth1">MAC Ethernet 1</Label>
                  <Input
                    id="eq-mac-eth1"
                    placeholder="Ej: C4:C6:E6:9E:33:54"
                    className="bg-secondary/50 border-0"
                    value={macEthernet1}
                    onChange={(e) => setMacEthernet1(formatMacAddress(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-mac-eth2">MAC Ethernet 2</Label>
                  <Input
                    id="eq-mac-eth2"
                    placeholder="Ej: C4:C6:E6:9E:33:55"
                    className="bg-secondary/50 border-0"
                    value={macEthernet2}
                    onChange={(e) => setMacEthernet2(formatMacAddress(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-mac-wifi">MAC Wifi</Label>
                  <Input
                    id="eq-mac-wifi"
                    placeholder="Ej: 74:12:B3:0B:B5:37"
                    className="bg-secondary/50 border-0"
                    value={macWifi}
                    onChange={(e) => setMacWifi(formatMacAddress(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-teamviewer">ID TeamViewer</Label>
                  <Input
                    id="eq-teamviewer"
                    placeholder="Ej: 257 848 175"
                    className="bg-secondary/50 border-0"
                    value={idTeamviewer}
                    onChange={(e) => setIdTeamviewer(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-key-win">Licencia Windows</Label>
                  <AsyncCombobox value={keyWinId} onValueChange={setKeyWinId} fetcher={fetchWinLic} placeholder="Selecciona licencia Windows" preloadItems={[{id: "_null", nombre: "Sin Licencia Windows", key: ""}, {id: "clie", nombre: "Licencia de marca", key: ""}, ...filteredWinLicenses]} renderItem={(item) => `${item.nombre} ${item.key ? "- " + item.key : ""} ${item.activa === false ? "(Inactiva)" : ""}`} renderValue={(item) => `${item.nombre} ${item.key ? "- " + item.key : ""}`} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-key-office">Licencia Office</Label>
                  <AsyncCombobox value={keyOfficeId} onValueChange={setKeyOfficeId} fetcher={fetchOfficeLic} placeholder="Selecciona licencia Office" preloadItems={[{id: "_null", nombre: "Sin Licencia Office", key: ""}, {id: "marca", nombre: "Cliente ya posee una", key: ""}, ...filteredOfficeLicenses]} renderItem={(item) => `${item.nombre} ${item.key ? "- " + item.key : ""} ${item.activa === false ? "(Inactiva)" : ""}`} renderValue={(item) => `${item.nombre} ${item.key ? "- " + item.key : ""}`} />
                </div>
              </div>

              {/* switches: dvd & camara */}
              <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-3 rounded-md border border-border mt-2">
                <div className="flex items-center space-x-3">
                  <Switch id="eq-dvd" checked={dvd} onCheckedChange={setDvd} />
                  <Label htmlFor="eq-dvd" className="font-semibold cursor-pointer">Lector DVD</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch id="eq-camara" checked={camara} onCheckedChange={setCamara} />
                  <Label htmlFor="eq-camara" className="font-semibold cursor-pointer">Cámara Integrada</Label>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: FACTURACIÓN */}
            <TabsContent value="facturacion" className="space-y-4 pt-4 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eq-proveedor">Proveedor</Label>
                  <AsyncCombobox value={proveedorId} onValueChange={setProveedorId} fetcher={fetchProveedores} placeholder="Selecciona proveedor" preloadItems={dbProveedores} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eq-factura">Factura</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                    <Input
                      id="eq-factura"
                      type="number"
                      placeholder="Ej: 15000"
                      className="pl-7 bg-secondary/50 border-0"
                      value={factura}
                      onChange={(e) => setFactura(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eq-fecha-compra">Fecha de Compra</Label>
                  <Input
                    id="eq-fecha-compra"
                    type="date"
                    className="bg-secondary/50 border-0"
                    value={fechaCompra}
                    onChange={(e) => setFechaCompra(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

          </Tabs>

          <DialogFooter className="pt-4 border-t border-border/80">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid()}>
              Guardar Equipo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
