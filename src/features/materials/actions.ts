'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createMaterial(data: {
    topicId: string
    type: string
    title: string
    url?: string
    content?: string
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    await prisma.material.create({
        data: {
            topicId: data.topicId,
            type: data.type,
            title: data.title,
            url: data.url,
            content: data.content
        }
    })

    revalidatePath('/study/[id]', 'page')
}

export async function getMaterials(topicId: string) {
    const session = await auth()
    if (!session?.user?.id) return []

    return await prisma.material.findMany({
        where: { topicId },
        orderBy: { createdAt: 'desc' }
    })
}

export async function deleteMaterial(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    await prisma.material.delete({
        where: { id }
    })

    revalidatePath('/study/[id]')
}
