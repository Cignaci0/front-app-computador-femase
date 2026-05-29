"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

interface DeviceStatusOverviewProps {
  activo?: number
  mantencion?: number
  bodega?: number
  dadoDeBaja?: number
}

export function DeviceStatusOverview({
  activo = 0,
  mantencion = 0,
  bodega = 0,
  dadoDeBaja = 0,
}: DeviceStatusOverviewProps) {
  const data = [
    { name: "Activo", value: activo, color: "oklch(0.696 0.17 162.48)" },
    { name: "En Mantención", value: mantencion, color: "oklch(0.769 0.188 70.08)" },
    { name: "En Bodega", value: bodega, color: "oklch(0.488 0.243 264.376)" },
    { name: "Dado de Baja", value: dadoDeBaja, color: "oklch(0.577 0.245 27.325)" },
  ]

  // Filter out status segments that have 0 value to clean up the pie chart UI
  const filteredData = data.filter((item) => item.value > 0)

  // Fallback data so the chart isn't empty when there is no equipment yet
  const chartData = filteredData.length > 0 ? filteredData : [{ name: "Sin Equipos", value: 1, color: "oklch(0.6 0 0)" }]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Estado de Equipos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.13 0 0)",
                  border: "1px solid oklch(0.22 0 0)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "oklch(0.93 0 0)" }}
                itemStyle={{ color: "oklch(0.93 0 0)" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "oklch(0.6 0 0)", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
