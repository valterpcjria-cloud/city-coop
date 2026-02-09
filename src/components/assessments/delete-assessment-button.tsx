'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

interface DeleteAssessmentButtonProps {
    assessmentId: string
    title: string
    hasResponses: boolean
}

export function DeleteAssessmentButton({ assessmentId, title, hasResponses }: DeleteAssessmentButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    if (hasResponses) {
        return null
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            const response = await fetch(`/api/assessments/${assessmentId}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao excluir avaliação')
            }

            toast.success('Avaliação excluída com sucesso.')

            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsDeleting(false)
            setIsOpen(false)
        }
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

            <ConfirmDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                title="Excluir Avaliação"
                description={`Tem certeza que deseja excluir "${title}"? Esta ação não poderá ser desfeita.`}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
                variant="danger"
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </>
    )
}
