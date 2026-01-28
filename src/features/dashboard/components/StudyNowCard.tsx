'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StudyNowCardProps {
    nextTopic: {
        id: string
        name: string
        subjectName: string
        estimatedMinutes: number
    } | null
}

export function StudyNowCard({ nextTopic }: StudyNowCardProps) {
    const router = useRouter()

    if (!nextTopic) {
        return (
            <Card className="col-span-full border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum ciclo ativo</h3>
                    <p className="text-muted-foreground mb-6">
                        Crie um ciclo de estudos para começar
                    </p>
                    <Button onClick={() => router.push('/cycle')}>
                        Criar Ciclo de Estudos
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border-2 border-brand-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <BookOpen className="h-6 w-6 text-brand-primary" />
                    Estudar Agora
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-brand-primary">
                        {nextTopic.subjectName}
                    </h3>
                    <p className="text-xl text-muted-foreground">
                        {nextTopic.name}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">{nextTopic.estimatedMinutes} minutos</span>
                </div>

                <Button
                    size="lg"
                    className="w-full text-lg h-14 bg-brand-primary hover:bg-brand-primary/90"
                    onClick={() => router.push(`/study?topicId=${nextTopic.id}`)}
                >
                    <Play className="h-6 w-6 mr-2" />
                    INICIAR ESTUDO
                </Button>
            </CardContent>
        </Card>
    )
}
