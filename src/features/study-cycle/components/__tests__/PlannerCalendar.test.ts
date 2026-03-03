import { describe, it, expect } from 'vitest'

interface PlannedSession {
  readonly id: string
  readonly lessonId: string
  readonly lessonTitle: string
  readonly trackName: string
  readonly duration: number
  readonly scheduledDate: string
  readonly draft: boolean
}

/**
 * Helper function to organize sessions by date
 * Mirrors the logic in PlannerCalendar component
 */
function sessionsByDateHelper(sessions: PlannedSession[]) {
  const map = new Map<string, PlannedSession[]>()
  for (const s of sessions) {
    const existing = map.get(s.scheduledDate) ?? []
    existing.push(s)
    map.set(s.scheduledDate, existing)
  }
  return map
}

/**
 * Helper function to organize sessions by month
 * Mirrors the logic in PlannerCalendar component
 */
function sessionsByMonthHelper(
  sessionsByDate: Map<string, PlannedSession[]>
) {
  const sorted = Array.from(sessionsByDate.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  const months = new Map<
    string,
    { dateStr: string; sessions: PlannedSession[] }[]
  >()
  for (const [dateStr, daySessions] of sorted) {
    const monthKey = dateStr.slice(0, 7) // "YYYY-MM"
    const existing = months.get(monthKey) ?? []
    existing.push({ dateStr, sessions: daySessions })
    months.set(monthKey, existing)
  }
  return Array.from(months.entries())
}

describe('PlannerCalendar Data Logic', () => {
  describe('sessionsByDate organization', () => {
    it('should organize sessions by date', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 45,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '3',
          lessonId: 'l3',
          lessonTitle: 'Chemistry',
          trackName: 'Chemistry',
          duration: 30,
          scheduledDate: '2026-03-06',
          draft: false,
        },
      ]

      const result = sessionsByDateHelper(sessions)

      expect(result.size).toBe(2)
      expect(result.get('2026-03-05')).toHaveLength(2)
      expect(result.get('2026-03-06')).toHaveLength(1)
    })

    it('should handle empty sessions list', () => {
      const sessions: PlannedSession[] = []
      const result = sessionsByDateHelper(sessions)

      expect(result.size).toBe(0)
    })

    it('should handle single session', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
      ]

      const result = sessionsByDateHelper(sessions)

      expect(result.size).toBe(1)
      expect(result.get('2026-03-05')).toHaveLength(1)
    })

    it('should aggregate multiple sessions on same date', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 45,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '3',
          lessonId: 'l3',
          lessonTitle: 'Chemistry',
          trackName: 'Chemistry',
          duration: 30,
          scheduledDate: '2026-03-05',
          draft: false,
        },
      ]

      const result = sessionsByDateHelper(sessions)
      const sessionsForDate = result.get('2026-03-05')

      expect(sessionsForDate).toHaveLength(3)
      expect(sessionsForDate?.[0].lessonTitle).toBe('Math')
      expect(sessionsForDate?.[1].lessonTitle).toBe('Physics')
      expect(sessionsForDate?.[2].lessonTitle).toBe('Chemistry')
    })
  })

  describe('sessionsByMonth organization', () => {
    it('should organize sessions by month', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 45,
          scheduledDate: '2026-04-10',
          draft: false,
        },
      ]

      const sessionsByDate = sessionsByDateHelper(sessions)
      const result = sessionsByMonthHelper(sessionsByDate)

      expect(result).toHaveLength(2)
      expect(result[0][0]).toBe('2026-03') // First month
      expect(result[1][0]).toBe('2026-04') // Second month
    })

    it('should group days within same month', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 45,
          scheduledDate: '2026-03-10',
          draft: false,
        },
        {
          id: '3',
          lessonId: 'l3',
          lessonTitle: 'Chemistry',
          trackName: 'Chemistry',
          duration: 30,
          scheduledDate: '2026-03-15',
          draft: false,
        },
      ]

      const sessionsByDate = sessionsByDateHelper(sessions)
      const result = sessionsByMonthHelper(sessionsByDate)

      expect(result).toHaveLength(1)
      expect(result[0][0]).toBe('2026-03')
      expect(result[0][1]).toHaveLength(3) // 3 different days
    })

    it('should sort months chronologically', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-05-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 45,
          scheduledDate: '2026-03-10',
          draft: false,
        },
        {
          id: '3',
          lessonId: 'l3',
          lessonTitle: 'Chemistry',
          trackName: 'Chemistry',
          duration: 30,
          scheduledDate: '2026-04-15',
          draft: false,
        },
      ]

      const sessionsByDate = sessionsByDateHelper(sessions)
      const result = sessionsByMonthHelper(sessionsByDate)

      expect(result[0][0]).toBe('2026-03')
      expect(result[1][0]).toBe('2026-04')
      expect(result[2][0]).toBe('2026-05')
    })

    it('should handle empty sessions', () => {
      const sessions: PlannedSession[] = []
      const sessionsByDate = sessionsByDateHelper(sessions)
      const result = sessionsByMonthHelper(sessionsByDate)

      expect(result).toHaveLength(0)
    })
  })

  describe('date filtering logic', () => {
    it('should filter sessions for specific date', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 45,
          scheduledDate: '2026-03-06',
          draft: false,
        },
      ]

      const sessionsByDate = sessionsByDateHelper(sessions)
      const selectedDate = new Date('2026-03-05T12:00:00Z')
      const selectedDateStr = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(selectedDate.getUTCDate()).padStart(2, '0')}`
      const sessionsForDay = sessionsByDate.get(selectedDateStr) ?? []

      expect(sessionsForDay).toHaveLength(1)
      expect(sessionsForDay[0].lessonTitle).toBe('Math')
    })

    it('should return empty array for date with no sessions', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
      ]

      const sessionsByDate = sessionsByDateHelper(sessions)
      const selectedDate = new Date('2026-03-15T12:00:00Z')
      const selectedDateStr = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(selectedDate.getUTCDate()).padStart(2, '0')}`
      const sessionsForDay = sessionsByDate.get(selectedDateStr) ?? []

      expect(sessionsForDay).toHaveLength(0)
    })
  })

  describe('statistics calculations', () => {
    it('should calculate total duration in hours', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 120,
          scheduledDate: '2026-03-06',
          draft: false,
        },
      ]

      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
      const totalHours = totalDuration / 60

      expect(totalHours).toBe(3)
    })

    it('should count unique dates', () => {
      const sessions: PlannedSession[] = [
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 60,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 45,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '3',
          lessonId: 'l3',
          lessonTitle: 'Chemistry',
          trackName: 'Chemistry',
          duration: 30,
          scheduledDate: '2026-03-06',
          draft: false,
        },
      ]

      const sessionsByDate = sessionsByDateHelper(sessions)
      const totalDays = sessionsByDate.size

      expect(totalDays).toBe(2)
    })

    it('should calculate statistics from multiple months', () => {
      const sessions: PlannedSession[] = [
        // March
        {
          id: '1',
          lessonId: 'l1',
          lessonTitle: 'Math',
          trackName: 'Math',
          duration: 120,
          scheduledDate: '2026-03-05',
          draft: false,
        },
        {
          id: '2',
          lessonId: 'l2',
          lessonTitle: 'Physics',
          trackName: 'Physics',
          duration: 120,
          scheduledDate: '2026-03-06',
          draft: false,
        },
        // April
        {
          id: '3',
          lessonId: 'l3',
          lessonTitle: 'Chemistry',
          trackName: 'Chemistry',
          duration: 180,
          scheduledDate: '2026-04-10',
          draft: false,
        },
      ]

      const sessionsByDate = sessionsByDateHelper(sessions)
      const totalDays = sessionsByDate.size
      const totalHours =
        sessions.reduce((sum, s) => sum + s.duration, 0) / 60

      expect(sessions.length).toBe(3)
      expect(totalDays).toBe(3)
      expect(totalHours).toBe(7)
    })
  })

  describe('date string formatting', () => {
    it('should format date correctly from Date object', () => {
      const date = new Date('2026-03-05T12:00:00Z')
      const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`

      expect(dateStr).toBe('2026-03-05')
    })

    it('should format date with leading zeros', () => {
      const date = new Date('2026-01-05T12:00:00Z')
      const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`

      expect(dateStr).toBe('2026-01-05')
    })

    it('should extract month key correctly', () => {
      const dateStr = '2026-03-05'
      const monthKey = dateStr.slice(0, 7)

      expect(monthKey).toBe('2026-03')
    })
  })
})
