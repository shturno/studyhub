import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

export const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>()

beforeEach(() => {
  mockReset(prismaMock)
})
