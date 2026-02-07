'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/ui/icons'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Question {
    text: string
    type: 'multiple-choice' | 'text' | 'redacao'
    options?: string[]
    correctAnswer?: number
    answerKey?: string
}

interface EditQuestionsDialogProps {
    assessmentId: string
    questions: Question[]
    trigger?: React.ReactNode
}

export function EditQuestionsDialog({ assessmentId, questions: initialQuestions, trigger }: EditQuestionsDialogProps) {
    const [open, setOpen] = useState(false)
    const [questions, setQuestions] = useState<Question[]>(initialQuestions || [])
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const updateQuestion = (index: number, updates: Partial<Question>) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q))
    }

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== questionIndex) return q
            const newOptions = [...(q.options || [])]
            newOptions[optionIndex] = value
            return { ...q, options: newOptions }
        }))
    }

    const addOption = (questionIndex: number) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== questionIndex) return q
            return { ...q, options: [...(q.options || []), ''] }
        }))
    }

    const removeOption = (questionIndex: number, optionIndex: number) => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== questionIndex) return q
            const newOptions = (q.options || []).filter((_, idx) => idx !== optionIndex)
            // Adjust correctAnswer if needed
            let newCorrectAnswer = q.correctAnswer
            if (q.correctAnswer !== undefined) {
                if (optionIndex === q.correctAnswer) {
                    newCorrectAnswer = undefined
                } else if (optionIndex < q.correctAnswer) {
                    newCorrectAnswer = q.correctAnswer - 1
                }
            }
            return { ...q, options: newOptions, correctAnswer: newCorrectAnswer }
        }))
    }

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            text: '',
            type: 'text',
            answerKey: ''
        }])
    }

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index))
    }

    const changeQuestionType = (index: number, newType: 'multiple-choice' | 'text' | 'redacao') => {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== index) return q
            if (newType === 'multiple-choice') {
                return {
                    text: q.text,
                    type: newType,
                    options: ['', '', '', ''],
                    correctAnswer: 0
                }
            } else {
                return {
                    text: q.text,
                    type: newType,
                    answerKey: q.answerKey || ''
                }
            }
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch(`/api/assessments/${assessmentId}/questions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions })
            })

            if (!response.ok) {
                throw new Error('Erro ao salvar')
            }

            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Erro ao salvar questões:', error)
            alert('Erro ao salvar as questões. Tente novamente.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="font-bold gap-2 border-[#4A90D9]/30 text-[#4A90D9] hover:bg-[#4A90D9]/10">
                        <Icons.settings className="h-4 w-4" />
                        Editar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#4A90D9]">
                        Editar Questões
                    </DialogTitle>
                    <DialogDescription>
                        Modifique as questões geradas pela IA. Você pode editar textos, adicionar ou remover questões.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {questions.map((question, qIndex) => (
                        <div
                            key={qIndex}
                            className="p-5 border border-[#6B7C93]/20 rounded-xl space-y-4 bg-gradient-to-r from-[#4A90D9]/5 to-transparent"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A90D9] to-[#F5A623] text-white text-sm font-bold">
                                        {qIndex + 1}
                                    </span>
                                    <select
                                        value={question.type}
                                        onChange={(e) => changeQuestionType(qIndex, e.target.value as any)}
                                        className="text-sm border border-[#6B7C93]/20 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#4A90D9]/30"
                                    >
                                        <option value="multiple-choice">Múltipla Escolha</option>
                                        <option value="text">Dissertativa</option>
                                        <option value="redacao">Redação</option>
                                    </select>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeQuestion(qIndex)}
                                >
                                    <Icons.trash className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-[#6B7C93]">Texto da Questão</Label>
                                <Textarea
                                    value={question.text}
                                    onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                                    placeholder="Digite o enunciado da questão..."
                                    className="min-h-[80px] border-[#6B7C93]/20 focus:border-[#4A90D9]/50"
                                />
                            </div>

                            {question.type === 'multiple-choice' && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-[#6B7C93]">Alternativas</Label>
                                    <RadioGroup
                                        value={String(question.correctAnswer ?? 0)}
                                        onValueChange={(value: string) => updateQuestion(qIndex, { correctAnswer: parseInt(value) })}
                                    >
                                        {question.options?.map((option, optIndex) => (
                                            <div key={optIndex} className="flex items-center gap-3">
                                                <RadioGroupItem
                                                    value={String(optIndex)}
                                                    id={`q${qIndex}-opt${optIndex}`}
                                                    className="text-green-600"
                                                />
                                                <div className={cn(
                                                    "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                                                    question.correctAnswer === optIndex
                                                        ? "bg-green-500 text-white"
                                                        : "bg-[#6B7C93]/10 text-[#6B7C93]"
                                                )}>
                                                    {String.fromCharCode(65 + optIndex)}
                                                </div>
                                                <Input
                                                    value={option}
                                                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                    placeholder={`Alternativa ${String.fromCharCode(65 + optIndex)}`}
                                                    className="flex-1 border-[#6B7C93]/20"
                                                />
                                                {(question.options?.length || 0) > 2 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-[#6B7C93] hover:text-red-500"
                                                        onClick={() => removeOption(qIndex, optIndex)}
                                                    >
                                                        <Icons.x className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOption(qIndex)}
                                        className="text-[#4A90D9] border-[#4A90D9]/30"
                                    >
                                        <Icons.plus className="h-3 w-3 mr-1" />
                                        Adicionar Alternativa
                                    </Button>
                                </div>
                            )}

                            {(question.type === 'text' || question.type === 'redacao') && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-[#6B7C93]">Gabarito / Critérios de Avaliação</Label>
                                    <Textarea
                                        value={question.answerKey || ''}
                                        onChange={(e) => updateQuestion(qIndex, { answerKey: e.target.value })}
                                        placeholder="Descreva os critérios de avaliação ou resposta esperada..."
                                        className="min-h-[60px] border-[#6B7C93]/20 focus:border-[#4A90D9]/50"
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        onClick={addQuestion}
                        className="w-full border-dashed border-[#4A90D9]/40 text-[#4A90D9] hover:bg-[#4A90D9]/10"
                    >
                        <Icons.plus className="h-4 w-4 mr-2" />
                        Adicionar Nova Questão
                    </Button>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] hover:from-[#3A7BC8] hover:to-[#2A6BB8] text-white font-bold"
                    >
                        {saving ? (
                            <>
                                <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Icons.check className="h-4 w-4 mr-2" />
                                Salvar Alterações
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
