"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { RecentDevices } from "@/components/dashboard/recent-devices"
import { MaintenanceActivity } from "@/components/dashboard/maintenance-activity"
import { DeviceStatusOverview } from "@/components/dashboard/device-status-overview"

import { getComputadores } from "@/services/computadorService"
import { getEquipos } from "@/services/equipoService"
import { getClientes } from "@/services/clienteService"
import { getMantenciones } from "@/services/mantencionService"
import { getAlertas } from "@/services/alertaService"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEquipos: 0,
    totalClientes: 0,
    totalMantencionesPendientes: 0,
    totalAlertas: 0,
  })

  const [statusCounts, setStatusCounts] = useState({
    activo: 0,
    mantencion: 0,
    bodega: 0,
    dadoDeBaja: 0,
  })

  const [recentDevices, setRecentDevices] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [
          resComputadores,
          resEquipos,
          resClientes,
          resMantenciones,
          resAlertas,
        ] = await Promise.all([
          getComputadores(1, 1000).catch(() => ({ data: [], meta: { total: 0 } })),
          getEquipos(1, 1000).catch(() => ({ data: [], meta: { total: 0 } })),
          getClientes(1, 1000).catch(() => ({ data: [], meta: { total: 0 } })),
          getMantenciones(1, 1000).catch(() => ({ data: [], meta: { total: 0 } })),
          getAlertas().catch(() => []),
        ])

        const computers = resComputadores.data || []
        const generalEquip = resEquipos.data || []
        const clients = resClientes.data || []
        const maintenances = resMantenciones.data || []
        const alerts = resAlertas || []

        // 1. Calculate general stats counts
        const totalComputadoresCount = computers.length
        const totalEquiposCount = generalEquip.length
        const totalAssets = totalComputadoresCount + totalEquiposCount
        const totalClients = clients.length

        // Pending/Active maintenance count
        const pendingMnt = maintenances.filter((m: any) =>
          ["PENDIENTE", "EN PROGRESO", "REPARACION"].includes((m.estado || "").toUpperCase())
        ).length

        const totalAlertsCount = alerts.length

        setStats({
          totalEquipos: totalAssets,
          totalClientes: totalClients,
          totalMantencionesPendientes: pendingMnt,
          totalAlertas: totalAlertsCount,
        })

        // 2. Calculate status overview
        let countActivo = 0
        let countMantencion = 0
        let countBodega = 0
        let countBaja = 0

        const processStatus = (statusStr: string) => {
          const s = (statusStr || "").toUpperCase()
          if (["BODEGA"].includes(s)) {
            countBodega++
          } else if (["REPARACION", "MANTENCION", "EN PROGRESO", "PENDIENTE"].includes(s)) {
            countMantencion++
          } else if (["BAJA", "DADO DE BAJA", "ELIMINADO"].includes(s)) {
            countBaja++
          } else {
            countActivo++
          }
        }

        computers.forEach((c: any) => processStatus(c.estado))
        generalEquip.forEach((e: any) => processStatus(e.estado || "ACTIVO")) // Default to active if empty

        setStatusCounts({
          activo: countActivo,
          mantencion: countMantencion,
          bodega: countBodega,
          dadoDeBaja: countBaja,
        })

        // 3. Get recent devices (last 5 added)
        // Combine computers and equipment, sort by ID descending
        const combinedDevices = [
          ...computers.map((c: any) => ({ ...c, isComputer: true })),
          ...generalEquip.map((e: any) => ({ ...e, isComputer: false })),
        ]
        combinedDevices.sort((a, b) => (b.id || 0) - (a.id || 0))
        setRecentDevices(combinedDevices.slice(0, 5))

        // 4. Get recent maintenance activities (last 5 records)
        const sortedMnt = [...maintenances]
        sortedMnt.sort((a, b) => (b.id || 0) - (a.id || 0))
        setRecentActivities(sortedMnt.slice(0, 5))

      } catch (error) {
        console.error("Error loading dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground font-normal">
          {loading ? "Cargando métricas..." : "Resumen general en tiempo real del inventario de activos TI"}
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalEquipos={stats.totalEquipos}
        totalClientes={stats.totalClientes}
        totalMantencionesPendientes={stats.totalMantencionesPendientes}
        totalAlertas={stats.totalAlertas}
      />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryChart totalEquipos={stats.totalEquipos} />
        <DeviceStatusOverview
          activo={statusCounts.activo}
          mantencion={statusCounts.mantencion}
          bodega={statusCounts.bodega}
          dadoDeBaja={statusCounts.dadoDeBaja}
        />
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentDevices devices={recentDevices} />
        <MaintenanceActivity activities={recentActivities} />
      </div>
    </div>
  )
}
