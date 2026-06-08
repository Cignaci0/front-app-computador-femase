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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

import { getMarcas } from "@/services/marcaService"
import { getModelos } from "@/services/modeloService"
import { getTiposDeEquipo } from "@/services/tipoDeEquipoService"
interface EquipoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipoToEdit?: any | null
  onSave: (data: any) => void
}

export function EquipoFormDialog({ open, onOpenChange, equipoToEdit, onSave }: EquipoFormDialogProps) {
  const [tipoDeEquipoId, setTipoDeEquipoId] = useState("")
  const [marcaId, setMarcaId] = useState("")
  const [modeloId, setModeloId] = useState("")
  const [pulgadas, setPulgadas] = useState("")
  const [estado, setEstado] = useState("EN BODEGA")
  const [isMonitor, setIsMonitor] = useState(false)
  const [nSerie, setNSerie] = useState("")
  const [garantia, setGarantia] = useState("")

  const [dbBrands, setDbBrands] = useState<{ id: number; nombre: string }[]>([])
  const [dbModels, setDbModels] = useState<{ id: number; name: string; brandId: number }[]>([])
  const [dbTypes, setDbTypes] = useState<{ id: number; nombre: string; computador?: boolean }[]>([])

  const STATUSES = ["RECIBIDO", "ENTREGADO"]

  const [openComboboxType, setOpenComboboxType] = useState(false)
  const [searchType, setSearchType] = useState("")

  const [openComboboxBrand, setOpenComboboxBrand] = useState(false)
  const [searchBrand, setSearchBrand] = useState("")

  const [openComboboxModel, setOpenComboboxModel] = useState(false)
  const [searchModel, setSearchModel] = useState("")

  useEffect(() => {
    if (open) {
      const handler = setTimeout(() => {
        getTiposDeEquipo(1, 10, searchType)
          .then((res) => setDbTypes(res.data || []))
          .catch((err) => console.error(err))
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [open, searchType])

  useEffect(() => {
    if (open) {
      const handler = setTimeout(() => {
        getMarcas(1, 10, searchBrand)
          .then((res) => setDbBrands(res.data || []))
          .catch((err) => console.error(err))
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [open, searchBrand])

  useEffect(() => {
    if (open && marcaId) {
      const handler = setTimeout(() => {
        getModelos(1, 10, searchModel, Number(marcaId))
          .then((res) => {
            const mapped = (res.data || []).map((m: any) => ({
              id: m.id,
              name: m.nombre,
              brandId: m.marca?.id || Number(m.marca)
            }))
            setDbModels(mapped)
          })
          .catch((err) => console.error(err))
      }, 300)
      return () => clearTimeout(handler)
    } else {
      setDbModels([])
    }
  }, [open, searchModel, marcaId])

  useEffect(() => {
    if (open) {
      if (equipoToEdit) {
        setTipoDeEquipoId(equipoToEdit.tipo_equipo?.id ? String(equipoToEdit.tipo_equipo.id) : "")
        setMarcaId(equipoToEdit.marca?.id ? String(equipoToEdit.marca.id) : "")
        setModeloId(equipoToEdit.modelo?.id ? String(equipoToEdit.modelo.id) : "")
        setNSerie(equipoToEdit.n_serie || "")
        setEstado((equipoToEdit.estado === 'RECIBIDO' ? 'EN BODEGA' : equipoToEdit.estado) || "EN BODEGA")
        
        if (equipoToEdit.garantia !== undefined && equipoToEdit.garantia !== null) {
          setGarantia(String(equipoToEdit.garantia))
        } else {
          setGarantia("")
        }

        if (equipoToEdit.pulgadas) {
          setIsMonitor(true)
          setPulgadas(equipoToEdit.pulgadas)
        } else {
          setIsMonitor(false)
          setPulgadas("")
        }

        if (equipoToEdit.tipo_equipo) {
           setDbTypes([equipoToEdit.tipo_equipo])
        }
        if (equipoToEdit.marca) {
           setDbBrands([equipoToEdit.marca])
        }
        if (equipoToEdit.modelo) {
           setDbModels([{
              id: equipoToEdit.modelo.id,
              name: equipoToEdit.modelo.nombre,
              brandId: equipoToEdit.marca?.id
           }])
        }

      } else {
        setTipoDeEquipoId("")
        setMarcaId("")
        setModeloId("")
        setNSerie("")
        setEstado("EN BODEGA")
        setGarantia("")
        setIsMonitor(false)
        setPulgadas("")
      }
    } else {
        setSearchType("")
        setSearchBrand("")
        setSearchModel("")
    }
  }, [open, equipoToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipoDeEquipoId || !marcaId || !modeloId || !garantia || !nSerie) return

    onSave({
      tipo_equipo: { id: Number(tipoDeEquipoId) },
      marca: { id: Number(marcaId) },
      modelo: { id: Number(modeloId) },
      n_serie: nSerie,
      pulgadas: isMonitor ? pulgadas : "",
      garantia: Number(garantia),
      estado: estado,
    })
    onOpenChange(false)
  }

  const isFormValid = () => {
    return !!tipoDeEquipoId && !!marcaId && !!modeloId && !!garantia && !!nSerie && (!isMonitor || !!pulgadas)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>{equipoToEdit ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
            <DialogDescription>
              {equipoToEdit ? "Modifica los datos del equipo." : "Registra un nuevo equipo (no computador) en el sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eq-nserie">Número de Serie *</Label>
              <Input
                id="eq-nserie"
                placeholder="Ej: 33920fjdk"
                className="bg-secondary/50 border-0"
                value={nSerie}
                onChange={(e) => setNSerie(e.target.value)}
              />
            </div>

            {equipoToEdit && (
              <div className="space-y-2">
                <Label htmlFor="eq-status">Estado *</Label>
                <Select value={estado} onValueChange={setEstado} disabled={!equipoToEdit}>
                  <SelectTrigger id="eq-status" className="bg-secondary/50 border-0">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN BODEGA">EN BODEGA</SelectItem>
                    <SelectItem value="ENTREGADO">ENTREGADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="eq-type">Tipo de Equipo *</Label>
              <Popover open={openComboboxType} onOpenChange={setOpenComboboxType}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openComboboxType}
                    className="w-full justify-between bg-secondary/50 border-0"
                  >
                    {tipoDeEquipoId
                      ? dbTypes.find((t) => String(t.id) === tipoDeEquipoId)?.nombre || "Tipo seleccionado"
                      : "Selecciona tipo..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Buscar tipo de equipo..." 
                      value={searchType}
                      onValueChange={setSearchType}
                    />
                    <CommandList>
                      <CommandEmpty>No se encontraron tipos.</CommandEmpty>
                      <CommandGroup>
                        {dbTypes.filter(t => !t.computador || String(t.id) === tipoDeEquipoId).map((t) => (
                          <CommandItem
                            key={t.id}
                            value={String(t.id)}
                            onSelect={(currentValue) => {
                              setTipoDeEquipoId(currentValue)
                              setOpenComboboxType(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                tipoDeEquipoId === String(t.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {t.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-warranty">Meses de Garantía *</Label>
              <Select value={garantia} onValueChange={setGarantia}>
                <SelectTrigger id="eq-warranty" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona garantía" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 6, 12, 18].map((mes) => (
                    <SelectItem key={mes} value={String(mes)}>
                      {mes} meses
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-brand">Marca *</Label>
              <Popover open={openComboboxBrand} onOpenChange={setOpenComboboxBrand}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openComboboxBrand}
                    className="w-full justify-between bg-secondary/50 border-0"
                  >
                    {marcaId
                      ? dbBrands.find((b) => String(b.id) === marcaId)?.nombre || "Marca seleccionada"
                      : "Selecciona marca..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Buscar marca..." 
                      value={searchBrand}
                      onValueChange={setSearchBrand}
                    />
                    <CommandList>
                      <CommandEmpty>No se encontraron marcas.</CommandEmpty>
                      <CommandGroup>
                        {dbBrands.map((b) => (
                          <CommandItem
                            key={b.id}
                            value={String(b.id)}
                            onSelect={(currentValue) => {
                              setMarcaId(currentValue)
                              setModeloId("")
                              setOpenComboboxBrand(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                marcaId === String(b.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {b.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eq-model">Modelo *</Label>
              <Popover open={openComboboxModel} onOpenChange={setOpenComboboxModel}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openComboboxModel}
                    className="w-full justify-between bg-secondary/50 border-0"
                    disabled={!marcaId}
                  >
                    {modeloId
                      ? dbModels.find((m) => String(m.id) === modeloId)?.name || "Modelo seleccionado"
                      : marcaId ? "Selecciona modelo..." : "Selecciona marca primero"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Buscar modelo..." 
                      value={searchModel}
                      onValueChange={setSearchModel}
                    />
                    <CommandList>
                      <CommandEmpty>No se encontraron modelos.</CommandEmpty>
                      <CommandGroup>
                        {dbModels.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={String(m.id)}
                            onSelect={(currentValue) => {
                              setModeloId(currentValue)
                              setOpenComboboxModel(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                modeloId === String(m.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {m.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

          </div>

          <div className="flex items-center space-x-3 bg-secondary/20 p-3 rounded-md border border-border mt-2">
            <Switch
              id="eq-is-monitor"
              checked={isMonitor}
              onCheckedChange={(checked) => {
                setIsMonitor(checked)
                if (!checked) setPulgadas("")
              }}
            />
            <div>
              <Label htmlFor="eq-is-monitor" className="font-semibold cursor-pointer">¿Es un Monitor?</Label>
              <p className="text-xs text-muted-foreground">Activa esta opción si el equipo es un monitor para registrar las pulgadas.</p>
            </div>
          </div>

          {isMonitor && (
            <div className="space-y-2 bg-secondary/10 p-4 rounded-md border border-border/40 mt-2">
              <Label htmlFor="eq-pulgadas">Pulgadas del Monitor *</Label>
              <Input
                id="eq-pulgadas"
                placeholder="Ej: 24, 27, 32..."
                className="bg-secondary/50 border-0 max-w-sm"
                value={pulgadas}
                onChange={(e) => setPulgadas(e.target.value)}
              />
            </div>
          )}

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
