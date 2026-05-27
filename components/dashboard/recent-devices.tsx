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

const devices = [
  {
    id: "PC-001",
    brand: "Dell",
    model: "OptiPlex 7090",
    type: "Desktop",
    user: "Juan Pérez",
    status: "Activo",
  },
  {
    id: "LT-042",
    brand: "Lenovo",
    model: "ThinkPad T14",
    type: "Laptop",
    user: "María González",
    status: "Activo",
  },
  {
    id: "PC-088",
    brand: "HP",
    model: "ProDesk 400",
    type: "Desktop",
    user: "Carlos Silva",
    status: "Mantención",
  },
  {
    id: "LT-105",
    brand: "Dell",
    model: "Latitude 5520",
    type: "Laptop",
    user: "Ana Martínez",
    status: "Activo",
  },
  {
    id: "MN-023",
    brand: "LG",
    model: "27UK850",
    type: "Monitor",
    user: "Pedro Rojas",
    status: "Activo",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "Activo":
      return (
        <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
          {status}
        </Badge>
      )
    case "Mantención":
      return (
        <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
          {status}
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function RecentDevices() {
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
              <TableHead className="text-muted-foreground font-medium">ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Marca</TableHead>
              <TableHead className="text-muted-foreground font-medium">Usuario</TableHead>
              <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id} className="border-border">
                <TableCell className="font-mono text-sm">{device.id}</TableCell>
                <TableCell>{device.brand}</TableCell>
                <TableCell className="text-muted-foreground">{device.user}</TableCell>
                <TableCell>{getStatusBadge(device.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
