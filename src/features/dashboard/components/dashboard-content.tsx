"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Clock, Target, TrendingUp, Play, CheckCircle, Circle, Filter } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DashboardData {
  tracks: Array<{
    id: string
    name: string
    lessons: Array<{
      id: string
      title: string
      status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
      estimated: number | null
      studyLogs: Array<{ minutes: number }>
    }>
  }>
  totalMinutes: number
  weeklyMinutes: number
  nextLessons: Array<{
    id: string
    title: string
    trackName: string
    trackId: string
    status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
    estimated: number | null
  }>
  recentLogs: Array<any>
  trackTimeDistribution: Array<{
    name: string
    value: number
    id: string
  }>
}

interface DashboardContentProps {
  data: DashboardData
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"]

export function DashboardContent({ data }: DashboardContentProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("all")

  const totalHours = Math.floor(data.totalMinutes / 60)
  const weeklyHours = Math.floor(data.weeklyMinutes / 60)

  // Filter data based on selected track
  const filteredTracks =
    selectedTrackId === "all" ? data.tracks : data.tracks.filter((track) => track.id === selectedTrackId)

  const filteredNextLessons =
    selectedTrackId === "all"
      ? data.nextLessons
      : data.nextLessons.filter((lesson) => lesson.trackId === selectedTrackId)

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Acompanhe seu progresso de estudos</p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por trilha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as trilhas</SelectItem>
                {data.tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
            <p className="text-xs text-muted-foreground">{data.totalMinutes % 60}min adicionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyHours}h</div>
            <p className="text-xs text-muted-foreground">{data.weeklyMinutes % 60}min adicionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trilhas Ativas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTracks.length}</div>
            <p className="text-xs text-muted-foreground">trilhas de estudo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lições Concluídas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTracks.reduce(
                (sum, track) => sum + track.lessons.filter((lesson) => lesson.status === "DONE").length,
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">lições completadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso das Trilhas</CardTitle>
            <CardDescription>Acompanhe o progresso de cada trilha de estudo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTracks.map((track) => {
              const totalLessons = track.lessons.length
              const completedLessons = track.lessons.filter((lesson) => lesson.status === "DONE").length
              const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

              return (
                <div key={track.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{track.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {completedLessons}/{totalLessons}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )
            })}
            {filteredTracks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma trilha encontrada. Crie sua primeira trilha!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tempo</CardTitle>
            <CardDescription>Tempo estudado por trilha</CardDescription>
          </CardHeader>
          <CardContent>
            {data.trackTimeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.trackTimeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.trackTimeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${Math.floor(value / 60)}h ${value % 60}m`, "Tempo"]}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum tempo registrado ainda</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Lessons */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Lições</CardTitle>
            <CardDescription>Continue seus estudos com essas lições</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNextLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {lesson.status === "DONE" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : lesson.status === "IN_PROGRESS" ? (
                      <Play className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-muted-foreground">{lesson.trackName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lesson.estimated && <Badge variant="secondary">{lesson.estimated}min</Badge>}
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredNextLessons.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  {selectedTrackId === "all"
                    ? "Parabéns! Todas as lições foram concluídas."
                    : "Nenhuma lição pendente nesta trilha."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
