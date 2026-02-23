import { Metadata } from 'next'
import { ContestList } from '@/features/contests/components/ContestList'

export const metadata: Metadata = {
    title: 'Meus Concursos | StudyHub',
    description: 'Gerencie seus editais e metas de estudo.'
}

export default function ContestsPage() {
    return (
        <div className="min-h-screen bg-[#080010] text-[#e0e0ff]">
            <div className="px-4 md:px-8 pt-6 pb-4 max-w-5xl mx-auto">
                <div className="font-pixel text-[#00ff41] text-sm mb-1"
                    style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
                    CONCURSOS
                </div>
                <div className="font-mono text-lg text-[#7f7f9f]">
                    Gerencie seus editais e metas.
                </div>
            </div>
            <main className="px-4 md:px-8 py-2 max-w-5xl mx-auto">
                <ContestList />
            </main>
        </div>
    )
}
