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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

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
    const [isGenerating, setIsGenerating] = useState(false)
    const [creationMode, setCreationMode] = useState<'ai' | 'manual'>('ai')
    const [aiGuidelines, setAiGuidelines] = useState('')
    const [format, setFormat] = useState<'dissertativa' | 'objetiva' | 'redacao'>('dissertativa')
    const [optionsCount, setOptionsCount] = useState(4)
    const [questionsCount, setQuestionsCount] = useState(5)
    const [questions, setQuestions] = useState<{
        id: string;
        text: string;
        type: 'text' | 'multiple-choice';
        options?: string[];
        correctAnswer?: number;
        answerKey?: string;
    }[]>([
        { id: '1', text: '', type: 'text', answerKey: '' }
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
        setQuestions([...questions, {
            id: Math.random().toString(),
            text: '',
            type: format === 'objetiva' ? 'multiple-choice' : 'text',
            options: format === 'objetiva' ? Array(optionsCount).fill('') : undefined,
            correctAnswer: format === 'objetiva' ? 0 : undefined,
            answerKey: format === 'objetiva' ? undefined : ''
        }])
    }

    const updateQuestion = (id: string, updates: Partial<typeof questions[0]>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
    }

    const removeQuestion = (id: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id))
        }
    }

    const handleAIGenerate = async () => {
        if (!aiGuidelines.trim()) {
            toast.error('Informe o que você deseja na avaliação')
            return
        }

        setIsGenerating(true)
        try {
            const response = await fetch('/api/ai/generate-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guidelines: aiGuidelines,
                    classId,
                    format,
                    optionsCount,
                    questionsCount
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Falha ao gerar com IA')

            // Populate form
            if (data.title) form.setValue('title', data.title)
            if (data.type) form.setValue('type', data.type)
            if (data.description) form.setValue('description', data.description)

            // Populate questions
            if (data.questions && data.questions.length > 0) {
                const newQuestions = data.questions.map((q: any) => {
                    const type = q.type || (format === 'objetiva' ? 'multiple-choice' : 'text');
                    return {
                        id: Math.random().toString(),
                        text: q.text,
                        type,
                        options: q.options || (type === 'multiple-choice' ? Array(optionsCount).fill('') : undefined),
                        correctAnswer: (type === 'multiple-choice')
                            ? (typeof q.correctAnswer === 'number' ? q.correctAnswer : 0)
                            : undefined,
                        answerKey: q.answerKey || ''
                    };
                });
                setQuestions(newQuestions)

                if (data.questions[0].type === 'multiple-choice') {
                    setFormat('objetiva')
                } else if (format !== 'redacao') {
                    setFormat('dissertativa')
                }
            }

            toast.success('Avaliação gerada pela IA com sucesso! Revise os campos abaixo.')
        } catch (error: any) {
            console.error(error)
            toast.error('Erro: ' + error.message)
        } finally {
            setIsGenerating(false)
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
                    questions: questions.map(q => ({
                        text: q.text,
                        type: q.type,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        answerKey: q.answerKey
                    })),
                    availableFrom: new Date().toISOString(),
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Falha ao criar avaliação')
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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between p-1 bg-slate-100 rounded-lg w-full max-w-md mx-auto">
                <button
                    type="button"
                    onClick={() => setCreationMode('ai')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold transition-all",
                        creationMode === 'ai' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Icons.ai className="h-4 w-4" />
                    Gerar com IA
                </button>
                <button
                    type="button"
                    onClick={() => setCreationMode('manual')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-bold transition-all",
                        creationMode === 'manual' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Icons.add className="h-4 w-4" />
                    Criar Manualmente
                </button>
            </div>

            {creationMode === 'ai' && (
                <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="h-1 w-full bg-indigo-500" />
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Icons.ai className="h-5 w-5" />
                            AI Assistant
                        </CardTitle>
                        <CardDescription className="text-indigo-600/80">
                            Descreva o tema ou dê instruções e a IA criará a avaliação completa para você.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label className="text-indigo-900 font-bold">Formato da Avaliação</Label>
                                <Tabs value={format} onValueChange={(v: any) => setFormat(v)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-indigo-100/50">
                                        <TabsTrigger value="dissertativa" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs font-bold">
                                            Dissertativa
                                        </TabsTrigger>
                                        <TabsTrigger value="objetiva" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs font-bold">
                                            Objetiva
                                        </TabsTrigger>
                                        <TabsTrigger value="redacao" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs font-bold">
                                            Redação
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {format === 'objetiva' && (
                                <div className="space-y-4">
                                    <Label className="text-indigo-900 font-bold">Número de Alternativas</Label>
                                    <Select value={optionsCount.toString()} onValueChange={(v) => setOptionsCount(parseInt(v))}>
                                        <SelectTrigger className="bg-white border-indigo-100">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 Alternativas (a, b, c)</SelectItem>
                                            <SelectItem value="4">4 Alternativas (a, b, c, d)</SelectItem>
                                            <SelectItem value="5">5 Alternativas (a, b, c, d, e)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className={cn("space-y-4", format === 'redacao' && "opacity-50 pointer-events-none")}>
                                <Label className="text-indigo-900 font-bold">Quantidade de Perguntas</Label>
                                <Select
                                    value={format === 'redacao' ? "1" : questionsCount.toString()}
                                    onValueChange={(v) => setQuestionsCount(parseInt(v))}
                                    disabled={format === 'redacao'}
                                >
                                    <SelectTrigger className="bg-white border-indigo-100">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 5, 8, 10, 15].map((num) => (
                                            <SelectItem key={num} value={num.toString()}>
                                                {num} {num === 1 ? 'Pergunta' : 'Perguntas'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {format === 'redacao' && <p className="text-[10px] text-indigo-500 italic">Formato de redação gera 1 proposta.</p>}
                            </div>
                        </div>

                        <Textarea
                            placeholder="Ex: Crie uma avaliação sobre os princípios do cooperativismo e como eles se aplicam no dia a dia da escola."
                            className="bg-white border-indigo-100 focus:ring-indigo-500 min-h-[100px]"
                            value={aiGuidelines}
                            onChange={(e) => setAiGuidelines(e.target.value)}
                        />
                        <Button
                            type="button"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            onClick={handleAIGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Icons.sparkles className="mr-2 h-4 w-4" />
                            )}
                            {isGenerating ? 'Gerando Avaliação...' : 'Gerar Avaliação com IA'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Separator />

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
                                <CardContent className="p-4 pt-2 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">Enunciado</Label>
                                        <Input
                                            placeholder="Digite a pergunta aqui..."
                                            value={question.text}
                                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                                        />
                                    </div>

                                    {question.type === 'multiple-choice' && question.options && (
                                        <div className="space-y-3 pl-4 border-l-2 border-slate-100 mt-4">
                                            <Label className="text-xs font-bold text-slate-500 uppercase">Alternativas (Marque a correta)</Label>
                                            <div className="grid gap-3">
                                                {question.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuestion(question.id, { correctAnswer: optIndex })}
                                                            className={cn(
                                                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all",
                                                                question.correctAnswer === optIndex
                                                                    ? "bg-green-600 border-green-600 text-white shadow-sm"
                                                                    : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                                                            )}
                                                        >
                                                            {String.fromCharCode(97 + optIndex)})
                                                        </button>
                                                        <Input
                                                            placeholder={`Alternativa ${String.fromCharCode(97 + optIndex)}`}
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions = [...(question.options || [])];
                                                                newOptions[optIndex] = e.target.value;
                                                                updateQuestion(question.id, { options: newOptions });
                                                            }}
                                                            className={cn(
                                                                "h-9",
                                                                question.correctAnswer === optIndex && "border-green-200 bg-green-50/30 focus-visible:ring-green-500"
                                                            )}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {question.type === 'text' && (
                                        <div className="space-y-2 pl-4 border-l-2 border-indigo-100 mt-4">
                                            <div className="flex items-center gap-2">
                                                <Icons.ai className="h-3 w-3 text-indigo-500" />
                                                <Label className="text-xs font-bold text-indigo-600 uppercase">Gabarito / Critérios de Correção</Label>
                                            </div>
                                            <Textarea
                                                placeholder="Descreva a resposta esperada ou os critérios que serão usados para avaliar esta questão..."
                                                value={question.answerKey || ''}
                                                onChange={(e) => updateQuestion(question.id, { answerKey: e.target.value })}
                                                className="min-h-[80px] text-sm bg-indigo-50/10 border-indigo-100 focus-visible:ring-indigo-500"
                                            />
                                        </div>
                                    )}
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
