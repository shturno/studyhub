'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, FileText, Video, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createMaterial, deleteMaterial, getMaterials } from '../actions'

interface Material {
    id: string
    type: string
    title: string
    url: string | null
    content: string | null
    createdAt: Date
}

export function MaterialManager({ topicId }: { topicId: string }) {
    const [materials, setMaterials] = useState<Material[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Form state
    const [newMaterial, setNewMaterial] = useState({
        type: 'link',
        title: '',
        url: '',
    })

    useEffect(() => {
        loadMaterials()
    }, [topicId])

    async function loadMaterials() {
        try {
            const data = await getMaterials(topicId)
            setMaterials(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleAdd() {
        if (!newMaterial.title) return toast.error('Digite um título')

        try {
            await createMaterial({
                topicId,
                type: newMaterial.type,
                title: newMaterial.title,
                url: newMaterial.url || undefined
            })
            toast.success('Material adicionado')
            setIsOpen(false)
            setNewMaterial({ type: 'link', title: '', url: '' })
            loadMaterials()
        } catch (error) {
            toast.error('Erro ao adicionar material')
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteMaterial(id)
            toast.success('Material removido')
            setMaterials(materials.filter(m => m.id !== id))
        } catch (error) {
            toast.error('Erro ao remover')
        }
    }

    function getIcon(type: string) {
        switch (type) {
            case 'pdf': return <FileText className="w-4 h-4 text-red-400" />
            case 'video': return <Video className="w-4 h-4 text-blue-400" />
            default: return <LinkIcon className="w-4 h-4 text-zinc-400" />
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Materiais de Estudo</h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white">
                            <Plus className="w-3.5 h-3.5 mr-2" />
                            Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <DialogHeader>
                            <DialogTitle>Novo Material</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={newMaterial.type}
                                    onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}
                                >
                                    <SelectTrigger className="bg-zinc-950/50 border-zinc-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                        <SelectItem value="link">Link</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="video">Vídeo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Título</Label>
                                <Input
                                    value={newMaterial.title}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                    placeholder="Ex: Resumo em PDF"
                                    className="bg-zinc-950/50 border-zinc-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL (Opcional)</Label>
                                <Input
                                    value={newMaterial.url}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                                    placeholder="https://..."
                                    className="bg-zinc-950/50 border-zinc-800"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAdd} className="bg-brand-primary text-white">Salvar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="text-zinc-500 text-xs text-center py-4">Carregando...</div>
            ) : materials.length === 0 ? (
                <div className="text-zinc-600 text-xs text-center py-8 border border-dashed border-white/5 rounded-lg">
                    Nenhum material vinculado
                </div>
            ) : (
                <div className="grid gap-2">
                    {materials.map(material => (
                        <div key={material.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {getIcon(material.type)}
                                <div className="truncate">
                                    <div className="text-sm font-medium text-zinc-200 truncate">{material.title}</div>
                                    {material.url && (
                                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline flex items-center gap-1 truncate">
                                            {material.url}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(material.id)}
                                className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
