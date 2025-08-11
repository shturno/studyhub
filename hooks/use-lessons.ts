"use client"

import { useState, useEffect } from "react"
import type { Lesson } from "@/lib/types"
import { getLessons, createLesson, updateLesson, deleteLesson } from "@/lib/db"

export function useLessons(trackId?: string) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  const loadLessons = async () => {
    try {
      const data = await getLessons(trackId)
      setLessons(data)
    } catch (error) {
      console.error("Error loading lessons:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLessons()
  }, [trackId])

  const addLesson = async (title: string, trackId: string) => {
    try {
      const newLesson = await createLesson(title, trackId)
      setLessons((prev) => [...prev, newLesson])
      return newLesson
    } catch (error) {
      console.error("Error creating lesson:", error)
      throw error
    }
  }

  const editLesson = async (id: string, updates: Partial<Omit<Lesson, "id" | "trackId" | "createdAt">>) => {
    try {
      const updatedLesson = await updateLesson(id, updates)
      setLessons((prev) => prev.map((l) => (l.id === id ? updatedLesson : l)))
      return updatedLesson
    } catch (error) {
      console.error("Error updating lesson:", error)
      throw error
    }
  }

  const toggleLesson = async (id: string) => {
    const lesson = lessons.find((l) => l.id === id)
    if (!lesson) return

    return editLesson(id, { done: !lesson.done })
  }

  const removeLesson = async (id: string) => {
    try {
      await deleteLesson(id)
      setLessons((prev) => prev.filter((l) => l.id !== id))
    } catch (error) {
      console.error("Error deleting lesson:", error)
      throw error
    }
  }

  return {
    lessons,
    loading,
    addLesson,
    editLesson,
    toggleLesson,
    removeLesson,
    refresh: loadLessons,
  }
}
