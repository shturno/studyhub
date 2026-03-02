"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface StudyTimerProps {
  readonly lessonId: string
  readonly lessonTitle: string
  readonly onSessionComplete?: () => void
}

const DURATIONS = [15, 25, 45, 60]

export function StudyTimer({ lessonId, lessonTitle, onSessionComplete }: StudyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionMinutes, setSessionMinutes] = useState(0)
  const [totalSessionTime, setTotalSessionTime] = useState(25 * 60)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalSessionTime - timeLeft) / totalSessionTime) * 100

  const saveSession = useCallback(async (studiedMinutes: number) => {
    if (studiedMinutes <= 0) return
    await fetch(`/api/lessons/${lessonId}/study-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: studiedMinutes }),
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        setSessionMinutes((prev) => prev + studiedMinutes)
        toast({ title: "Sessão salva!" })
        onSessionComplete?.()
      })
      .catch(() => toast({ title: "Erro ao salvar sessão", variant: "destructive" }))
  }, [lessonId, toast, onSessionComplete])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            const studiedMinutes = Math.ceil(totalSessionTime / 60)
            void saveSession(studiedMinutes)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, totalSessionTime, saveSession])

  const handleStop = async () => {
    setIsRunning(false)
    if (timeLeft < totalSessionTime) {
      const studiedMinutes = Math.ceil((totalSessionTime - timeLeft) / 60)
      await saveSession(studiedMinutes)
    }
    setTimeLeft(totalSessionTime)
  }

  const setTimerDuration = (minutes: number) => {
    if (!isRunning) {
      const seconds = minutes * 60
      setTimeLeft(seconds)
      setTotalSessionTime(seconds)
    }
  }

  return (
    <div className="w-full space-y-5" style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a', padding: '24px' }}>
      <div className="text-center">
        <div className="font-pixel text-[7px] text-[#7f7f9f] mb-1">TIMER DE ESTUDO</div>
        <div className="font-mono text-base text-[#7f7f9f]">{lessonTitle}</div>
      </div>

      <div className="text-center">
        <div className={cn(
          "font-pixel text-5xl tracking-widest mb-3 transition-all duration-300",
          isRunning ? "text-[#00ff41]" : "text-[#7f7f9f]"
        )}
          style={isRunning ? { textShadow: '0 0 20px rgba(0,255,65,0.8)' } : {}}>
          {formatTime(timeLeft)}
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex justify-center gap-2">
        {DURATIONS.map((d) => (
          <button key={d}
            onClick={() => setTimerDuration(d)}
            disabled={isRunning}
            className={cn(
              "font-pixel text-[7px] px-3 py-1.5 transition-all",
              totalSessionTime === d * 60
                ? "bg-[#00ff41] text-black"
                : "text-[#555] hover:text-[#00ff41] disabled:opacity-30"
            )}
            style={{ border: totalSessionTime === d * 60 ? '2px solid #00ff41' : '2px solid #333' }}>
            {d}m
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        {!isRunning ? (
          <Button onClick={() => setIsRunning(true)} size="lg">
            <Play className="h-4 w-4 mr-2" />
            INICIAR
          </Button>
        ) : (
          <Button onClick={() => setIsRunning(false)} size="lg" variant="outline">
            <Pause className="h-4 w-4 mr-2" />
            PAUSAR
          </Button>
        )}
        <Button onClick={handleStop} size="lg" variant="outline">
          <Square className="h-4 w-4 mr-2" />
          PARAR
        </Button>
        <Button onClick={() => { setIsRunning(false); setTimeLeft(totalSessionTime) }} size="lg" variant="outline">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {sessionMinutes > 0 && (
        <div className="text-center p-3" style={{ border: '1px solid rgba(0,255,65,0.3)', background: '#020008' }}>
          <span className="font-pixel text-[7px] text-[#00ff41]">SESSAO ATUAL: {sessionMinutes} MIN</span>
        </div>
      )}
    </div>
  )
}
