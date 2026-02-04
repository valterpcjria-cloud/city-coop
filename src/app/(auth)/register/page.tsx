'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
        <Card className="w-full shadow-2xl border-[#4A90D9]/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="space-y-4 pb-4">
                <div className="flex justify-center">
                    <Image
                        src="/logo.png"
                        alt="City Coop"
                        width={160}
                        height={48}
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-[#4A90D9]">Crie sua conta</CardTitle>
                    <CardDescription className="text-[#6B7C93]">
                        Comece sua jornada na plataforma City Coop
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Role Toggle */}
                    <div className="flex bg-[#6B7C93]/10 p-1 rounded-xl">
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.role === 'student'
                                ? 'bg-white shadow-md text-[#4A90D9] border border-[#4A90D9]/20'
                                : 'text-[#6B7C93] hover:text-[#4A90D9]'}`}
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                        >
                            Sou Estudante
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.role === 'teacher'
                                ? 'bg-white shadow-md text-[#F5A623] border border-[#F5A623]/20'
                                : 'text-[#6B7C93] hover:text-[#F5A623]'}`}
                            onClick={() => setFormData({ ...formData, role: 'teacher' })}
                        >
                            Sou Professor
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#1a2332] font-medium">Nome Completo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isLoading}
                            className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#1a2332] font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isLoading}
                                className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="schoolCode" className="text-[#1a2332] font-medium">Código da Escola</Label>
                            <Input
                                id="schoolCode"
                                placeholder="Opcional"
                                value={formData.schoolCode}
                                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                                disabled={isLoading}
                                className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11"
                            />
                        </div>
                    </div>

                    {formData.role === 'student' && (
                        <div className="space-y-2">
                            <Label htmlFor="grade" className="text-[#1a2332] font-medium">Ano / Série</Label>
                            <Select
                                onValueChange={(val) => setFormData({ ...formData, gradeLevel: val })}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11">
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
                            <Label htmlFor="password" className="text-[#1a2332] font-medium">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                disabled={isLoading}
                                className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-[#1a2332] font-medium">Confirmar</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                                disabled={isLoading}
                                className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base mt-2" variant="brand" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            'Criar Conta'
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm pt-4 border-t border-[#6B7C93]/10">
                <div className="text-[#6B7C93]">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-[#F5A623] hover:text-[#E09000] underline-offset-4 hover:underline font-semibold">
                        Entrar
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
