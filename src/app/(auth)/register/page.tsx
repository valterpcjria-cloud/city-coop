'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

export default function RegisterPage() {
    const router = useRouter()
    const supabase = getSupabaseClient()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as 'student' | 'teacher',
        schoolCode: '',
        gradeLevel: ''
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.')
            return false
        }
        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.')
            return false
        }
        if (formData.role === 'student' && !formData.gradeLevel) {
            setError('Selecione seu ano escolar.')
            return false
        }
        // For MVP, simplistic validation
        return true
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (!validateForm()) {
            setIsLoading(false)
            return
        }

        try {
            // 1. Sign Up in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        role: formData.role,
                        gradeLevel: formData.gradeLevel,
                        schoolCode: formData.schoolCode
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Call API to create profile (Securely using metadata from Auth)
                const response = await fetch('/api/auth/create-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: authData.user.id
                    })
                })

                if (!response.ok) {
                    const data = await response.json()
                    throw new Error(data.error || 'Erro ao criar perfil.')
                }

                toast.success('Cadastro realizado com sucesso!')
                router.push(formData.role === 'teacher' ? '/professor' : '/estudante')
            }

        } catch (err: any) {
            console.error('Registration error:', err)
            setError(err.message || 'Erro ao realizar cadastro.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full shadow-xl border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl text-center">Crie sua conta</CardTitle>
                <CardDescription className="text-center">
                    Comece sua jornada na plataforma City Coop
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleRegister} className="space-y-4">

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            type="button"
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.role === 'student' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                        >
                            Sou Estudante
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.role === 'teacher' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            onClick={() => setFormData({ ...formData, role: 'teacher' })}
                        >
                            Sou Professor
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="schoolCode">Código da Escola (Opcional)</Label>
                                <Input
                                    id="schoolCode"
                                    placeholder="Se tiver um"
                                    value={formData.schoolCode}
                                    onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {formData.role === 'student' && (
                        <div className="space-y-2">
                            <Label htmlFor="grade">Ano / Série</Label>
                            <Select
                                onValueChange={(val) => setFormData({ ...formData, gradeLevel: val })}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione seu ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="9EF">9º Ano - Fundamental</SelectItem>
                                    <SelectItem value="1EM">1º Ano - Ensino Médio</SelectItem>
                                    <SelectItem value="2EM">2º Ano - Ensino Médio</SelectItem>
                                    <SelectItem value="3EM">3º Ano - Ensino Médio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            'Criar Contar'
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                <div>
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline font-medium">
                        Entrar
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
