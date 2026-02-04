import { prisma } from '@/lib/prisma'
import { TimerDisplay } from '@/features/timer/components/TimerDisplay'
import { MaterialManager } from '@/features/materials/components/MaterialManager'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface StudyPageProps {
    params: Promise<{
        topicId: string
    }>
}

export default async function StudyPage(props: StudyPageProps) {
    const params = await props.params;
    const topic = await prisma.topic.findUnique({
        where: { id: params.topicId },
        include: {
            subject: true
        }
    })

    if (!topic) {
        notFound()
    }

    return (
        <div className="min-h-screen text-zinc-100 flex flex-col">
            {/* Minimal Header */}
            <header className="p-6">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Dashboard
                </Link>
            </header>

            {/* Main Content - Centered */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[400px]">
                    <TimerDisplay
                        topicId={topic.id}
                        topicName={topic.name}
                        subjectName={topic.subject.name}
                    />
                </div>

                <div className="space-y-6">
                    <MaterialManager topicId={topic.id} />
                </div>
            </main>
        </div>
    )
}
