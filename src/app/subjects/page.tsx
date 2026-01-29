import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getUserSubjects } from '@/features/subjects/actions'
import { SubjectCard } from '@/features/subjects/components/SubjectCard'

export const dynamic = 'force-dynamic'

export default async function SubjectsPage() {
    const subjects = await getUserSubjects()

    return (
        <div className="min-h-screen bg-[#0c0c0e] text-zinc-100">
            {/* Header */}
            <header className="border-b border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Meus Conteúdos</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {subjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map(subject => (
                            <SubjectCard key={subject.id} subject={subject} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-zinc-500 text-lg">Nenhuma matéria encontrada no seu ciclo atual.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
