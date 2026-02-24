'use client'

import { useState, useEffect, useCallback } from 'react'
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
    readonly id: string
    readonly type: string
    readonly title: string
    readonly url: string | null
    readonly content: string | null
    readonly createdAt: Date
}

export function MaterialManager({ topicId }: { readonly topicId: string }) {
    const [materials, setMaterials] = useState<Material[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [newMaterial, setNewMaterial] = useState({ type: 'link', title: '', url: '' })

    const loadMaterials = useCallback(async () => {
        const data = await getMaterials(topicId)
            .catch(() => [] as Material[])
        setMaterials(data)
        setIsLoading(false)
    }, [topicId])

    useEffect(() => {
        void loadMaterials()
    }, [loadMaterials])

    async function handleAdd() {
        if (!newMaterial.title) { toast.error('Digite um título'); return }

        await createMaterial({
            topicId,
            type: newMaterial.type,
            title: newMaterial.title,
            url: newMaterial.url || undefined
        })
            .then(() => {
                toast.success('Material adicionado')
                setIsOpen(false)
                setNewMaterial({ type: 'link', title: '', url: '' })
                void loadMaterials()
            })
            .catch(() => toast.error('Erro ao adicionar material'))
    }

    async function handleDelete(id: string) {
        await deleteMaterial(id)
            .then(() => {
                toast.success('Material removido')
                setMaterials(materials.filter(m => m.id !== id))
            })
            .catch(() => toast.error('Erro ao remover'))
    }

    function getIcon(type: string) {
        if (type === 'pdf') return <FileText className="w-4 h-4 text-[#ff006e]" />
        if (type === 'video') return <Video className="w-4 h-4 text-[#7b61ff]" />
        return <LinkIcon className="w-4 h-4 text-[#00ff41]" />
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="font-pixel text-[7px] text-[#00ff41]">MATERIAIS</span>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            ADD
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>NOVO MATERIAL</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>TIPO</Label>
                                <Select
                                    value={newMaterial.type}
                                    onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="link">Link</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="video">Vídeo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>TITULO</Label>
                                <Input
                                    value={newMaterial.title}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                    placeholder="Ex: Resumo em PDF"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL (OPCIONAL)</Label>
                                <Input
                                    value={newMaterial.url}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAdd}>SALVAR</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading && (
                <div className="font-mono text-sm text-[#555] text-center py-4">Carregando...</div>
            )}
            {!isLoading && materials.length === 0 && (
                <div className="font-mono text-sm text-[#444] text-center py-6"
                    style={{ border: '1px dashed rgba(0,255,65,0.15)' }}>
                    Nenhum material vinculado
                </div>
            )}
            {!isLoading && materials.length > 0 && (
                <div className="space-y-2">
                    {materials.map(material => (
                        <div key={material.id}
                            className="flex items-center justify-between p-3 group hover:-translate-y-0.5 transition-transform"
                            style={{ border: '1px solid rgba(0,255,65,0.2)', background: '#020008' }}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                {getIcon(material.type)}
                                <div className="truncate">
                                    <div className="font-mono text-base text-[#e0e0ff] truncate">{material.title}</div>
                                    {material.url && (
                                        <a href={material.url} target="_blank" rel="noopener noreferrer"
                                            className="font-mono text-sm text-[#00ff41] hover:underline flex items-center gap-1 truncate">
                                            {material.url}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(material.id)}
                                className="h-7 w-7 text-[#555] hover:text-[#ff006e] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
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
