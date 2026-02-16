'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from '@/components/shared/confirm-modal'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useActionToast } from '@/hooks/use-action-toast'

interface DeleteAssessmentButtonProps {
    assessmentId: string
    title: string
    hasResponses: boolean
}

export function DeleteAssessmentButton({ assessmentId, title, hasResponses }: DeleteAssessmentButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const { executeAction } = useActionToast()

    if (hasResponses) {
        return null
    }

    const handleDelete = async () => {
        await executeAction(
            async () => {
                const response = await fetch(`/api/assessments/${assessmentId}`, {
                    method: 'DELETE',
                })

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Erro ao excluir avaliação')
                }

                router.refresh()
            },
            {
                loadingMessage: 'Excluindo avaliação...',
                successMessage: 'Avaliação excluída com sucesso.',
                errorMessage: 'Erro ao excluir avaliação'
            }
        )
        setIsOpen(false)
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold"
            >
                <Icons.trash className="h-4 w-4 mr-2" />
                Excluir
            </Button>

            <ConfirmModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Avaliação?"
                description={`Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.`}
                confirmText="Sim, Excluir"
                variant="destructive"
            />
        </>
    )
}
