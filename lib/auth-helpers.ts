import { mockDb } from "@/lib/mock-db"

export interface CustomSession {
  user: {
    id: string
    email: string
    name: string
  }
}

export async function getCustomSession(): Promise<CustomSession | null> {
  try {
    // In a real app, this would check JWT tokens or session cookies
    // For v0 demo, we'll use the seeded demo user
    const demoUser = mockDb.findUserByEmail("test@test.com")

    if (demoUser) {
      return {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name || "Demo User",
        },
      }
    }

    return null
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getCurrentUser() {
  const session = await getCustomSession()
  return session?.user || null
}
