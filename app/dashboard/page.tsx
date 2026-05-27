import { StatsCards } from "@/components/dashboard/stats-cards"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { RecentDevices } from "@/components/dashboard/recent-devices"
import { MaintenanceActivity } from "@/components/dashboard/maintenance-activity"
import { DeviceStatusOverview } from "@/components/dashboard/device-status-overview"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del inventario de activos TI
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryChart />
        <DeviceStatusOverview />
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentDevices />
        <MaintenanceActivity />
      </div>
    </div>
  )
}
