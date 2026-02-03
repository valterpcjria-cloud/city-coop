'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const assessmentTypes = [
    { value: 'cooperativismo', label: 'Conceitos de Cooperativismo' },
    { value: 'participacao', label: 'Participação Democrática' },
    { value: 'organizacao_nucleos', label: 'Organização dos Núcleos' },
    { value: 'planejamento_evento', label: 'Planejamento de Evento' },
    { value: 'gestao_financeira', label: 'Gestão Financeira' },
]

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Título deve ter pelo menos 2 caracteres.',
    }),
    type: z.string().min(1, {
        message: 'Selecione um tipo de avaliação.',
    }),
    description: z.string().optional(),
})

interface CreateAssessmentFormProps {
    classId: string
}

export function CreateAssessmentForm({ classId }: CreateAssessmentFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [questions, setQuestions] = useState<{ id: string; text: string; options?: string[] }[]>([
        { id: '1', text: '', options: [] }
    ])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            type: '',
        },
    })

    const addQuestion = () => {
        setQuestions([...questions, { id: Math.random().toString(), text: '', options: [] }])
    }

    const updateQuestion = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
    }

    const removeQuestion = (id: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id))
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Validate questions
        if (questions.some(q => !q.text.trim())) {
            toast.error('Preencha todas as perguntas')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`/api/classes/${classId}/assessments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    questions: questions.map(q => ({ text: q.text, type: 'text' })),
                    availableFrom: new Date().toISOString(),
                }),
            })

            if (!response.ok) {
                throw new Error('Falha ao criar avaliação')
            }

            toast.success('Avaliação criada com sucesso!')
            router.push(`/professor/turmas/${classId}`)
            router.refresh()
        } catch (error) {
            toast.error('Erro ao criar avaliação')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título da Avaliação</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Prova de Cooperativismo I" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Competência</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {assessmentTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        A avaliação influenciará o indicador desta competência.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Perguntas</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                                <Icons.add className="mr-2 h-4 w-4" />
                                Adicionar Pergunta
                            </Button>
                        </div>

                        {questions.map((question, index) => (
                            <Card key={question.id}>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Pergunta {index + 1}</CardTitle>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500"
                                            onClick={() => removeQuestion(question.id)}
                                        >
                                            <Icons.trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <Input
                                        placeholder="Digite a pergunta aqui..."
                                        value={question.text}
                                        onChange={(e) => updateQuestion(question.id, e.target.value)}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Avaliação
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
