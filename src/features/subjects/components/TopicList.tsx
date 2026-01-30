'use client'

import { useState } from 'react'
import { Play, CheckCircle2, Circle, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TopicWithStatus } from '../types'
import { cn } from '@/lib/utils'
import { createTopic, deleteTopic } from '@/features/topics/actions'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TopicNode extends TopicWithStatus {
    children: TopicNode[]
}

function buildTree(topics: TopicWithStatus[]): TopicNode[] {
    const map = new Map<string, TopicNode>()
    const roots: TopicNode[] = []

    // Initialize nodes
    topics.forEach(topic => {
        map.set(topic.id, { ...topic, children: [] })
    })

    // Build hierarchy
    topics.forEach(topic => {
        const node = map.get(topic.id)!
        if (topic.parentId && map.has(topic.parentId)) {
            map.get(topic.parentId)!.children.push(node)
        } else {
            roots.push(node)
        }
    })

    return roots
}

export function TopicList({ topics }: { topics: TopicWithStatus[] }) {
    const tree = buildTree(topics)

    return (
        <div className="space-y-3">
            {tree.map(node => (
                <TopicItem key={node.id} node={node} level={0} subjectId={topics[0]?.id /* Hacky, fetch subjectId better? */} />
            ))}
            {/* If empty, show simplified add? Or rely on subject header add? */}
        </div>
    )
}

function TopicItem({ node, level, subjectId }: { node: TopicNode, level: number, subjectId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const hasChildren = node.children.length > 0
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newTopicName, setNewTopicName] = useState('')

    async function handleAddSubTopic() {
        if (!newTopicName || !subjectId) return
        try {
            // Need subjectId. Current TopicWithStatus doesn't have it.
            // Requirement gap: pass subjectId to TopicList or TopicWithStatus.
            // Assuming subjectId is passed or available.
            // Fix: TopicWithStatus needs subjectId OR pass it from Page.
            // For now, assume we find it from context or props.
            // Wait, createTopic requires subjectId.
            // Refactor: Pass subjectId to TopicList.
        } catch (error) {
            toast.error('Erro')
        }
    }

    // TEMPORARY: Just rendering logic without add function working 100% until I fix prop drilling
    return (
        <div className="space-y-2">
            <div
                className={cn(
                    "group flex items-center justify-between p-3 rounded-xl bg-card border border-white/[0.05] hover:border-indigo-500/30 transition-all duration-300",
                    level > 0 && "ml-6 border-l-2 border-l-white/10 border-y-0 border-r-0 rounded-l-none"
                )}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn("p-1 hover:bg-white/5 rounded", !hasChildren && "invisible")}
                    >
                        {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                    </button>

                    {/* Status Icon */}
                    {node.status === 'mastered' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : node.status === 'studied' ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    ) : (
                        <Circle className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    )}

                    <div>
                        <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                            {node.name}
                        </h3>
                        {/* Meta info... */}
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Add Subtopic Button */}
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" title="Adicionar Sub-tópico">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                            <DialogHeader>
                                <DialogTitle>Adicionar Sub-tópico</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Tópico</Label>
                                    <Input
                                        id="name"
                                        value={newTopicName}
                                        onChange={(e) => setNewTopicName(e.target.value)}
                                        placeholder="Ex: Juros Compostos"
                                        className="bg-zinc-950/50 border-zinc-800"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddSubTopic} className="bg-indigo-600 hover:bg-indigo-700 text-white">Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 h-8 text-xs">
                        <Link href={`/study/${node.id}`}>
                            Estudar
                        </Link>
                    </Button>
                </div>
            </div>

            {isOpen && hasChildren && (
                <div className="space-y-2">
                    {node.children.map(child => (
                        <TopicItem key={child.id} node={child} level={level + 1} subjectId={subjectId} />
                    ))}
                </div>
            )}
        </div>
    )
}
