import { Progress } from '@/components/ui/progress'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { SubjectStats } from '../types'

export function SubjectCard({ subject }: { readonly subject: SubjectStats }) {
    return (
        <Link href={`/subjects/${subject.id}`} className="group block">
            <div className="h-full p-5 transition-all duration-100 hover:-translate-y-0.5"
                style={{
                    border: '2px solid rgba(0,255,65,0.35)',
                    background: '#04000a',
                    boxShadow: '4px 4px 0px rgba(0,255,65,0.1)',
                }}>

                {/* Icon + arrow row */}
                <div className="flex justify-between items-center mb-3">
                    <div className="w-10 h-10 flex items-center justify-center text-[#7f7f9f] group-hover:text-[#00ff41] group-hover:bg-[#00ff41]/10 transition-colors"
                        style={{ border: '2px solid rgba(0,255,65,0.2)' }}>
                        <span className="font-pixel text-xs">{subject.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="font-pixel text-[8px] text-[#7f7f9f] group-hover:text-[#00ff41] transition-colors">►</span>
                </div>

                {/* Subject name */}
                <div className="font-mono text-xl text-[#e0e0ff] group-hover:text-[#00ff41] transition-colors line-clamp-2 min-h-[3.5rem] flex items-center mb-4">
                    {subject.name}
                </div>

                {/* Progress section */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                        <span className="font-pixel text-[7px] text-[#7f7f9f]">PROGRESSO</span>
                        <span className="font-pixel text-[7px] text-[#00ff41]">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 font-mono text-base text-[#555]">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.round(subject.totalMinutesStudied / 60)}h</span>
                    </div>
                    <span className="text-[#333]">·</span>
                    <span>{subject.completedTopics}/{subject.topicsCount} tópicos</span>
                </div>
            </div>
        </Link>
    )
}
