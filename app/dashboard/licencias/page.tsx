"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Key, ShieldCheck, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  getLicenciasWin,
  createLicenciaWin,
  updateLicenciaWin,
  deleteLicenciaWin,
  getLicenciasOffice,
  createLicenciaOffice,
  updateLicenciaOffice,
  deleteLicenciaOffice,
  getComputadoresByLicenciaWin,
  getComputadoresByLicenciaOffice,
} from "@/services/licenciaService"

interface License {
  id: number
  nombre: string
  key: string
  activa: boolean
  cod_interno?: string | null
  uso?: number
}

export default function LicenciasPage() {
  const [activeTab, setActiveTab] = useState<"win" | "office">("win")
  
  // Windows licenses state
  const [winLicenses, setWinLicenses] = useState<License[]>([])
  const [winMeta, setWinMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 9 })
  const [winPage, setWinPage] = useState(1)
  const [winSearch, setWinSearch] = useState("")
  const [winSearchDebounced, setWinSearchDebounced] = useState("")

  // Office licenses state
  const [officeLicenses, setOfficeLicenses] = useState<License[]>([])
  const [officeMeta, setOfficeMeta] = useState({ total: 0, page: 1, lastPage: 1, limit: 9 })
  const [officePage, setOfficePage] = useState(1)
  const [officeSearch, setOfficeSearch] = useState("")
  const [officeSearchDebounced, setOfficeSearchDebounced] = useState("")

  const [isLoading, setIsLoading] = useState(false)

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLicense, setEditingLicense] = useState<License | null>(null)
  
  // Form State
  const [formNombre, setFormNombre] = useState("")
  const [formKey, setFormKey] = useState("")
  const [formCodInterno, setFormCodInterno] = useState("")
  const [formActiva, setFormActiva] = useState(true)
  const [formUso, setFormUso] = useState(5)

  // Usage Dialog State
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [usageLicense, setUsageLicense] = useState<License | null>(null)
  const [usageData, setUsageData] = useState<{ count: number, computers: any[] } | null>(null)
  const [isUsageLoading, setIsUsageLoading] = useState(false)

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setWinSearchDebounced(winSearch)
      setWinPage(1) // Reset page to 1 when search query changes
    }, 300)
    return () => clearTimeout(handler)
  }, [winSearch])

  useEffect(() => {
    const handler = setTimeout(() => {
      setOfficeSearchDebounced(officeSearch)
      setOfficePage(1) // Reset page to 1 when search query changes
    }, 300)
    return () => clearTimeout(handler)
  }, [officeSearch])

  // Fetch Windows Licenses
  const fetchWinLicenses = async (page: number, search = "") => {
    setIsLoading(true)
    try {
      const response = await getLicenciasWin(page, 9, search)
      if (response && response.data) {
        setWinLicenses(response.data)
        setWinMeta(response.meta || { total: response.data.length, page, lastPage: 1, limit: 9 })
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al obtener licencias de Windows")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch Office Licenses
  const fetchOfficeLicenses = async (page: number, search = "") => {
    setIsLoading(true)
    try {
      const response = await getLicenciasOffice(page, 9, search)
      if (response && response.data) {
        setOfficeLicenses(response.data)
        setOfficeMeta(response.meta || { total: response.data.length, page, lastPage: 1, limit: 9 })
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al obtener licencias de Office")
    } finally {
      setIsLoading(false)
    }
  }

  // Load licenses on tab, page, or search change
  useEffect(() => {
    if (activeTab === "win") {
      fetchWinLicenses(winPage, winSearchDebounced)
    } else {
      fetchOfficeLicenses(officePage, officeSearchDebounced)
    }
  }, [activeTab, winPage, officePage, winSearchDebounced, officeSearchDebounced])

  // Open Dialog for Creation
  const handleNewLicense = () => {
    setEditingLicense(null)
    setFormNombre("")
    setFormKey("")
    setFormCodInterno("")
    setFormActiva(true)
    setFormUso(5)
    setDialogOpen(true)
  }

  // Open Dialog for Edit
  const handleEditLicense = (license: License) => {
    setEditingLicense(license)
    setFormNombre(license.nombre)
    setFormKey(license.key)
    setFormCodInterno(license.cod_interno || "")
    setFormActiva(license.activa)
    setFormUso(license.uso ?? 5)
    setDialogOpen(true)
  }

  // Open Usage Dialog
  const handleViewUsage = async (license: License) => {
    setUsageLicense(license)
    setUsageData(null)
    setUsageDialogOpen(true)
    setIsUsageLoading(true)
    try {
      if (activeTab === "win") {
        const res = await getComputadoresByLicenciaWin(license.id)
        setUsageData({ count: res.existencia, computers: res.data || [] })
      } else {
        const res = await getComputadoresByLicenciaOffice(license.id)
        setUsageData({ count: res.existencia, computers: res.data || [] })
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al obtener el uso de la licencia")
    } finally {
      setIsUsageLoading(false)
    }
  }

  // Save License (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNombre.trim() || !formKey.trim()) {
      toast.warning("Nombre y Key son requeridos")
      return
    }

    try {
      if (activeTab === "win") {
        if (editingLicense) {
          // Update
          await updateLicenciaWin(editingLicense.id, {
            nombre: formNombre,
            key: formKey,
            cod_interno: formCodInterno || null,
            activa: formActiva,
          })
          toast.success("Licencia de Windows actualizada")
        } else {
          // Create
          await createLicenciaWin({
            nombre: formNombre,
            key: formKey,
            cod_interno: formCodInterno || null,
          })
          toast.success("Licencia de Windows creada")
        }
        fetchWinLicenses(winPage, winSearchDebounced)
      } else {
        if (editingLicense) {
          // Update
          await updateLicenciaOffice(editingLicense.id, {
            nombre: formNombre,
            key: formKey,
            cod_interno: formCodInterno || null,
            uso: Number(formUso),
            activa: formActiva,
          })
          toast.success("Licencia de Office actualizada")
        } else {
          // Create
          await createLicenciaOffice({
            nombre: formNombre,
            key: formKey,
            cod_interno: formCodInterno || null,
          })
          toast.success("Licencia de Office creada")
        }
        fetchOfficeLicenses(officePage, officeSearchDebounced)
      }
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar la licencia")
    }
  }

  // Delete License
  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta licencia permanentemente?")) return

    try {
      if (activeTab === "win") {
        await deleteLicenciaWin(id)
        toast.success("Licencia de Windows eliminada")
        fetchWinLicenses(winPage, winSearchDebounced)
      } else {
        await deleteLicenciaOffice(id)
        toast.success("Licencia de Office de baja/eliminada")
        fetchOfficeLicenses(officePage, officeSearchDebounced)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar la licencia")
    }
  }

  // Toggle active state quickly
  const handleToggleActive = async (license: License) => {
    try {
      if (activeTab === "win") {
        await updateLicenciaWin(license.id, { activa: !license.activa })
        toast.success(`Licencia ${!license.activa ? "activada" : "desactivada"}`)
        fetchWinLicenses(winPage, winSearchDebounced)
      } else {
        await updateLicenciaOffice(license.id, { activa: !license.activa })
        toast.success(`Licencia ${!license.activa ? "activada" : "desactivada"}`)
        fetchOfficeLicenses(officePage, officeSearchDebounced)
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al cambiar estado de la licencia")
    }
  }

  // Render search results directly
  const filteredWinLicenses = winLicenses
  const filteredOfficeLicenses = officeLicenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance flex items-center gap-2">
            <Key className="h-6 w-6 text-primary animate-pulse" />
            <span>Claves de Licencia</span>
          </h1>
          <p className="text-muted-foreground">
            Administra las claves y licencias activas para Windows y Microsoft Office.
          </p>
        </div>
        <Button onClick={handleNewLicense} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Nueva Licencia</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="win"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "win" | "office")}
        className="w-full space-y-4"
      >
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-secondary/50 p-1 rounded-lg">
          <TabsTrigger value="win" className="py-2">Windows</TabsTrigger>
          <TabsTrigger value="office" className="py-2">Office</TabsTrigger>
        </TabsList>

        {/* Windows tab content */}
        <TabsContent value="win" className="space-y-4 outline-none">
          {/* Search bar */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar licencia Windows..."
                  value={winSearch}
                  onChange={(e) => setWinSearch(e.target.value)}
                  className="pl-9 bg-secondary/50 border-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isLoading ? "Cargando..." : `${winMeta.total} Licencias registradas`}
              </CardTitle>
              <CardDescription>
                Las licencias en estado inactivo no se mostrarán al registrar nuevos equipos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium pl-6">Nombre / Versión</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Clave de Producto</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Cód. Interno</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWinLicenses.map((item) => (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/10">
                      <TableCell className="font-semibold pl-6">{item.nombre}</TableCell>
                      <TableCell className="font-mono text-xs">{item.key}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{item.cod_interno || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.activa}
                            onCheckedChange={() => handleToggleActive(item)}
                            className="scale-90"
                          />
                          <Badge
                            className={
                              item.activa
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-transparent"
                            }
                            variant={item.activa ? "default" : "secondary"}
                          >
                            {item.activa ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-border">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewUsage(item)}>
                              <Search className="mr-2 h-4 w-4" />
                              <span>Ver uso en equipos</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditLicense(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredWinLicenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No se encontraron licencias de Windows.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {winMeta.page} de {winMeta.lastPage} ({winMeta.total} licencias en total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWinPage((p) => Math.max(p - 1, 1))}
                    disabled={winMeta.page <= 1 || isLoading}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWinPage((p) => Math.min(p + 1, winMeta.lastPage))}
                    disabled={winMeta.page >= winMeta.lastPage || isLoading}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Office tab content */}
        <TabsContent value="office" className="space-y-4 outline-none">
          {/* Search bar */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar licencia Office..."
                  value={officeSearch}
                  onChange={(e) => setOfficeSearch(e.target.value)}
                  className="pl-9 bg-secondary/50 border-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {isLoading ? "Cargando..." : `${officeMeta.total} Licencias registradas`}
              </CardTitle>
              <CardDescription>
                Las licencias de Office decrementan sus usos restantes en 1 al ser asignadas a un PC. Al llegar a 0 se desactivan automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium pl-6">Nombre / Versión</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Clave de Producto</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Cód. Interno</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Usos Disponibles</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficeLicenses.map((item) => (
                    <TableRow key={item.id} className="border-border hover:bg-secondary/10">
                      <TableCell className="font-semibold pl-6">{item.nombre}</TableCell>
                      <TableCell className="font-mono text-xs">{item.key}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{item.cod_interno || "—"}</TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="font-bold border-border bg-secondary/35">
                          {item.uso ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.activa}
                            onCheckedChange={() => handleToggleActive(item)}
                            className="scale-90"
                          />
                          <Badge
                            className={
                              item.activa
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-transparent"
                            }
                            variant={item.activa ? "default" : "secondary"}
                          >
                            {item.activa ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-border">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewUsage(item)}>
                              <Search className="mr-2 h-4 w-4" />
                              <span>Ver uso en equipos</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditLicense(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredOfficeLicenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No se encontraron licencias de Office.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {officeMeta.page} de {officeMeta.lastPage} ({officeMeta.total} licencias en total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOfficePage((p) => Math.max(p - 1, 1))}
                    disabled={officeMeta.page <= 1 || isLoading}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOfficePage((p) => Math.min(p + 1, officeMeta.lastPage))}
                    disabled={officeMeta.page >= officeMeta.lastPage || isLoading}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Creation / Editing Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-border/80 bg-background/95 backdrop-blur-md">
          <form onSubmit={handleSave}>
            <DialogHeader className="border-b border-border/50 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>
                  {editingLicense ? "Editar" : "Nueva"} Licencia {activeTab === "win" ? "Windows" : "Office"}
                </span>
              </DialogTitle>
              <DialogDescription>
                Rellena los campos para {editingLicense ? "modificar" : "registrar"} la licencia en el sistema.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="lic-nombre">Nombre / Versión</Label>
                <Select value={formNombre} onValueChange={setFormNombre} required>
                  <SelectTrigger id="lic-nombre" className="bg-secondary/50 border-0">
                    <SelectValue placeholder={activeTab === "win" ? "Selecciona versión de Windows" : "Selecciona versión de Office"} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === "win" ? (
                      <>
                        <SelectItem value="Windows 10">Windows 10</SelectItem>
                        <SelectItem value="Windows 11">Windows 11</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Office 2019">Office 2019</SelectItem>
                        <SelectItem value="Office 2021">Office 2021</SelectItem>
                        <SelectItem value="Office 2024">Office 2024</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lic-key">Clave de Producto (Key)</Label>
                <Input
                  id="lic-key"
                  placeholder="Ej: 7MKMN-M2X9W-7RFX6-HXDT7-2R7RX"
                  className="bg-secondary/50 border-0 font-mono text-sm"
                  value={formKey}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                    let formatted = val.match(/.{1,5}/g)?.join('-') || '';
                    setFormKey(formatted.slice(0, 29));
                  }}
                  pattern="[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}"
                  title="El formato debe ser: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lic-cod-interno">Código Interno</Label>
                <Input
                  id="lic-cod-interno"
                  placeholder="Ej: 3827462"
                  className="bg-secondary/50 border-0"
                  value={formCodInterno}
                  onChange={(e) => setFormCodInterno(e.target.value)}
                />
              </div>

              {editingLicense && (
                <div className="flex items-center justify-between rounded-md bg-secondary/10 p-3 border border-border/40 mt-2">
                  <div className="space-y-0.5">
                    <Label className="font-semibold">Licencia Activa</Label>
                    <p className="text-xs text-muted-foreground">Habilita o deshabilita el uso de la licencia.</p>
                  </div>
                  <Switch checked={formActiva} onCheckedChange={setFormActiva} />
                </div>
              )}

              {activeTab === "office" && editingLicense && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="lic-uso">Usos Disponibles</Label>
                  <Input
                    id="lic-uso"
                    type="number"
                    min="0"
                    placeholder="Cantidad de usos de esta clave"
                    className="bg-secondary/50 border-0"
                    value={formUso}
                    onChange={(e) => setFormUso(Number(e.target.value))}
                    required
                  />
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-border/50 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingLicense ? "Guardar Cambios" : "Crear Licencia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Usage Dialog */}
      <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-border/80 bg-background/95 backdrop-blur-md">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <span>Uso de la Licencia</span>
            </DialogTitle>
            <DialogDescription>
              {usageLicense ? `Mostrando equipos que tienen asignada la licencia: ${usageLicense.nombre}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {isUsageLoading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando datos de uso...</div>
            ) : usageData ? (
              <>
                <div className="flex items-center justify-between bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <span className="font-medium text-primary">Total de equipos en uso:</span>
                  <span className="text-2xl font-bold text-primary">{usageData.count}</span>
                </div>
                
                {usageData.computers.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                    {usageData.computers.map((comp) => (
                      <div key={comp.id} className="flex justify-between items-center bg-secondary/30 p-3 rounded-md border border-border/50">
                        <div>
                          <div className="font-semibold text-foreground">{comp.nombre_equipo || `Equipo #${comp.id}`}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <span>Estado: {comp.estado}</span>
                            <span>•</span>
                            <span>Usuario: {comp.usuario || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-lg border border-border/50">
                    Ningún equipo utiliza esta licencia actualmente.
                  </div>
                )}
              </>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/50 pt-4">
            <Button type="button" onClick={() => setUsageDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
