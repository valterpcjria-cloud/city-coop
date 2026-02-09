'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Icons } from "@/components/ui/icons"

interface TestConsentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    testTitle: string
    timeLimit: number
}

export function TestConsentModal({
    isOpen,
    onClose,
    onConfirm,
    testTitle,
    timeLimit
}: TestConsentModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-[500px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-city-blue">
                        <Icons.check className="h-5 w-5" />
                        Termo de Aceite e Início de Avaliação
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4 pt-4 text-slate-700">
                        <p>
                            Você está prestes a iniciar o <strong>{testTitle}</strong>.
                            Este teste é uma etapa fundamental para sua jornada no programa City Coop.
                        </p>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2">
                            <p className="text-sm font-semibold text-blue-800">Regras Importantes:</p>
                            <ul className="text-xs space-y-1 list-disc pl-4 text-blue-700">
                                <li><strong>Tempo Limite:</strong> Você terá {timeLimit} minutos para concluir.</li>
                                <li><strong>Tentativa Única:</strong> Uma vez iniciado, não será possível reiniciar ou pausar o tempo.</li>
                                <li><strong>Critério:</strong> Sua performance será utilizada como critério para elegibilidade ao Núcleo Gestor da Intercoop.</li>
                                <li><strong>Voluntariado:</strong> Ao clicar em iniciar, você declara que está se submetendo voluntariamente a este teste.</li>
                            </ul>
                        </div>

                        <p className="text-sm italic">
                            Deseja aceitar os termos e iniciar a contagem do tempo agora?
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Agora não</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-city-blue hover:bg-city-blue/90"
                    >
                        Aceitar e Iniciar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
