"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface WeeklyData {
  week: string
  hours: number
}

interface TrackData {
  name: string
  hours: number
  minutes: number
}

interface StatsData {
  weeklyStats: WeeklyData[]
  trackDistribution: TrackData[]
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16", "#f97316"]

export function StatsCharts() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Horas por Semana</CardTitle>
          <CardDescription>Progresso de estudos nas últimas 12 semanas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [`${value}h`, "Horas"]}
                labelFormatter={(label: any) => `Semana ${label}`}
              />
              <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Track Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Trilha</CardTitle>
          <CardDescription>Tempo dedicado a cada trilha de estudo</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.trackDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.trackDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: ${value}h`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                >
                  {stats.trackDistribution.map((_: TrackData, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value}h`, "Horas"]}
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Nenhum dado de estudo disponível ainda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Track Details Table */}
      {stats.trackDistribution.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes por Trilha</CardTitle>
            <CardDescription>Tempo detalhado dedicado a cada trilha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Trilha</th>
                    <th className="text-right py-2">Horas</th>
                    <th className="text-right py-2">Minutos</th>
                    <th className="text-right py-2">Porcentagem</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.trackDistribution.map((track: TrackData, index: number) => {
                    const totalMinutes = stats.trackDistribution.reduce((sum: number, t: TrackData) => sum + t.minutes, 0)
                    const percentage = totalMinutes > 0 ? ((track.minutes / totalMinutes) * 100).toFixed(1) : "0"

                    return (
                      <tr key={track.name} className="border-b">
                        <td className="py-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span>{track.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-2 font-medium">{track.hours}h</td>
                        <td className="text-right py-2 text-gray-600">{track.minutes}min</td>
                        <td className="text-right py-2 text-gray-600">{percentage}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
