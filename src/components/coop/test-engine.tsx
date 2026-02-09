'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

interface Question {
    id: string
    questao_texto: string
    opcao_a: string
    opcao_b: string
    opcao_c: string
    opcao_d: string
    ordem: number
}

interface TestEngineProps {
    testId: string
    testTitle: string
    questions: Question[]
    timeLimitMinutes: number
    studentId: string
}

export function TestEngine({
    testId,
    testTitle,
    questions,
    timeLimitMinutes,
    studentId
}: TestEngineProps) {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/tests/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testId,
                    studentId,
                    answers
                })
            })

            if (!response.ok) throw new Error('Falha ao enviar teste')

            toast.success('Teste finalizado com sucesso!')
            router.push('/estudante/formacao')
        } catch (error) {
            console.error('Error submitting test:', error)
            toast.error('Erro ao enviar respostas. Tente novamente.')
            setIsSubmitting(false)
        }
    }, [testId, studentId, answers, isSubmitting, router])

    useEffect(() => {
        if (timeLeft <= 0) {
            toast.warning('Tempo esgotado! Enviando respostas automaticamente.')
            handleSubmit()
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, handleSubmit])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const handleOptionChange = (value: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md p-4 z-10 border rounded-xl shadow-sm">
                <div className="space-y-1">
                    <h2 className="font-bold text-city-blue">{testTitle}</h2>
                    <p className="text-xs text-muted-foreground">Questão {currentQuestionIndex + 1} de {questions.length}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse border-red-200 bg-red-50' : 'text-slate-700'}`}>
                        <Icons.clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        Finalizar Teste
                    </Button>
                </div>
            </div>

            <Progress value={progress} className="h-2" />

            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-lg leading-relaxed">
                        {currentQuestion.questao_texto}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={answers[currentQuestion.id] || ''}
                        onValueChange={handleOptionChange}
                        className="space-y-3"
                    >
                        {[
                            { label: currentQuestion.opcao_a, value: 'A' },
                            { label: currentQuestion.opcao_b, value: 'B' },
                            { label: currentQuestion.opcao_c, value: 'C' },
                            { label: currentQuestion.opcao_d, value: 'D' },
                        ].map((opt) => (
                            <div key={opt.value} className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50 ${answers[currentQuestion.id] === opt.value ? 'border-city-blue bg-city-blue/5' : 'border-transparent bg-slate-100/50'}`}>
                                <RadioGroupItem value={opt.value} id={`q-${currentQuestion.id}-${opt.value}`} />
                                <Label htmlFor={`q-${currentQuestion.id}-${opt.value}`} className="flex-1 cursor-pointer font-medium">
                                    <span className="mr-2 text-slate-400 font-bold">{opt.value})</span> {opt.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        <Icons.chevronLeft className="mr-2 h-4 w-4" />
                        Anterior
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button
                            className="bg-city-blue"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            Finalizar e Enviar
                        </Button>
                    ) : (
                        <Button
                            className="bg-city-blue"
                            onClick={handleNext}
                            disabled={!answers[currentQuestion.id]}
                        >
                            Próxima
                            <Icons.chevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
