"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface SessionModalContextType {
  isOpen: boolean
  openModal: (lessonId?: string, trackId?: string) => void
  closeModal: () => void
  lessonId: string | null
  trackId: string | null
}

const SessionModalContext = createContext<SessionModalContextType | undefined>(undefined)

export function SessionModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [trackId, setTrackId] = useState<string | null>(null)

  const openModal = (lessonId?: string, trackId?: string) => {
    setLessonId(lessonId || null)
    setTrackId(trackId || null)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setLessonId(null)
    setTrackId(null)
  }

  return (
    <SessionModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        lessonId,
        trackId,
      }}
    >
      {children}
    </SessionModalContext.Provider>
  )
}

export function useSessionModal() {
  const context = useContext(SessionModalContext)
  if (context === undefined) {
    throw new Error("useSessionModal must be used within a SessionModalProvider")
  }
  return context
}
