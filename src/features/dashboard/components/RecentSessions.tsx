'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History } from 'lucide-react'

interface RecentSession {
    id: string
    topicName: string
    minutes: number
    xpEarned: number
    completedAt: Date
}

interface RecentSessionsProps {
    sessions: RecentSession[]
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
    if (sessions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Sessões Recentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        Nenhuma sessão registrada ainda
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Sessões Recentes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="space-y-1">
                                <p className="font-medium">{session.topicName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(session.completedAt), {
                                        addSuffix: true,
                                        locale: ptBR
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-xp-gold">+{session.xpEarned} XP</p>
                                <p className="text-sm text-muted-foreground">{session.minutes} min</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
