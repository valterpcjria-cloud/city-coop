'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Key, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

interface User {
    id: string
    user_id: string
    name: string
    email: string
}

interface PasswordResetDialogProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
}

export function PasswordResetDialog({ isOpen, onClose, user }: PasswordResetDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [method, setMethod] = useState<'choice' | 'manual' | 'email'>('choice')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleClose = () => {
        setMethod('choice')
        setPassword('')
        setShowPassword(false)
        onClose()
    }

    const handleEmailReset = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const response = await fetch('/api/gestor/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Erro ao enviar email')

            toast.success('Email enviado!', {
                description: `Um link de recuperação foi enviado para ${user.email}`
            })
            handleClose()
        } catch (error: any) {
            toast.error('Erro', { description: error.message })
        } finally {
            setIsLoading(true) // Keep loading until close
            setTimeout(() => setIsLoading(false), 500)
        }
    }

    const handleManualReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !password) return

        if (password.length < 6) {
            toast.error('Senha curta', { description: 'A senha deve ter pelo menos 6 caracteres' })
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/gestor/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    password: password
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Erro ao alterar senha')

            toast.success('Senha alterada!', {
                description: `A senha de ${user.name} foi alterada com sucesso.`
            })
            handleClose()
        } catch (error: any) {
            toast.error('Erro', { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-city-blue" />
                        Resetar Senha
                    </DialogTitle>
                    <DialogDescription>
                        Escolha como deseja resetar a senha de <strong>{user?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {method === 'choice' && (
                    <div className="grid gap-4 py-4">
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col gap-1 items-start justify-center px-4 hover:border-city-blue hover:bg-city-blue/5 group"
                            onClick={() => setMethod('email')}
                        >
                            <div className="flex items-center gap-2 font-semibold group-hover:text-city-blue">
                                <Mail className="h-4 w-4" />
                                Enviar Link por Email
                            </div>
                            <span className="text-xs text-muted-foreground font-normal">
                                O usuário receberá instruções no email cadastrado.
                            </span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-20 flex flex-col gap-1 items-start justify-center px-4 hover:border-amber-500 hover:bg-amber-500/5 group"
                            onClick={() => setMethod('manual')}
                        >
                            <div className="flex items-center gap-2 font-semibold group-hover:text-amber-600">
                                <Lock className="h-4 w-4" />
                                Definir Senha Manualmente
                            </div>
                            <span className="text-xs text-muted-foreground font-normal">
                                Digite uma nova senha agora para o usuário.
                            </span>
                        </Button>
                    </div>
                )}

                {method === 'email' && (
                    <div className="py-6 space-y-4 text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                            <Mail className="h-8 w-8 text-city-blue" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Um email de recuperação será enviado para:<br />
                            <span className="font-medium text-foreground">{user?.email}</span>
                        </p>
                        <div className="flex flex-col gap-2 pt-4">
                            <Button onClick={handleEmailReset} disabled={isLoading} variant="brand">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirmar e Enviar
                            </Button>
                            <Button variant="ghost" onClick={() => setMethod('choice')} disabled={isLoading}>
                                Voltar
                            </Button>
                        </div>
                    </div>
                )}

                {method === 'manual' && (
                    <form onSubmit={handleManualReset} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Digite a nova senha"
                                    autoFocus
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Recomendamos pelo menos 6 caracteres.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                            <Button type="submit" disabled={isLoading || !password} variant="brand">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Salvar Nova Senha
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setMethod('choice')} disabled={isLoading}>
                                Voltar
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )

    function handleOpenChange(open: boolean) {
        if (!open) handleClose()
    }
}
