'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Icons } from '@/components/ui/icons'

interface GradingFormProps {
    responseId: string
    currentScore?: number | null
}

export function GradingForm({ responseId, currentScore }: GradingFormProps) {
    const router = useRouter()
    const [score, setScore] = useState<string>(currentScore?.toString() || '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/assessments/responses/${responseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: parseFloat(score) })
            })

            if (!res.ok) throw new Error('Failed')

            toast.success('Nota salva!')
            router.refresh()
        } catch (error) {
            toast.error('Erro ao salvar nota')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border">
            <div className="space-y-1">
                <label className="text-sm font-medium">Atribuir Nota (0-100)</label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-24 bg-white"
                        min={0}
                        max={100}
                    />
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Icons.spinner className="h-4 w-4 animate-spin" /> : 'Salvar'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
