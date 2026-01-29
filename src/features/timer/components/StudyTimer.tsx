"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StudyTimerProps {
  lessonId: string
  lessonTitle: string
  onSessionComplete?: () => void
}

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

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            handleSessionComplete()
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleSessionComplete = async () => {
    const studiedMinutes = Math.ceil((totalSessionTime - timeLeft) / 60)

    if (studiedMinutes > 0) {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/study-logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ minutes: studiedMinutes }),
        })

        if (response.ok) {
          setSessionMinutes((prev) => prev + studiedMinutes)
          toast({
            title: "Sessão salva!",
            description: `${studiedMinutes} minutos de estudo foram registrados.`,
          })
          onSessionComplete?.()
        } else {
          toast({
            title: "Erro",
            description: "Erro ao salvar sessão de estudo",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao salvar sessão de estudo",
          variant: "destructive",
        })
      }
    }
  }

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = async () => {
    setIsRunning(false)
    if (timeLeft < totalSessionTime) {
      await handleSessionComplete()
    }
    setTimeLeft(totalSessionTime)
  }

  const handleReset = () => {
    setIsRunning(false)
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Timer de Estudo</CardTitle>
        <p className="text-sm text-center text-muted-foreground">{lessonTitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-emerald-600 mb-2">{formatTime(timeLeft)}</div>
          <Progress value={progress} className="h-2" />
        </div>

        {}
        <div className="flex justify-center space-x-2">
          <Button
            variant={totalSessionTime === 15 * 60 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimerDuration(15)}
            disabled={isRunning}
          >
            15min
          </Button>
          <Button
            variant={totalSessionTime === 25 * 60 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimerDuration(25)}
            disabled={isRunning}
          >
            25min
          </Button>
          <Button
            variant={totalSessionTime === 45 * 60 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimerDuration(45)}
            disabled={isRunning}
          >
            45min
          </Button>
          <Button
            variant={totalSessionTime === 60 * 60 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimerDuration(60)}
            disabled={isRunning}
          >
            60min
          </Button>
        </div>

        {}
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg" className="px-8">
              <Play className="h-5 w-5 mr-2" />
              Iniciar
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" className="px-8" variant="secondary">
              <Pause className="h-5 w-5 mr-2" />
              Pausar
            </Button>
          )}

          <Button onClick={handleStop} size="lg" variant="outline">
            <Square className="h-5 w-5 mr-2" />
            Parar
          </Button>

          <Button onClick={handleReset} size="lg" variant="outline">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>

        {}
        {sessionMinutes > 0 && (
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Sessão atual: <span className="font-semibold">{sessionMinutes} minutos</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
