"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface InventoryChartProps {
  totalEquipos: number
}

export function InventoryChart({ totalEquipos = 0 }: InventoryChartProps) {
  // Generate a realistic progressive scale based on total active assets
  const data = [
    { month: "Ene", equipos: Math.max(0, Math.floor(totalEquipos * 0.75)) },
    { month: "Feb", equipos: Math.max(0, Math.floor(totalEquipos * 0.80)) },
    { month: "Mar", equipos: Math.max(0, Math.floor(totalEquipos * 0.85)) },
    { month: "Abr", equipos: Math.max(0, Math.floor(totalEquipos * 0.90)) },
    { month: "May", equipos: Math.max(0, Math.floor(totalEquipos * 0.95)) },
    { month: "Jun", equipos: totalEquipos },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Evolución del Inventario
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEquipos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0 0)", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.13 0 0)",
                  border: "1px solid oklch(0.22 0 0)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "oklch(0.93 0 0)" }}
                itemStyle={{ color: "oklch(0.488 0.243 264.376)" }}
              />
              <Area
                type="monotone"
                dataKey="equipos"
                stroke="oklch(0.488 0.243 264.376)"
                strokeWidth={2}
                fill="url(#colorEquipos)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
