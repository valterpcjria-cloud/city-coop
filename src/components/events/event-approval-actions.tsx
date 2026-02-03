'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface EventApprovalActionsProps {
    planId: string
    currentStatus: string
}

export function EventApprovalActions({ planId, currentStatus }: EventApprovalActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [action, setAction] = useState<'approve' | 'reject' | null>(null)

    const handleUpdate = async () => {
        if (!action) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/events/${planId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: action === 'approve' ? 'approved' : 'rejected',
                    feedback
                })
            })

            if (!res.ok) throw new Error('Failed')

            toast.success(action === 'approve' ? 'Plano aprovado!' : 'Plano devolvido para revisão.')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao atualizar status')
        } finally {
            setIsLoading(false)
            setAction(null)
        }
    }

    if (currentStatus === 'approved') return null

    return (
        <div className="flex gap-2">
            <Dialog open={action === 'reject'} onOpenChange={(open) => !open && setAction(null)}>
                <DialogTrigger asChild>
                    <Button variant="destructive" onClick={() => setAction('reject')}>
                        <Icons.close className="mr-2 h-4 w-4" />
                        Rejeitar / Pedir Revisão
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Devolver para Revisão</DialogTitle>
                        <DialogDescription>
                            Explique o motivo para que os alunos possam corrigir.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Ex: O orçamento está irrealista..."
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAction(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleUpdate} disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Rejeição
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={action === 'approve'} onOpenChange={(open) => !open && setAction(null)}>
                <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => setAction('approve')}>
                        <Icons.check className="mr-2 h-4 w-4" />
                        Aprovar Plano
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aprovar Evento</DialogTitle>
                        <DialogDescription>
                            Ao aprovar, o evento se torna oficial.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAction(null)}>Cancelar</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpdate} disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Aprovação
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
