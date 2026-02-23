'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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
import { createEditorialItem } from '../actions'

const formSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  url: z.string().url('URL inválida').optional().or(z.literal('')),
})

interface CreateEditorialDialogProps {
  contestId: string
}

export function CreateEditorialDialog({ contestId }: CreateEditorialDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createEditorialItem({
        contestId,
        title: values.title,
        description: values.description || undefined,
        url: values.url || undefined,
      })
      toast.success('Edital adicionado com sucesso!')
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error('Erro ao adicionar edital')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Edital
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Edital</DialogTitle>
          <DialogDescription>
            Adicione um edital para este concurso. Você poderá mapear o conteúdo para seus tópicos de estudo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Edital</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Edital Banco do Brasil 2026" {...field} />
                  </FormControl>
                  <FormDescription>
                    Um nome descritivo para este edital
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Escriturário, edital de 2026" {...field} />
                  </FormControl>
                  <FormDescription>
                    Informações adicionais sobre o edital (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link para o Edital</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    URL do edital oficial (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Adicionar Edital
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
