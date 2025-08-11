"use client"

import { useState, useEffect } from "react"
import type { Track } from "@/lib/types"
import { getTracks, createTrack, updateTrack, deleteTrack } from "@/lib/db"

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  const loadTracks = async () => {
    try {
      const data = await getTracks()
      setTracks(data)
    } catch (error) {
      console.error("Error loading tracks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracks()
  }, [])

  const addTrack = async (name: string) => {
    try {
      const newTrack = await createTrack(name)
      setTracks((prev) => [...prev, newTrack])
      return newTrack
    } catch (error) {
      console.error("Error creating track:", error)
      throw error
    }
  }

  const editTrack = async (id: string, name: string) => {
    try {
      const updatedTrack = await updateTrack(id, { name })
      setTracks((prev) => prev.map((t) => (t.id === id ? updatedTrack : t)))
      return updatedTrack
    } catch (error) {
      console.error("Error updating track:", error)
      throw error
    }
  }

  const removeTrack = async (id: string) => {
    try {
      await deleteTrack(id)
      setTracks((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error("Error deleting track:", error)
      throw error
    }
  }

  return {
    tracks,
    loading,
    addTrack,
    editTrack,
    removeTrack,
    refresh: loadTracks,
  }
}
