'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, Bell, Smartphone, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SettingsScreen() {
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.new !== passwords.confirm) {
            return toast.error('As senhas não coincidem')
        }
        if (passwords.new.length < 6) {
            return toast.error('A senha deve ter pelo menos 6 caracteres')
        }

        setIsChangingPassword(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            })
            if (error) throw error
            toast.success('Senha atualizada com sucesso!')
            setPasswords({ new: '', confirm: '' })
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar senha')
        } finally {
            setIsChangingPassword(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Password Section */}
            <Card className="shadow-premium border-slate-200/60 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-city-blue/10 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-city-blue" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Segurança da Conta</CardTitle>
                            <CardDescription>Gerencie sua senha e proteja sua conta.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="focus-visible:ring-city-blue"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="focus-visible:ring-city-blue"
                            />
                        </div>
                        <Button type="submit" variant="brand" disabled={isChangingPassword}>
                            {isChangingPassword ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...</>
                            ) : (
                                'Alterar Senha'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Notifications and Preferences */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-premium border-slate-200/60">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-coop-orange" />
                            <CardTitle className="text-lg">Notificações</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>E-mail Marketing</Label>
                                <p className="text-xs text-tech-gray">Receba novidades e dicas.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Alertas de Sistema</Label>
                                <p className="text-xs text-tech-gray">Notificações sobre suas turmas.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-premium border-slate-200/60">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-city-blue" />
                            <CardTitle className="text-lg">Preferências</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Tema Escuro</Label>
                                <p className="text-xs text-tech-gray">Em breve disponível.</p>
                            </div>
                            <Switch disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Modo Offline</Label>
                                <p className="text-xs text-tech-gray">Reduz consumo de dados.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Support Info */}
            <Card className="border-city-blue/20 bg-city-blue/[0.02]">
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <Smartphone className="h-5 w-5 text-city-blue mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Precisa de Ajuda Técnica?</p>
                            <p className="text-xs text-tech-gray leading-relaxed">
                                Se você encontrar problemas com sua conta ou precisar de suporte avançado,
                                entre em contato com o suporte da City Coop pelo e-mail suporte@citycoop.com.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
