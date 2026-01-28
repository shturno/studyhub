import { Play, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TopicWithStatus } from '../types'
import { cn } from '@/lib/utils'

export function TopicList({ topics }: { topics: TopicWithStatus[] }) {
    return (
        <div className="space-y-3">
            {topics.map(topic => (
                <div
                    key={topic.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-[#18181b] border border-white/[0.05] hover:border-indigo-500/30 hover:bg-[#18181b]/90 transition-all duration-300"
                >
                    <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        {topic.status === 'mastered' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : topic.status === 'studied' ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                        )}

                        <div>
                            <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                {topic.name}
                            </h3>
                            {topic.lastStudiedAt && (
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Último estudo: {new Date(topic.lastStudiedAt).toLocaleDateString('pt-BR')}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button asChild size="sm" className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                        <Link href={`/study/${topic.id}`}>
                            <Play className="w-3.5 h-3.5 mr-2 fill-white" />
                            Estudar
                        </Link>
                    </Button>
                </div>
            ))}
        </div>
    )
}
