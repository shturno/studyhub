'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2, Calendar, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { deleteContest } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ContestCardProps {
    readonly contest: {
        readonly id: string
        readonly slug: string
        readonly name: string
        readonly institution: string
        readonly role: string
        readonly examDate?: Date | null
        readonly isPrimary: boolean
    }
}

export function ContestCard({ contest }: ContestCardProps) {
    const router = useRouter()

    async function handleDelete() {
        await deleteContest(contest.id)
            .then(() => {
                toast.success('Concurso removido')
                router.refresh()
            })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : 'Erro desconhecido'
                toast.error(`Erro ao remover concurso: ${message}`)
            })
    }

    return (
        <div className="group relative p-5 hover:-translate-y-0.5 transition-transform duration-100"
            style={{ border: '2px solid rgba(0,255,65,0.4)', background: '#04000a', boxShadow: '4px 4px 0px rgba(0,255,65,0.15)' }}>

            
            {contest.isPrimary && (
                <div className="absolute -top-3 left-4">
                    <Badge variant="gold">★ FOCO PRINCIPAL</Badge>
                </div>
            )}

            
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="font-mono text-2xl text-[#e0e0ff] group-hover:text-[#00ff41] transition-colors truncate mb-1">
                        {contest.name}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-base text-[#7f7f9f]">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{contest.institution}</span>
                        <span className="text-[#333]">·</span>
                        <span className="truncate text-[#555]">{contest.role}</span>
                    </div>
                </div>

                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-[#ff006e] transition-all p-1"
                    aria-label="Remover concurso"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            
            <div className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid rgba(0,255,65,0.15)' }}>
                <div className="flex items-center gap-2 font-mono text-base text-[#7f7f9f]">
                    <Calendar className="w-3.5 h-3.5 text-[#555]" />
                    {contest.examDate ? (
                        <span>{format(new Date(contest.examDate), "d 'de' MMMM, yyyy", { locale: ptBR })}</span>
                    ) : (
                        <span className="text-[#444] italic">Data não definida</span>
                    )}
                </div>

                <Link href={`/contests/${contest.slug}`}>
                    <button className="font-pixel text-[7px] text-[#00ff41] px-3 py-1.5 hover:bg-[#00ff41] hover:text-black transition-all"
                        style={{ border: '2px solid rgba(0,255,65,0.5)' }}>
                        ► VER
                    </button>
                </Link>
            </div>
        </div>
    )
}
