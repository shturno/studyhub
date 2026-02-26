import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "@/features/settings/components/SettingsForm"

export default async function SettingsPage({ params }: { params: { locale: string } }) {
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const { user: sessionUser } = session

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id }
    })

    if (!user) {
      redirect("/login")
    }

    const settings = typeof user.settings === 'object' && user.settings !== null ? user.settings as Record<string, unknown> : {}
    const pomodoroDefault = Number(settings.pomodoroDefault) || 25
    const breakDefault = Number(settings.breakDefault) || 5
    const userLocale = (settings.locale as string) || params.locale || 'pt'

    return (
        <div className="min-h-screen bg-[#080010] p-4 md:p-8 max-w-3xl mx-auto space-y-6">
            <div className="pb-4" style={{ borderBottom: '2px solid rgba(0,255,65,0.3)' }}>
                <div className="font-pixel text-[#00ff41] text-sm mb-1"
                    style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
                    CONFIGURACAO E PERFIL
                </div>
                <div className="font-mono text-xl text-[#7f7f9f]">Gerencie sua conta e regras de sistema.</div>
            </div>

            <SettingsForm 
              initialName={user.name || ''} 
              initialEmail={user.email || ''} 
              initialPomodoro={pomodoroDefault} 
              initialBreak={breakDefault}
              initialLocale={userLocale}
            />
        </div>
    )
}
