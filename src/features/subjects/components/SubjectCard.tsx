import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SubjectStats } from '../types'

export function SubjectCard({ subject }: { subject: SubjectStats }) {
    return (
        <Link href={`/subjects/${subject.id}`} className="group">
            <Card className="h-full bg-card border-border hover:border-primary/50 transition-all duration-300 hover:bg-card/80 group-hover:translate-y-[-2px]">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <CardTitle className="mt-4 text-lg font-bold text-card-foreground group-hover:text-primary line-clamp-2 min-h-[3.5rem] flex items-center">
                        {subject.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                            <span>Progresso</span>
                            <span>{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-1.5 bg-secondary" indicatorClassName="bg-primary" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{Math.round(subject.totalMinutesStudied / 60)}h estudadas</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            <span>{subject.completedTopics}/{subject.topicsCount} tópicos</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
