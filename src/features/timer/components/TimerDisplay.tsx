'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, RotateCcw, Square } from 'lucide-react'
import { usePomodoro } from '../hooks/usePomodoro'

interface TimerDisplayProps {
    topicId: string
    topicName: string
    subjectName: string
    onComplete?: () => void
}

export function TimerDisplay({ topicId, topicName, subjectName, onComplete }: TimerDisplayProps) {
    const {
        formattedTime,
        isRunning,
        hasCompleted,
        isSaving,
        progress,
        start,
        pause,
        reset,
        setDuration
    } = usePomodoro({
        topicId,
        initialMinutes: 25,
        onComplete
    })

    const durations = [15, 25, 45, 60]

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold">{subjectName}</CardTitle>
                <p className="text-xl text-muted-foreground">{topicName}</p>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Timer Display */}
                <div className="text-center space-y-4">
                    <div className="text-8xl font-mono font-bold text-brand-primary tabular-nums">
                        {formattedTime}
                    </div>
                    <Progress value={progress} className="h-3" />
                </div>

                {/* Duration Presets */}
                <div className="flex justify-center gap-2">
                    {durations.map((duration) => (
                        <Button
                            key={duration}
                            variant="outline"
                            size="sm"
                            onClick={() => setDuration(duration)}
                            disabled={isRunning}
                            className="min-w-[70px]"
                        >
                            {duration}min
                        </Button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3">
                    {!isRunning ? (
                        <Button
                            onClick={start}
                            size="lg"
                            className="px-12 bg-brand-primary hover:bg-brand-primary/90"
                            disabled={hasCompleted || isSaving}
                        >
                            <Play className="h-5 w-5 mr-2" />
                            Iniciar
                        </Button>
                    ) : (
                        <Button
                            onClick={pause}
                            size="lg"
                            variant="secondary"
                            className="px-12"
                        >
                            <Pause className="h-5 w-5 mr-2" />
                            Pausar
                        </Button>
                    )}

                    <Button
                        onClick={reset}
                        size="lg"
                        variant="outline"
                        disabled={isSaving}
                    >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Reiniciar
                    </Button>
                </div>

                {/* Status Messages */}
                {isSaving && (
                    <div className="text-center text-sm text-muted-foreground">
                        Salvando sessão...
                    </div>
                )}

                {hasCompleted && !isSaving && (
                    <div className="text-center p-4 bg-state-success/10 rounded-lg">
                        <p className="text-state-success font-semibold">
                            ✅ Sessão concluída com sucesso!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
