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

    const baseSlug = data.name.toLowerCase().trim().replaceAll(/[^a-z0-9]+/g, '-')
    const uniqueSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const finalSlug = `${baseSlug}-${uniqueSuffix}`

    await prisma.contest.create({
        data: {
            ...data,
            slug: finalSlug,
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
