'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Icons } from '@/components/ui/icons'

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Nome da turma deve ter pelo menos 2 caracteres.',
    }),
    code: z.string().min(3, {
        message: 'Código deve ter pelo menos 3 caracteres.',
    }),
    grade_level: z.string({
        message: 'Selecione o ano escolar.',
    } as any),
    modality: z.string({
        message: 'Selecione a modalidade.',
    } as any),
    start_date: z.string().min(1, 'Data de início obrigatória'),
    end_date: z.string().min(1, 'Data de término obrigatória'),
})

export function ClassForm() {
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            code: '',
            grade_level: '',
            modality: 'semestral',
            start_date: '',
            end_date: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const response = await fetch('/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao criar turma')
            }

            toast.success('Turma criada com sucesso!')
            router.push('/professor/turmas')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating class:', error)
            toast.error('Erro ao criar turma: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome da Turma</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: 3º Ano A - Matutino" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código Único</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: TURMA-3A-2024" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Código usado pelos alunos para encontrar a turma.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="grade_level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ano / Série</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o ano" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="9EF">9º Ano - Fundamental</SelectItem>
                                        <SelectItem value="1EM">1º Ano - Ensino Médio</SelectItem>
                                        <SelectItem value="2EM">2º Ano - Ensino Médio</SelectItem>
                                        <SelectItem value="3EM">3º Ano - Ensino Médio</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="modality"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modalidade</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a modalidade" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="semestral">Semestral</SelectItem>
                                        <SelectItem value="trimestral">Trimestral</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Início</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Término</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Turma
                    </Button>
                </div>
            </form>
        </Form>
    )
}
