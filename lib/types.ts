export interface Track {
  id: string // cuid()
  name: string
}

export interface Lesson {
  id: string // cuid()
  trackId: string
  title: string
  done: boolean
  note?: string
  createdAt: string // ISO – data da última alteração
}
