import { Metadata } from 'next'
import { ContestList } from '@/features/contests/components/ContestList'

export const metadata: Metadata = {
    title: 'Meus Concursos | StudyHub',
    description: 'Gerencie seus editais e metas de estudo.'
}

export default function ContestsPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-white/[0.08] bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                            S
                        </div>
                        <span className="font-bold text-lg text-white">StudyHub</span>
                    </div>
                    {/* User Profile / Nav could go here */}
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <ContestList />
            </main>
        </div>
    )
}
