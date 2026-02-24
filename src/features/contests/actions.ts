'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getContests() {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.contest.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: {
            isPrimary: 'desc'
        }
    })
}

export async function createContest(data: {
    name: string
    institution: string
    role: string
    examDate?: Date
    isPrimary?: boolean
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    if (data.isPrimary) {

        await prisma.contest.updateMany({
            where: { userId: session.user.id, isPrimary: true },
            data: { isPrimary: false }
        })
    }

    await prisma.contest.create({
        data: {
            ...data,
            userId: session.user.id
        }
    })

    revalidatePath('/contests')
    revalidatePath('/dashboard')
}

export async function deleteContest(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    await prisma.contest.delete({
        where: {
            id,
            userId: session.user.id
        }
    })

    revalidatePath('/contests')
}
