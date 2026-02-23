import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { User, Settings, Bell } from "lucide-react"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const { user } = session

    return (
        <div className="min-h-screen bg-[#080010] p-4 md:p-8 max-w-3xl mx-auto space-y-6">

            
            <div className="pb-4" style={{ borderBottom: '2px solid rgba(0,255,65,0.3)' }}>
                <div className="font-pixel text-[#00ff41] text-sm mb-1"
                    style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
                    CONFIG
                </div>
                <div className="font-mono text-xl text-[#7f7f9f]">Gerencie sua conta e preferências.</div>
            </div>

            
            <div className="p-5 space-y-5" style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a' }}>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(0,255,65,0.15)' }}>
                    <div className="w-8 h-8 flex items-center justify-center text-[#00ff41]"
                        style={{ border: '2px solid rgba(0,255,65,0.4)' }}>
                        <User className="w-4 h-4" />
                    </div>
                    <span className="font-pixel text-[8px] text-[#00ff41]">PERFIL</span>
                </div>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-pixel text-[7px] text-[#7f7f9f]">NOME</Label>
                        <Input id="name" defaultValue={user.name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-pixel text-[7px] text-[#7f7f9f]">EMAIL</Label>
                        <Input id="email" defaultValue={user.email || ''} disabled />
                    </div>
                </div>
            </div>

            
            <div className="p-5 space-y-5" style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a' }}>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(0,255,65,0.15)' }}>
                    <div className="w-8 h-8 flex items-center justify-center text-[#00ff41]"
                        style={{ border: '2px solid rgba(0,255,65,0.4)' }}>
                        <Settings className="w-4 h-4" />
                    </div>
                    <span className="font-pixel text-[8px] text-[#00ff41]">PREFERENCIAS DE ESTUDO</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="pomodoro" className="font-pixel text-[7px] text-[#7f7f9f]">FOCO (min)</Label>
                        <Input id="pomodoro" type="number" defaultValue={25} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="break" className="font-pixel text-[7px] text-[#7f7f9f]">PAUSA (min)</Label>
                        <Input id="break" type="number" defaultValue={5} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        disabled
                        className="font-pixel text-[8px] text-[#555] px-5 py-2.5 cursor-not-allowed"
                        style={{ border: '2px solid #333' }}>
                        SALVAR (EM BREVE)
                    </button>
                </div>
            </div>

            
            <div className="p-5 opacity-40" style={{ border: '2px solid #333', background: '#04000a' }}>
                <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-[#555]" />
                    <span className="font-pixel text-[8px] text-[#555]">NOTIFICACOES</span>
                    <span className="font-pixel text-[6px] text-[#333] ml-2">— EM DESENVOLVIMENTO</span>
                </div>
            </div>
        </div>
    )
}
