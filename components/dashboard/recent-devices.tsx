"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RecentDevicesProps {
  devices?: any[]
}

function getStatusBadge(status: string) {
  const norm = (status || "").toUpperCase()
  switch (norm) {
    case "ACTIVO":
    case "LISTO":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-semibold text-xs">
          {status}
        </Badge>
      )
    case "MANTENCIÓN":
    case "REPARACION":
    case "EN PROGRESO":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold text-xs">
          {status}
        </Badge>
      )
    case "BODEGA":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-semibold text-xs">
          {status}
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-xs">{status || "REGISTRADO"}</Badge>
  }
}

export function RecentDevices({ devices = [] }: RecentDevicesProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Equipos Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Nombre / ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
              <TableHead className="text-muted-foreground font-medium">Usuario / Cliente</TableHead>
              <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => {
              const brandName = device.marca?.nombre || "N/A"
              const userOrClient = device.usuario || device.cliente?.nombre || "Sin Asignar"
              const deviceLabel = device.nombre_equipo || device.nombre || `ID: ${device.id}`
              
              return (
                <TableRow key={device.id} className="border-border hover:bg-secondary/10">
                  <TableCell className="font-mono text-sm font-semibold">{deviceLabel}</TableCell>
                  <TableCell className="text-sm">{brandName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{userOrClient}</TableCell>
                  <TableCell>{getStatusBadge(device.estado || "BODEGA")}</TableCell>
                </TableRow>
              )
            })}
            {devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay equipos recientes registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
