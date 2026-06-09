"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  getPendientesComercial,
  aceptarComercial,
  aplazarComercial,
  rechazarComercial
} from "@/services/mantencionService"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GestionMantencionesPage() {
  const [comercialData, setComercialData] = useState<any[]>([])
  const [isLoadingPendientes, setIsLoadingPendientes] = useState(false)
  const [itemToAplazar, setItemToAplazar] = useState<{tipo: string, id: number} | null>(null)
  const [aplazarDate, setAplazarDate] = useState("")

  const fetchPendientes = async () => {
    setIsLoadingPendientes(true)
    try {
      const resComercial = await getPendientesComercial();
      
      const formatData = (res: any) => {
        const comps = (res.computadores || []).map((c: any) => ({ ...c, tipo: 'computador' }));
        const eqs = (res.equipos || []).map((e: any) => ({ ...e, tipo: 'equipo' }));
        return [...comps, ...eqs];
      };

      setComercialData(formatData(resComercial));
    } catch (error) {
      toast.error("Error al obtener equipos pendientes");
    } finally {
      setIsLoadingPendientes(false);
    }
  }

  useEffect(() => {
    fetchPendientes()
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("es-CL", { timeZone: "UTC" })
  }

  const onAceptar = async (tipo: string, id: number) => {
    try {
      await aceptarComercial(tipo, id);
      toast.success("Equipo aceptado y ciclo de 1 año reiniciado.");
      fetchPendientes();
    } catch (e) {
      toast.error("Error al aceptar");
    }
  }

  const onAplazarClick = (tipo: string, id: number) => {
    setItemToAplazar({ tipo, id })
    setAplazarDate("")
  }

  const handleAplazarConfirm = async () => {
    if (!aplazarDate || !itemToAplazar) return;
    try {
      await aplazarComercial(itemToAplazar.tipo, itemToAplazar.id, new Date(aplazarDate));
      toast.success("Equipo aplazado");
      setItemToAplazar(null);
      fetchPendientes();
    } catch (e) {
      toast.error("Error al aplazar");
    }
  }

  const onRechazar = async (tipo: string, id: number) => {
    if(!confirm("¿Seguro que desea rechazar? No se enviarán más correos para este equipo.")) return;
    try {
      await rechazarComercial(tipo, id);
      toast.success("Equipo rechazado");
      fetchPendientes();
    } catch (e) {
      toast.error("Error al rechazar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Gestión de Mantenciones</h1>
          <p className="text-muted-foreground">
            Gestión comercial para contactar clientes, aceptar o rechazar mantenciones.
          </p>
        </div>
      </div>

      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Equipos Notificados o Aplazados ({comercialData.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado Actual</TableHead>
                  <TableHead>Próx. Mantención</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comercialData.map((item) => (
                  <TableRow key={`${item.tipo}-${item.id}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.nombre_equipo || item.n_serie || `ID: ${item.id}`}</span>
                        <span className="text-xs text-muted-foreground capitalize">{item.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.cliente?.nombre || 'Sin cliente'}</TableCell>
                    <TableCell>
                      <Badge variant={item.estado_mantencion === 'NOTIFICADO' ? 'default' : 'secondary'}>
                        {item.estado_mantencion}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(item.fecha_proxima_mantencion)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-200 hover:bg-emerald-50" onClick={() => onAceptar(item.tipo, item.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Aceptar
                        </Button>
                        <Button size="sm" variant="outline" className="text-blue-500 border-blue-200 hover:bg-blue-50" onClick={() => onAplazarClick(item.tipo, item.id)}>
                          <Clock className="h-4 w-4 mr-1" /> Aplazar
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => onRechazar(item.tipo, item.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {comercialData.length === 0 && !isLoadingPendientes && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay equipos pendientes comerciales.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!itemToAplazar} onOpenChange={(open) => !open && setItemToAplazar(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aplazar Mantención</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha_aplazar" className="col-span-4">
                Seleccione la nueva fecha para enviar la notificación:
              </Label>
              <Input
                id="fecha_aplazar"
                type="date"
                className="col-span-4"
                value={aplazarDate}
                onChange={(e) => setAplazarDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToAplazar(null)}>Cancelar</Button>
            <Button onClick={handleAplazarConfirm} disabled={!aplazarDate}>Confirmar Fecha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
