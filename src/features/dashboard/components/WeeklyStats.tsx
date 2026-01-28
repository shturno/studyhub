'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Target, TrendingUp } from 'lucide-react'

interface WeeklyStatsProps {
    stats: {
        minutesStudied: number
        sessionsCompleted: number
        xpEarned: number
    }
}

export function WeeklyStats({ stats }: WeeklyStatsProps) {
    const hours = Math.floor(stats.minutesStudied / 60)
    const minutes = stats.minutesStudied % 60

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tempo Estudado</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {hours}h {minutes}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Esta semana
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessões</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.sessionsCompleted}</div>
                    <p className="text-xs text-muted-foreground">
                        Sessões completadas
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">XP Ganho</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-xp-gold">
                        {stats.xpEarned} XP
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Nesta semana
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
