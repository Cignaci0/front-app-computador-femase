"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar, User, Wrench, Eye } from "lucide-react"
import { getMantencionesComputador } from "@/services/mantencionService"

interface MantencionHistoryDialogProps {
  computadorId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MantencionHistoryDialog({
  computadorId,
  open,
  onOpenChange,
}: MantencionHistoryDialogProps) {
  const [mantenciones, setMantenciones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [computadorName, setComputadorName] = useState("")
  const [selectedDetail, setSelectedDetail] = useState<any>(null)

  useEffect(() => {
    if (open && computadorId) {
      setPage(1)
      setMantenciones([])
      fetchData(1)
    }
  }, [open, computadorId])

  const fetchData = async (pageNum: number) => {
    if (!computadorId) return
    setIsLoading(true)
    try {
      const response = await getMantencionesComputador(computadorId, pageNum, 10)
      if (pageNum === 1) {
        setMantenciones(response.data || [])
        if (response.data?.length > 0 && response.data[0].computador) {
          setComputadorName(response.data[0].computador.nombre_equipo || "")
        }
      } else {
        setMantenciones((prev) => [...prev, ...(response.data || [])])
      }
      setHasMore(pageNum < (response.meta?.lastPage || 1))
      setTotal(response.meta?.total || 0)
    } catch (error) {
      console.error("Error fetching mantenciones history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchData(nextPage)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Historial de Mantenciones {computadorName ? `- ${computadorName}` : ""}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({total} registros)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="border rounded-md overflow-hidden bg-background">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Última Mantención</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Encargado</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mantenciones.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron mantenciones para este computador.
                    </TableCell>
                  </TableRow>
                ) : (
                  mantenciones.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(m.fecha_ultima_mantencion)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={m.descripcion}>
                        {m.descripcion || "Sin descripción"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {m.encargado || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {m.responsable || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {m.cliente?.nombre || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedDetail(m)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Cargando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {hasMore && !isLoading && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={loadMore}>
                Cargar más
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Mantención</DialogTitle>
          </DialogHeader>
          {selectedDetail && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Fecha</h4>
                  <p className="text-sm">{formatDate(selectedDetail.fecha_mantencion)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Última Mant.</h4>
                  <p className="text-sm">{formatDate(selectedDetail.fecha_ultima_mantencion)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Encargado</h4>
                  <p className="text-sm">{selectedDetail.encargado || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Responsable</h4>
                  <p className="text-sm">{selectedDetail.responsable || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Cliente</h4>
                  <p className="text-sm">{selectedDetail.cliente?.nombre || "N/A"}</p>
                </div>
              </div>
              <div className="pt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h4>
                <div className="text-sm bg-secondary/30 p-3 rounded-md whitespace-pre-wrap max-h-[30vh] overflow-y-auto">
                  {selectedDetail.descripcion || "Sin descripción"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
