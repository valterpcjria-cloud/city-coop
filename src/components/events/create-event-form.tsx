'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/ui/icons'
import { Plus, Trash, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

const formSchema = z.object({
    title: z.string().min(3, 'Título muito curto'),
    description: z.string().min(10, 'Descrição muito curta'),
    event_date: z.date({
        invalid_type_error: 'Selecione uma data para o evento',
    }),
    budget_items: z.array(z.object({
        item: z.string().min(1, 'Item obrigatório'),
        value: z.coerce.number().min(0, 'Valor inválido')
    })).min(1, 'Adicione pelo menos um item ao orçamento'),
    timeline_items: z.array(z.object({
        task: z.string().min(1, 'Tarefa obrigatória'),
        deadline: z.string().min(1, 'Prazo obrigatório')
    })).min(1, 'Adicione pelo menos uma etapa ao cronograma'),
})

interface CreateEventFormProps {
    classId: string
}

export function CreateEventForm({ classId }: CreateEventFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            event_date: new Date(),
            budget_items: [{ item: '', value: 0 }],
            timeline_items: [{ task: '', deadline: '' }],
        },
    })

    // Field Arrays for Dynamic Lists
    const { fields: budgetFields, append: appendBudget, remove: removeBudget } = useFieldArray({
        control: form.control,
        name: "budget_items"
    });

    const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
        control: form.control,
        name: "timeline_items"
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const payload = {
                class_id: classId,
                title: values.title,
                description: values.description,
                event_date: values.event_date.toISOString(),
                budget: { items: values.budget_items, total: values.budget_items.reduce((a, b) => a + b.value, 0) },
                timeline: { steps: values.timeline_items },
                risk_analysis: {}, // Optional for now
                status: 'submitted'
            }

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error('Failed to create event')

            toast.success('Plano de evento enviado para aprovação!')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao enviar plano')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Basic Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Evento</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Feira de Trocas" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="event_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Data Prevista</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: ptBR })
                                                ) : (
                                                    <span>Selecione uma data</span>
                                                )}
                                                <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição e Objetivos</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Descreva o que será o evento e seus principais objetivos..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

                {/* Budget Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Orçamento Estimado</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendBudget({ item: '', value: 0 })}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Item
                        </Button>
                    </div>
                    {budgetFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name={`budget_items.${index}.item`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Item (ex: Decoração)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`budget_items.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="w-32">
                                        <FormControl>
                                            <Input type="number" placeholder="Valor" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeBudget(index)}>
                                <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Timeline Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Cronograma de Ações</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendTimeline({ task: '', deadline: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Etapa
                        </Button>
                    </div>
                    {timelineFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name={`timeline_items.${index}.task`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Tarefa (ex: Enviar convites)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`timeline_items.${index}.deadline`}
                                render={({ field }) => (
                                    <FormItem className="w-40">
                                        <FormControl>
                                            <Input placeholder="Prazo (ex: 15/10)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTimeline(index)}>
                                <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submeter Plano de Evento'}
                </Button>
            </form>
        </Form>
    )
}
