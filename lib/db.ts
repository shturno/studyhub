// Simple IndexedDB wrapper using idb-keyval approach
import { get, set, keys, del, clear } from "idb-keyval"

export interface Track {
  id: string
  name: string
}

export interface Lesson {
  id: string
  trackId: string
  title: string
  done: boolean
  note?: string
  createdAt: string
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Initialize with seed data if empty
async function initializeData() {
  const existingTracks = await getTracks()
  if (existingTracks.length > 0) return

  // Seed tracks
  const tracks: Track[] = [
    { id: "track-1", name: "Java" },
    { id: "track-2", name: "Spring Boot" },
    { id: "track-3", name: "Docker" },
  ]

  for (const track of tracks) {
    await set(`track:${track.id}`, track)
  }

  // Seed lessons for Java track
  const lessons: Lesson[] = [
    {
      id: "lesson-1",
      trackId: "track-1",
      title: "Instalar JDK",
      done: false,
      note: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: "lesson-2",
      trackId: "track-1",
      title: "Hello World no VS Code",
      done: false,
      note: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: "lesson-3",
      trackId: "track-1",
      title: "Tipos primitivos",
      done: false,
      note: "",
      createdAt: new Date().toISOString(),
    },
  ]

  for (const lesson of lessons) {
    await set(`lesson:${lesson.id}`, lesson)
  }
}

export async function getTracks(): Promise<Track[]> {
  const allKeys = await keys()
  const trackKeys = allKeys.filter((key) => typeof key === "string" && key.startsWith("track:"))
  const tracks: Track[] = []

  for (const key of trackKeys) {
    const track = await get(key)
    if (track) tracks.push(track)
  }

  if (tracks.length === 0) {
    await initializeData()
    return getTracks()
  }

  return tracks.sort((a, b) => a.name.localeCompare(b.name))
}

export async function createTrack(name: string): Promise<Track> {
  const track: Track = {
    id: generateId(),
    name,
  }
  await set(`track:${track.id}`, track)
  return track
}

export async function updateTrack(id: string, updates: Partial<Track>): Promise<Track> {
  const existing = await get(`track:${id}`)
  if (!existing) throw new Error("Track not found")

  const updated = { ...existing, ...updates }
  await set(`track:${id}`, updated)
  return updated
}

export async function deleteTrack(id: string): Promise<void> {
  // Delete track
  await del(`track:${id}`)

  // Delete associated lessons
  const lessons = await getLessons(id)
  for (const lesson of lessons) {
    await del(`lesson:${lesson.id}`)
  }
}

export async function getLessons(trackId?: string): Promise<Lesson[]> {
  const allKeys = await keys()
  const lessonKeys = allKeys.filter((key) => typeof key === "string" && key.startsWith("lesson:"))
  const lessons: Lesson[] = []

  for (const key of lessonKeys) {
    const lesson = await get(key)
    if (lesson && (!trackId || lesson.trackId === trackId)) {
      lessons.push(lesson)
    }
  }

  return lessons.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function createLesson(title: string, trackId: string): Promise<Lesson> {
  const lesson: Lesson = {
    id: generateId(),
    trackId,
    title,
    done: false,
    note: "",
    createdAt: new Date().toISOString(),
  }
  await set(`lesson:${lesson.id}`, lesson)
  return lesson
}

export async function updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson> {
  const existing = await get(`lesson:${id}`)
  if (!existing) throw new Error("Lesson not found")

  const updated = { ...existing, ...updates }
  await set(`lesson:${id}`, updated)
  return updated
}

export async function deleteLesson(id: string): Promise<void> {
  await del(`lesson:${id}`)
}

export async function exportData() {
  const tracks = await getTracks()
  const lessons = await getLessons()

  return {
    tracks,
    lessons,
    exportedAt: new Date().toISOString(),
  }
}

export async function importData(data: { tracks: Track[]; lessons: Lesson[] }) {
  // Clear existing data
  await clear()

  // Import tracks
  for (const track of data.tracks) {
    await set(`track:${track.id}`, track)
  }

  // Import lessons
  for (const lesson of data.lessons) {
    await set(`lesson:${lesson.id}`, lesson)
  }
}

// Export a db object for compatibility
export const db = {
  init: async () => {
    await initializeData()
  },
}
