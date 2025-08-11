// Mock database service using IndexedDB for persistence
import { db } from "./db"

export type { User, Track, Lesson, StudyLog } from "./db"

class MockDatabase {
  async findUserByEmail(email: string) {
    return await db.findUserByEmail(email)
  }

  async findUserById(id: string) {
    return await db.findUserById(id)
  }

  async createUser(data: any) {
    return await db.createUser(data)
  }

  async findTracksByUserId(userId: string) {
    return await db.findTracksByUserId(userId)
  }

  async findTrackById(id: string, userId: string) {
    return await db.findTrackById(id, userId)
  }

  async createTrack(data: any) {
    return await db.createTrack(data)
  }

  async updateTrack(id: string, userId: string, data: any) {
    return await db.updateTrack(id, userId, data)
  }

  async deleteTrack(id: string, userId: string) {
    return await db.deleteTrack(id, userId)
  }

  async findLessonsByTrackId(trackId: string) {
    return await db.findLessonsByTrackId(trackId)
  }

  async findLessonById(id: string) {
    return await db.findLessonById(id)
  }

  async createLesson(data: any) {
    return await db.createLesson(data)
  }

  async updateLesson(id: string, data: any) {
    return await db.updateLesson(id, data)
  }

  async deleteLesson(id: string) {
    return await db.deleteLesson(id)
  }

  async findStudyLogsByLessonId(lessonId: string) {
    return await db.findStudyLogsByLessonId(lessonId)
  }

  async findStudyLogsByUserId(userId: string) {
    return await db.findStudyLogsByUserId(userId)
  }

  async createStudyLog(data: any) {
    return await db.createStudyLog(data)
  }

  getTracksWithLessonsAndLogs(userId: string) {
    return db.getTracksWithLessonsAndLogs(userId)
  }

  getTrackById(trackId: string, userId: string) {
    return db.getTrackById(trackId, userId)
  }

  getLessonById(lessonId: string, userId: string) {
    return db.getLessonById(lessonId, userId)
  }

  init() {
    // IndexedDB initialization is handled automatically
  }
}

export const mockDb = new MockDatabase()

// Initialize on client side
if (typeof window !== "undefined") {
  mockDb.init()
}
