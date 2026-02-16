'use client'

import { ConfirmModal } from "@/components/shared/confirm-modal"

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
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Termo de Aceite e Início de Avaliação"
            confirmText="Aceitar e Iniciar"
            cancelText="Agora não"
            description={
                <div className="space-y-4 pt-4 text-slate-700 text-left">
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
                </div>
            }
        />
    )
}
