'use client'

import React, { useState, useEffect } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

interface BulkDeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    municipality: string
    schoolsCount: number
    schoolIds: string[]
    onConfirm: (confirmMunicipality: string) => Promise<void>
}

export function BulkDeleteDialog({
    isOpen,
    onClose,
    municipality,
    schoolsCount,
    schoolIds,
    onConfirm
}: BulkDeleteDialogProps) {
    const [step, setStep] = useState(1)
    const [confirmText, setConfirmText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        if (step === 3 && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [step, countdown])

    const handleNext = () => {
        if (step === 2 && confirmText !== municipality) {
            toast.error('O nome do município não confere.')
            return
        }
        setStep(step + 1)
    }

    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            await onConfirm(confirmText)
            onClose()
            setStep(1)
            setConfirmText('')
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const reset = () => {
        setStep(1)
        setConfirmText('')
        setCountdown(5)
        onClose()
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={reset}>
            <AlertDialogContent className="sm:max-w-[500px] border-2 border-red-100">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <Icons.alertTriangle className="h-6 w-6" />
                        AÇÃO EXTREMAMENTE CRÍTICA
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta operação é irreversível e apagará todos os dados vinculados.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <h4 className="font-semibold text-red-800 mb-2">Resumo da Exclusão:</h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    <li>• <strong>Município:</strong> {municipality}</li>
                                    <li>• <strong>Escolas:</strong> {schoolIds.length === 0 ? 'Todas do município' : `${schoolIds.length} selecionada(s)`}</li>
                                    <li>• <strong>Impacto:</strong> Todos os alunos, professores, turmas e notas serão apagados para SEMPRE.</li>
                                </ul>
                            </div>
                            <p className="text-sm text-slate-600 italic">
                                Você tem certeza absoluta que deseja prosseguir com esta limpeza em massa?
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <p className="text-sm font-medium text-slate-800">
                                Para confirmar, digite o nome exato do município abaixo:
                                <br />
                                <span className="text-red-600 font-bold uppercase tracking-wider">{municipality}</span>
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Digite o nome do município..."
                                className="border-red-200 focus:ring-red-500 h-12 text-lg"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 text-center py-4 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icons.trash className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Último Aviso!</h3>
                            <p className="text-sm text-slate-600">
                                Ao clicar no botão abaixo, a exclusão será iniciada imediatamente.
                                <br />
                                <strong>Não tem volta.</strong>
                            </p>
                            {countdown > 0 && (
                                <p className="text-xs font-mono text-red-500 bg-red-50 py-2 inline-block px-4 rounded-full border border-red-100">
                                    Aguarde {countdown}s para liberar o botão...
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <AlertDialogFooter className="sm:justify-between gap-3">
                    <AlertDialogCancel onClick={reset} disabled={isLoading}>
                        Cancelar
                    </AlertDialogCancel>

                    {step < 3 ? (
                        <Button
                            variant="destructive"
                            onClick={handleNext}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={step === 2 && confirmText !== municipality}
                        >
                            {step === 1 ? 'Eu entendo, continuar' : 'Confirmar Município'}
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={countdown > 0 || isLoading}
                            className="bg-red-700 hover:bg-red-800 h-11 px-8 min-w-[140px] relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <span className="relative z-10 uppercase tracking-tighter font-black">
                                    Excluir Agora
                                </span>
                            )}
                            <div className="absolute inset-0 bg-red-900/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                        </Button>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
