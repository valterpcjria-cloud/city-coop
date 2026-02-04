'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Icons } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TakeAssessmentFormProps {
    assessment: any
    studentId: string
}

export function TakeAssessmentForm({ assessment, studentId }: TakeAssessmentFormProps) {
    const router = useRouter()
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    const questions = assessment.questions || []
    const totalQuestions = questions.length
    const currentQuestion = questions[currentStep]

    const handleAnswerChange = (value: string) => {
        setAnswers(prev => ({ ...prev, [currentStep]: value }))
    }

    const handleNext = () => {
        if (currentStep < totalQuestions - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        // Validation
        if (Object.keys(answers).length < totalQuestions) {
            toast.error('Responda todas as perguntas antes de enviar.')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/assessments/${assessment.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: answers
                })
            })

            if (!response.ok) throw new Error('Failed to submit')

            toast.success('Avaliação enviada com sucesso!')
            router.push('/estudante/atividades')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao enviar avaliação.')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const progressPercentage = ((currentStep + 1) / totalQuestions) * 100

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                    <span>Questão {currentStep + 1} de {totalQuestions}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <Card className="border-t-4 border-t-blue-600 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">
                        {currentQuestion.text}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
                        <div className="grid gap-3">
                            {currentQuestion.options.map((option: string, index: number) => {
                                const optionLabel = String.fromCharCode(97 + index);
                                const isSelected = answers[currentStep] === index.toString();

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerChange(index.toString())}
                                        className={cn(
                                            "flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all text-left group",
                                            isSelected
                                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold transition-all",
                                            isSelected
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : "bg-white border-slate-200 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-600"
                                        )}>
                                            {optionLabel}
                                        </div>
                                        <span className={cn(
                                            "text-base font-medium",
                                            isSelected ? "text-blue-900" : "text-slate-700"
                                        )}>
                                            {option}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <Textarea
                            placeholder="Digite sua resposta aqui..."
                            className="min-h-[150px] resize-none text-base"
                            value={answers[currentStep] || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                        />
                    )}
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50 p-4 rounded-b-lg">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                    >
                        Anterior
                    </Button>

                    {currentStep === totalQuestions - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !answers[currentStep]}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Finalizar e Enviar
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!answers[currentStep]}
                        >
                            Próxima
                            <Icons.arrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
