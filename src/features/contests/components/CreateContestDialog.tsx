'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { createContest } from '../actions'

const formSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    institution: z.string().min(2, 'Instituição deve ter pelo menos 2 caracteres'),
    role: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
    examDate: z.date().optional(),
    isPrimary: z.boolean().default(false),
})

export function CreateContestDialog() {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            institution: '',
            role: '',
            isPrimary: false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await createContest(values)
            .then(() => {
                toast.success('Concurso criado!')
                setOpen(false)
                form.reset()
            })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : 'Erro desconhecido'
                toast.error(`Erro ao criar concurso: ${message}`)
            })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    NOVO CONCURSO
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>ADICIONAR CONCURSO</DialogTitle>
                    <DialogDescription>
                        Cadastre o edital que você está focado.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NOME DO CONCURSO</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Banco do Brasil 2026" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="institution"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BANCA</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Cesgranrio" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CARGO</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Escriturário" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="examDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>DATA DA PROVA</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-mono text-base",
                                                        !field.value && "text-[#555]"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "d 'de' MMMM, yyyy", { locale: ptBR })
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isPrimary"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between p-4"
                                    style={{ border: '1px solid rgba(0,255,65,0.3)', background: '#020008' }}>
                                    <div className="space-y-0.5">
                                        <FormLabel>FOCO PRINCIPAL</FormLabel>
                                        <FormDescription>
                                            Definir como meta principal atual
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" className="w-full">SALVAR CONCURSO</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
