'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { User, Settings, Bell, Save } from 'lucide-react'
import { updateProfileSettings } from '@/app/[locale]/(authenticated)/settings/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  initialName: string
  initialEmail: string
  initialPomodoro: number
  initialBreak: number
}

export function SettingsForm({
  initialName,
  initialEmail,
  initialPomodoro,
  initialBreak,
}: Readonly<SettingsFormProps>) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(initialName)
  const [pomodoro, setPomodoro] = useState(initialPomodoro)
  const [breakTime, setBreakTime] = useState(initialBreak)

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await updateProfileSettings({
        name,
        pomodoroDefault: pomodoro,
        breakDefault: breakTime,
      })
      toast.success('Configurações salvas com sucesso!')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if anything changed
  const hasChanges =
    name !== initialName ||
    pomodoro !== initialPomodoro ||
    breakTime !== initialBreak

  return (
    <div className="space-y-6">
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
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-[#020008] border-[#333] text-[#e0e0ff] focus-visible:ring-[#00ff41] rounded-none" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-pixel text-[7px] text-[#7f7f9f]">EMAIL</Label>
            <Input 
              id="email" 
              value={initialEmail} 
              disabled 
              className="bg-[#0a0005]/50 border-[#222] text-[#555] rounded-none cursor-not-allowed" 
            />
            <p className="text-[#555] text-[10px] font-mono mt-1">O email está vinculado ao seu login e não pode ser alterado.</p>
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
            <Input 
              id="pomodoro" 
              type="number" 
              value={pomodoro}
              onChange={(e) => setPomodoro(Number(e.target.value))}
              min={5}
              max={120}
              className="bg-[#020008] border-[#333] text-[#00ff41] focus-visible:ring-[#00ff41] rounded-none font-mono" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="break" className="font-pixel text-[7px] text-[#7f7f9f]">PAUSA (min)</Label>
            <Input 
              id="break" 
              type="number" 
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              min={1}
              max={60}
              className="bg-[#020008] border-[#333] text-[#00ff41] focus-visible:ring-[#00ff41] rounded-none font-mono" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSubmitting || !hasChanges}
            className="flex items-center gap-2 font-pixel text-[8px] px-6 py-3 transition-all rounded-none"
            style={{ 
              backgroundColor: hasChanges ? '#00ff41' : '#020008', 
              color: hasChanges ? '#04000a' : '#555',
              border: hasChanges ? '1px solid #00ff41' : '1px solid #333',
              boxShadow: hasChanges ? '0 0 15px rgba(0,255,65,0.3)' : 'none',
              cursor: isSubmitting || !hasChanges ? 'not-allowed' : 'pointer'
            }}>
            <Save className="w-3 h-3" />
            {isSubmitting ? 'SALVANDO...' : 'SALVAR ALTERACOES'}
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
