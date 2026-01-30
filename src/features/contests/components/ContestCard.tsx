'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Calendar, Award, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteContest } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ContestCardProps {
    contest: {
        id: string
        name: string
        institution: string
        role: string
        examDate?: Date | null
        isPrimary: boolean
    }
}

export function ContestCard({ contest }: ContestCardProps) {
    const router = useRouter()

    async function handleDelete() {
        try {
            await deleteContest(contest.id)
            toast.success('Concurso removido')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao remover concurso')
        }
    }

    return (
        <div className="group relative p-6 rounded-2xl bg-card border border-white/[0.08] hover:border-brand-primary/50 transition-all duration-300">
            {contest.isPrimary && (
                <div className="absolute -top-3 left-6">
                    <Badge className="bg-brand-primary hover:bg-brand-primary text-white border-0 shadow-lg shadow-brand-primary/25">
                        Foco Principal
                    </Badge>
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">
                        {contest.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Building2 className="w-3 h-3" />
                        <span>{contest.institution}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="text-zinc-500">{contest.role}</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {contest.examDate ? (
                        format(new Date(contest.examDate), "d 'of' MMMM, yyyy", { locale: ptBR })
                    ) : (
                        <span className="italic">Data não definida</span>
                    )}
                </div>

                {/* Future: Add Subjects Count */}
            </div>
        </div>
    )
}
