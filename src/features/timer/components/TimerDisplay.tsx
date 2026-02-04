'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Trophy, ArrowLeft } from 'lucide-react'
import { useStudyTimer } from '@/features/timer/hooks/useStudyTimer'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { useEffect, useRef } from 'react'

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
        setDuration,
        timeLeft
    } = useStudyTimer({
        topicId,
        initialMinutes: 25,
        onComplete
    })

    const durations = [15, 25, 45, 60]

    // Circular Progress Calculation
    const radius = 120
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    // Effect to trigger confetti on completion
    useEffect(() => {
        if (hasCompleted && !isSaving) {
            const duration = 3 * 1000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    return clearInterval(interval)
                }

                const particleCount = 50 * (timeLeft / duration)

                // Since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
            }, 250)

            return () => clearInterval(interval)
        }
    }, [hasCompleted, isSaving])

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto">

            {/* Title Section */}
            <div className="text-center mb-10 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
                <h3 className="text-sm font-semibold tracking-[0.2em] text-zinc-500 uppercase">{subjectName}</h3>
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                    {topicName}
                </h1>
            </div>

            {/* Main Timer UI */}
            <div className="relative mb-12 group">
                {/* Glow Effect - Breathing */}
                <div className={cn(
                    "absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full transition-all duration-[4000ms]",
                    isRunning ? "opacity-100 scale-110 animate-pulse" : "opacity-20 scale-100"
                )} />

                {/* Circular Progress SVG */}
                <div className="relative w-[320px] h-[320px] flex items-center justify-center">
                    <svg className="w-full h-full rotate-[-90deg]">
                        {/* Background Circle */}
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            className="stroke-zinc-800/50"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        {/* Progress Circle - Dynamic Color */}
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            className={cn(
                                "transition-all duration-1000 ease-linear",
                                isRunning ? "stroke-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "stroke-zinc-600"
                            )}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Time Display centered */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn(
                            "text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums transition-all duration-300",
                            isRunning ? "text-white scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "text-zinc-400"
                        )}>
                            {formattedTime}
                        </span>
                        <span className="text-sm text-zinc-600 mt-2 font-medium tracking-widest uppercase">
                            {isRunning ? 'Focando ...' : 'Pausado'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                {/* Duration Presets */}
                <div className="flex justify-center gap-3">
                    {durations.map((duration) => (
                        <button
                            key={duration}
                            onClick={() => setDuration(duration)}
                            disabled={isRunning}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                !isRunning
                                    ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-800"
                                    : "opacity-30 border-transparent text-zinc-700 cursor-not-allowed"
                            )}
                        >
                            {duration}m
                        </button>
                    ))}
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center justify-center gap-6">
                    <Button
                        onClick={reset}
                        size="icon"
                        variant="ghost"
                        className="h-12 w-12 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                        disabled={isSaving || (!isRunning && progress === 0)}
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>

                    {!isRunning ? (
                        <Button
                            onClick={start}
                            className="h-14 w-[280px] bg-white text-black hover:bg-zinc-200 rounded-2xl font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-transform active:scale-95 flex items-center justify-center tracking-wide"
                            disabled={hasCompleted || isSaving}
                        >
                            <Play className="h-5 w-5 mr-3 fill-black relative -top-[1px]" />
                            INICIAR
                        </Button>
                    ) : (
                        <Button
                            onClick={pause}
                            className="h-14 w-[280px] bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10 rounded-2xl font-bold text-base shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-transform active:scale-95 flex items-center justify-center tracking-wide"
                        >
                            <Pause className="h-5 w-5 mr-3 fill-white relative -top-[1px]" />
                            PAUSAR
                        </Button>
                    )}
                </div>

                {/* Status / Success Message */}
                <div className="h-20 flex items-center justify-center">
                    {isSaving && (
                        <div className="text-indigo-400 animate-pulse font-mono text-sm">
                            /// SALVANDO PROGRESSO...
                        </div>
                    )}

                    {hasCompleted && !isSaving && (
                        <div className="flex flex-col items-center gap-3 animate-in zoom-in spin-in-3">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                                <Trophy className="w-6 h-6" />
                                <span>Sessão Finalizada!</span>
                            </div>
                            <Button asChild variant="link" className="text-zinc-500 hover:text-white">
                                <a href="/dashboard" className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
                                </a>
                            </Button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
