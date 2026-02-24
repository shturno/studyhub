'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface UpdateSettingsParams {
  name: string
  pomodoroDefault: number
  breakDefault: number
}

export async function updateProfileSettings(data: UpdateSettingsParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error('Não autorizado')
    }

    const { name, pomodoroDefault, breakDefault } = data

    if (pomodoroDefault < 5 || pomodoroDefault > 120) {
      throw new Error('O tempo de foco deve estar entre 5 e 120 minutos')
    }
    if (breakDefault < 1 || breakDefault > 60) {
      throw new Error('O tempo de pausa deve estar entre 1 e 60 minutos')
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const currentSettings = typeof user.settings === 'object' && user.settings !== null 
      ? user.settings 
      : {}

    const updatedSettings = {
      ...currentSettings,
      pomodoroDefault,
      breakDefault,
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim() || user.name,
        settings: updatedSettings,
      },
    })

    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Erro ao atualizar configurações')
  }
}
