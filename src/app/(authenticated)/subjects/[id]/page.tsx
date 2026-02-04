import { ArrowLeft, PieChart } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSubjectDetails } from '@/features/subjects/actions'
import { TopicList } from '@/features/subjects/components/TopicList'
import { Progress } from '@/components/ui/progress'

interface SubjectDetailsPageProps {
    params: Promise<{
        id: string
    }>
}

export const dynamic = 'force-dynamic'

export default async function SubjectDetailsPage(props: SubjectDetailsPageProps) {
    const params = await props.params;
    const data = await getSubjectDetails(params.id)

    if (!data) {
        notFound()
    }

    const { subjectName, topics } = data
    const completedTopics = topics.filter(t => t.status !== 'pending').length
    const progress = Math.round((completedTopics / topics.length) * 100)

    return (
        <div className="min-h-screen text-zinc-100">
            {/* Header */}
            <header className="border-b border-white/[0.08] bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link href="/subjects" className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight truncate">{subjectName}</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-10">

                {/* Stats Overview */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-card border border-white/[0.08] flex flex-col justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Progresso Geral</h3>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-4xl font-bold text-white">{progress}%</span>
                            <span className="text-sm text-zinc-500 mb-1">concluído</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-white/[0.08] flex flex-col justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Tópicos</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-white">{completedTopics}</span>
                            <span className="text-sm text-zinc-500 mb-1">de {topics.length} estudados</span>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-white/[0.08] flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-5">
                            <PieChart className="w-20 h-20" />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Mastery</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-emerald-400">
                                {topics.filter(t => t.status === 'mastered').length}
                            </span>
                            <span className="text-sm text-zinc-500 mb-1">tópicos dominados</span>
                        </div>
                    </div>
                </section>

                {/* Topics List */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-zinc-200">Tópicos do Edital</h2>
                        <span className="text-xs text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
                            {topics.length} itens
                        </span>
                    </div>
                    <TopicList topics={topics} />
                </section>

            </main>
        </div>
    )
}
