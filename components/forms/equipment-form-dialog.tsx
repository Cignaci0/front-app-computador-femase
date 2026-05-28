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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, Info, Key, Layers, Database } from "lucide-react"

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

const STATUSES = ["LISTO", "ACTIVO", "MANTENIMIENTO", "BODEGA", "BAJA"]

export function EquipmentFormDialog({ open, onOpenChange, equipmentToEdit, onSave }: EquipmentFormDialogProps) {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState("general")

  // Form states matching backend entity relationships & columns
  const [tipoDeEquipoId, setTipoDeEquipoId] = useState("")
  const [marcaId, setMarcaId] = useState("")
  const [modeloId, setModeloId] = useState("")
  const [estado, setEstado] = useState("")
  const [vencimientoGarantia, setVencimientoGarantia] = useState("")

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

  // Catalog lists
  const [dbBrands, setDbBrands] = useState<{ id: number; nombre: string }[]>([])
  const [dbModels, setDbModels] = useState<{ id: number; name: string; brandId: number }[]>([])
  const [dbTypes, setDbTypes] = useState<{ id: number; nombre: string }[]>([])
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
          name: m.nombre,
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

      // 3. Initialize or map fields for edit
      if (equipmentToEdit) {
        setTipoDeEquipoId(equipmentToEdit.tipo_de_equipo?.id ? String(equipmentToEdit.tipo_de_equipo.id) : "")
        setMarcaId(equipmentToEdit.marca?.id ? String(equipmentToEdit.marca.id) : "")
        setModeloId(equipmentToEdit.modelo?.id ? String(equipmentToEdit.modelo.id) : "")
        setEstado(equipmentToEdit.estado || "LISTO")

        if (equipmentToEdit.vencimiento_garantia) {
          setVencimientoGarantia(equipmentToEdit.vencimiento_garantia.substring(0, 10))
        } else {
          setVencimientoGarantia("")
        }

        setClienteId(equipmentToEdit.cliente?.id ? String(equipmentToEdit.cliente.id) : "")
        setUsuario(equipmentToEdit.usuario || "")
        setNombreEquipo(equipmentToEdit.nombre_equipo || "")
        setNSerieCargadorNote(equipmentToEdit.n_serie_cargador_note || "")
        setNSerieBios(equipmentToEdit.n_serie_bios || "")
        setMacEthernet1(equipmentToEdit.mac_ethernet_1 || "")
        setMacEthernet2(equipmentToEdit.mac_ethernet_2 || "")
        setMacWifi(equipmentToEdit.mac_wifi || "")
        setKeyWinId(equipmentToEdit.key_win?.id ? String(equipmentToEdit.key_win.id) : "")
        setKeyOfficeId(equipmentToEdit.key_office?.id ? String(equipmentToEdit.key_office.id) : "")
        setDvd(!!equipmentToEdit.dvd)
        setCamara(!!equipmentToEdit.camara)
        setIdTeamviewer(equipmentToEdit.id_teamviewer || "")

        setProcesadorId(equipmentToEdit.procesador?.id ? String(equipmentToEdit.procesador.id) : "")
        setTarjetaGraficaId(equipmentToEdit.tarjeta_grafica?.id ? String(equipmentToEdit.tarjeta_grafica.id) : "")
        setFuenteId(equipmentToEdit.fuente?.id ? String(equipmentToEdit.fuente.id) : "")
        setPlacaId(equipmentToEdit.placa?.id ? String(equipmentToEdit.placa.id) : "")

        // Map RAM slots and ids
        const r1 = equipmentToEdit.memoria_ram_1?.id ? String(equipmentToEdit.memoria_ram_1.id) : ""
        const r2 = equipmentToEdit.memoria_ram_2?.id ? String(equipmentToEdit.memoria_ram_2.id) : ""
        const r3 = equipmentToEdit.memoria_ram_3?.id ? String(equipmentToEdit.memoria_ram_3.id) : ""
        const r4 = equipmentToEdit.memoria_ram_4?.id ? String(equipmentToEdit.memoria_ram_4.id) : ""

        setMemoriaRam1Id(r1)
        setMemoriaRam2Id(r2)
        setMemoriaRam3Id(r3)
        setMemoriaRam4Id(r4)

        if (r4) setRamSlots("4")
        else if (r3) setRamSlots("3")
        else if (r2) setRamSlots("2")
        else setRamSlots("1")

        // Map storage disk slots, ids and serial numbers
        const d1 = equipmentToEdit.disco_alma_1?.id ? String(equipmentToEdit.disco_alma_1.id) : ""
        const d2 = equipmentToEdit.disco_alma_2?.id ? String(equipmentToEdit.disco_alma_2.id) : ""
        const d3 = equipmentToEdit.disco_alma_3?.id ? String(equipmentToEdit.disco_alma_3.id) : ""

        setDiscoAlma1Id(d1)
        setDiscoAlma2Id(d2)
        setDiscoAlma3Id(d3)

        setNSerieDiscAlma1(equipmentToEdit.n_serie_disc_alma_1 || "")
        setNSerieDiscAlma2(equipmentToEdit.n_serie_disc_alma_2 || "")
        setNSerieDiscAlma3(equipmentToEdit.n_serie_disc_alma_3 || "")

        if (d3) setDiskSlots("3")
        else if (d2) setDiskSlots("2")
        else setDiskSlots("1")

        setActiveTab("general")
      } else {
        setTipoDeEquipoId("")
        setMarcaId("")
        setModeloId("")
        setEstado("LISTO")
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

        setProcesadorId("")
        setTarjetaGraficaId("")
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
  const filteredCpus = cpus.filter((c) => c.activa || String(c.id) === String(procesadorId))
  const filteredPlates = plates.filter((pl) => pl.activa || String(pl.id) === String(placaId))
  const filteredGpus = gpus.filter((g) => g.activa || String(g.id) === String(tarjetaGraficaId))
  const filteredPowers = powers.filter((p) => p.activa || String(p.id) === String(fuenteId))

  const selectedRamIds = [memoriaRam1Id, memoriaRam2Id, memoriaRam3Id, memoriaRam4Id].filter(Boolean)
  const filteredRams = rams.filter((r) => r.activa || selectedRamIds.includes(String(r.id)))

  const selectedDiskIds = [discoAlma1Id, discoAlma2Id, discoAlma3Id].filter(Boolean)
  const filteredDisks = disks.filter((d) => d.activa || selectedDiskIds.includes(String(d.id)))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoDeEquipoId || !marcaId || !modeloId || !estado || !vencimientoGarantia) return

    onSave({
      tipo_de_equipo: Number(tipoDeEquipoId),
      marca: Number(marcaId),
      modelo: Number(modeloId),
      estado,
      vencimiento_garantia: vencimientoGarantia,
      cliente: clienteId ? Number(clienteId) : null,
      usuario: usuario || "",
      nombre_equipo: nombreEquipo || "",
      n_serie_cargador_note: nSerieCargadorNote || "",
      n_serie_bios: nSerieBios || "",
      mac_ethernet_1: macEthernet1 || "",
      mac_ethernet_2: macEthernet2 || "",
      mac_wifi: macWifi || "",
      key_win: keyWinId && keyWinId !== "_null" ? Number(keyWinId) : null,
      key_office: keyOfficeId && keyOfficeId !== "_null" ? Number(keyOfficeId) : null,
      dvd,
      camara,
      id_teamviewer: idTeamviewer || "",

      // Hardware relationships
      procesador: procesadorId && procesadorId !== "_null" ? Number(procesadorId) : null,
      placa: placaId && placaId !== "_null" ? Number(placaId) : null,
      tarjeta_grafica: tarjetaGraficaId && tarjetaGraficaId !== "_null" ? Number(tarjetaGraficaId) : null,
      fuente: fuenteId && fuenteId !== "_null" ? Number(fuenteId) : null,

      // RAM
      memoria_ram_1: Number(ramSlots) >= 1 && memoriaRam1Id && memoriaRam1Id !== "_null" ? Number(memoriaRam1Id) : null,
      memoria_ram_2: Number(ramSlots) >= 2 && memoriaRam2Id && memoriaRam2Id !== "_null" ? Number(memoriaRam2Id) : null,
      memoria_ram_3: Number(ramSlots) >= 3 && memoriaRam3Id && memoriaRam3Id !== "_null" ? Number(memoriaRam3Id) : null,
      memoria_ram_4: Number(ramSlots) >= 4 && memoriaRam4Id && memoriaRam4Id !== "_null" ? Number(memoriaRam4Id) : null,

      // Storage Disks
      disco_alma_1: Number(diskSlots) >= 1 && discoAlma1Id && discoAlma1Id !== "_null" ? Number(discoAlma1Id) : null,
      disco_alma_2: Number(diskSlots) >= 2 && discoAlma2Id && discoAlma2Id !== "_null" ? Number(discoAlma2Id) : null,
      disco_alma_3: Number(diskSlots) >= 3 && discoAlma3Id && discoAlma3Id !== "_null" ? Number(discoAlma3Id) : null,

      // Disk Serial numbers
      n_serie_disc_alma_1: Number(diskSlots) >= 1 ? nSerieDiscAlma1 || "" : null,
      n_serie_disc_alma_2: Number(diskSlots) >= 2 ? nSerieDiscAlma2 || "" : null,
      n_serie_disc_alma_3: Number(diskSlots) >= 3 ? nSerieDiscAlma3 || "" : null,
    })
    onOpenChange(false)
  }

  const isFormValid = () => {
    return !!tipoDeEquipoId && !!marcaId && !!modeloId && !!estado && !!vencimientoGarantia
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
            <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-lg">
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
                <span>Detalles y Licencias</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: INFORMACION GENERAL */}
            <TabsContent value="general" className="space-y-4 pt-4 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eq-type">Tipo de Equipo *</Label>
                  <Select value={tipoDeEquipoId} onValueChange={setTipoDeEquipoId}>
                    <SelectTrigger id="eq-type" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {dbTypes.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    value={marcaId}
                    onValueChange={(val) => {
                      setMarcaId(val)
                      setModeloId("")
                    }}
                  >
                    <SelectTrigger id="eq-brand" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Selecciona marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {dbBrands.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-model">Modelo *</Label>
                  <Select value={modeloId} onValueChange={setModeloId} disabled={!marcaId}>
                    <SelectTrigger id="eq-model" className="bg-secondary/50 border-0">
                      <SelectValue placeholder={marcaId ? "Selecciona modelo" : "Selecciona marca primero"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredModels.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-client">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger id="eq-client" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Selecciona cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_null">Ninguno</SelectItem>
                      {dbClientes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-user">Usuario / Departamento</Label>
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
                  <Label htmlFor="eq-warranty">Vencimiento de Garantía *</Label>
                  <Input
                    id="eq-warranty"
                    type="date"
                    className="bg-secondary/50 border-0"
                    value={vencimientoGarantia}
                    onChange={(e) => setVencimientoGarantia(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: COMPONENTES DE HARDWARE */}
            <TabsContent value="hardware" className="space-y-4 pt-4 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Procesador */}
                <div className="space-y-2">
                  <Label htmlFor="eq-cpu">Procesador (CPU)</Label>
                  <Select value={procesadorId} onValueChange={setProcesadorId}>
                    <SelectTrigger id="eq-cpu" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_null">Ninguno / Sin CPU</SelectItem>
                      {filteredCpus.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.familia} {c.modelo} (Stock: {c.uso}) {c.proveedor?.nombre ? `- ${c.proveedor.nombre}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Placa Madre */}
                <div className="space-y-2">
                  <Label htmlFor="eq-plate">Placa Madre</Label>
                  <Select value={placaId} onValueChange={setPlacaId}>
                    <SelectTrigger id="eq-plate" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_null">Ninguno / Sin Placa</SelectItem>
                      {filteredPlates.map((pl) => (
                        <SelectItem key={pl.id} value={String(pl.id)}>
                          {pl.modelo} (Stock: {pl.uso}) {pl.proveedor?.nombre ? `- ${pl.proveedor.nombre}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tarjeta Gráfica */}
                <div className="space-y-2">
                  <Label htmlFor="eq-gpu">Tarjeta Gráfica (GPU)</Label>
                  <Select value={tarjetaGraficaId} onValueChange={setTarjetaGraficaId}>
                    <SelectTrigger id="eq-gpu" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_null">Ninguno / Sin GPU</SelectItem>
                      {filteredGpus.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.modelo} ({g.vram}) (Stock: {g.uso}) {g.proveedor?.nombre ? `- ${g.proveedor.nombre}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuente de Poder */}
                <div className="space-y-2">
                  <Label htmlFor="eq-power">Fuente de Poder</Label>
                  <Select value={fuenteId} onValueChange={setFuenteId}>
                    <SelectTrigger id="eq-power" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_null">Ninguno / Sin Fuente</SelectItem>
                      {filteredPowers.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.modelo} {p.potencia} (Stock: {p.uso}) {p.proveedor?.nombre ? `- ${p.proveedor.nombre}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <div className="space-y-2">
                      <Label htmlFor="ram-1">Memoria RAM Slot 1</Label>
                      <Select value={memoriaRam1Id} onValueChange={setMemoriaRam1Id}>
                        <SelectTrigger id="ram-1" className="bg-secondary/50 border-0">
                          <SelectValue placeholder="Selecciona RAM para slot 1" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_null">Ninguno</SelectItem>
                          {filteredRams.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.tipo_tecnologia} {r.formato} {r.capacidad} {r.frecuencia || r.velocidad || ""} (Stock: {r.uso}) {r.proveedor?.nombre ? `- ${r.proveedor.nombre}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {Number(ramSlots) >= 2 && (
                    <div className="space-y-2">
                      <Label htmlFor="ram-2">Memoria RAM Slot 2</Label>
                      <Select value={memoriaRam2Id} onValueChange={setMemoriaRam2Id}>
                        <SelectTrigger id="ram-2" className="bg-secondary/50 border-0">
                          <SelectValue placeholder="Selecciona RAM para slot 2" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_null">Ninguno</SelectItem>
                          {filteredRams.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.tipo_tecnologia} {r.formato} {r.capacidad} {r.frecuencia || r.velocidad || ""} (Stock: {r.uso}) {r.proveedor?.nombre ? `- ${r.proveedor.nombre}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {Number(ramSlots) >= 3 && (
                    <div className="space-y-2">
                      <Label htmlFor="ram-3">Memoria RAM Slot 3</Label>
                      <Select value={memoriaRam3Id} onValueChange={setMemoriaRam3Id}>
                        <SelectTrigger id="ram-3" className="bg-secondary/50 border-0">
                          <SelectValue placeholder="Selecciona RAM para slot 3" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_null">Ninguno</SelectItem>
                          {filteredRams.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.tipo_tecnologia} {r.formato} {r.capacidad} {r.frecuencia || r.velocidad || ""} (Stock: {r.uso}) {r.proveedor?.nombre ? `- ${r.proveedor.nombre}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {Number(ramSlots) >= 4 && (
                    <div className="space-y-2">
                      <Label htmlFor="ram-4">Memoria RAM Slot 4</Label>
                      <Select value={memoriaRam4Id} onValueChange={setMemoriaRam4Id}>
                        <SelectTrigger id="ram-4" className="bg-secondary/50 border-0">
                          <SelectValue placeholder="Selecciona RAM para slot 4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_null">Ninguno</SelectItem>
                          {filteredRams.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.tipo_tecnologia} {r.formato} {r.capacidad} {r.frecuencia || r.velocidad || ""} (Stock: {r.uso}) {r.proveedor?.nombre ? `- ${r.proveedor.nombre}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/10 p-3 rounded border border-border/40">
                      <div className="space-y-2">
                        <Label htmlFor="disk-1">Disco de Almacenamiento 1</Label>
                        <Select value={discoAlma1Id} onValueChange={setDiscoAlma1Id}>
                          <SelectTrigger id="disk-1" className="bg-secondary/50 border-0">
                            <SelectValue placeholder="Selecciona disco 1" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_null">Ninguno</SelectItem>
                            {filteredDisks.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                {d.tipo_disco} {d.modelo} {d.capacidad} (Stock: {d.uso}) {d.proveedor?.nombre ? `- ${d.proveedor.nombre}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disk-1-sn">N° Serie Disco 1</Label>
                        <Input
                          id="disk-1-sn"
                          placeholder="Ej: E823_8FA6_BF53..."
                          className="bg-secondary/50 border-0"
                          value={nSerieDiscAlma1}
                          onChange={(e) => setNSerieDiscAlma1(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* DISCO 2 */}
                  {Number(diskSlots) >= 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/10 p-3 rounded border border-border/40">
                      <div className="space-y-2">
                        <Label htmlFor="disk-2">Disco de Almacenamiento 2</Label>
                        <Select value={discoAlma2Id} onValueChange={setDiscoAlma2Id}>
                          <SelectTrigger id="disk-2" className="bg-secondary/50 border-0">
                            <SelectValue placeholder="Selecciona disco 2" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_null">Ninguno</SelectItem>
                            {filteredDisks.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                {d.tipo_disco} {d.modelo} {d.capacidad} (Stock: {d.uso}) {d.proveedor?.nombre ? `- ${d.proveedor.nombre}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disk-2-sn">N° Serie Disco 2</Label>
                        <Input
                          id="disk-2-sn"
                          placeholder="Ej: E823_8FA6_BF53..."
                          className="bg-secondary/50 border-0"
                          value={nSerieDiscAlma2}
                          onChange={(e) => setNSerieDiscAlma2(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* DISCO 3 */}
                  {Number(diskSlots) >= 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/10 p-3 rounded border border-border/40">
                      <div className="space-y-2">
                        <Label htmlFor="disk-3">Disco de Almacenamiento 3</Label>
                        <Select value={discoAlma3Id} onValueChange={setDiscoAlma3Id}>
                          <SelectTrigger id="disk-3" className="bg-secondary/50 border-0">
                            <SelectValue placeholder="Selecciona disco 3" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_null">Ninguno</SelectItem>
                            {filteredDisks.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                {d.tipo_disco} {d.modelo} {d.capacidad} (Stock: {d.uso}) {d.proveedor?.nombre ? `- ${d.proveedor.nombre}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disk-3-sn">N° Serie Disco 3</Label>
                        <Input
                          id="disk-3-sn"
                          placeholder="Ej: E823_8FA6_BF53..."
                          className="bg-secondary/50 border-0"
                          value={nSerieDiscAlma3}
                          onChange={(e) => setNSerieDiscAlma3(e.target.value)}
                        />
                      </div>
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
                    placeholder="Ej: C4-C6-E6-9E-33-54"
                    className="bg-secondary/50 border-0"
                    value={macEthernet1}
                    onChange={(e) => setMacEthernet1(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-mac-eth2">MAC Ethernet 2</Label>
                  <Input
                    id="eq-mac-eth2"
                    placeholder="Ej: C4-C6-E6-9E-33-55"
                    className="bg-secondary/50 border-0"
                    value={macEthernet2}
                    onChange={(e) => setMacEthernet2(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-mac-wifi">MAC Wifi</Label>
                  <Input
                    id="eq-mac-wifi"
                    placeholder="Ej: 74-12-B3-0B-B5-37"
                    className="bg-secondary/50 border-0"
                    value={macWifi}
                    onChange={(e) => setMacWifi(e.target.value)}
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
                  <Select value={keyWinId} onValueChange={setKeyWinId}>
                    <SelectTrigger id="eq-key-win" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Selecciona Licencia Windows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_null">Ninguna</SelectItem>
                      {filteredWinLicenses.map((lic) => (
                        <SelectItem key={lic.id} value={String(lic.id)}>
                          {lic.nombre} ({lic.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eq-key-office">Licencia Office</Label>
                  <Select value={keyOfficeId} onValueChange={setKeyOfficeId}>
                    <SelectTrigger id="eq-key-office" className="bg-secondary/50 border-0">
                      <SelectValue placeholder="Selecciona Licencia Office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_null">Ninguna</SelectItem>
                      {filteredOfficeLicenses.map((lic) => (
                        <SelectItem key={lic.id} value={String(lic.id)}>
                          {lic.nombre} ({lic.key}) {lic.uso !== undefined ? `[Usos: ${lic.uso}]` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
