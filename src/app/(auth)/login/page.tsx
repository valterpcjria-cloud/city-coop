'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const supabase = getSupabaseClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    const role = session.user.user_metadata?.role
                    if (role === 'gestor' || role === 'manager') {
                        router.push('/gestor')
                    } else if (role === 'teacher') {
                        router.push('/professor')
                    } else {
                        router.push('/estudante')
                    }
                    // Keep loading true while redirecting
                } else {
                    setIsCheckingSession(false)
                }
            } catch (err) {
                console.error("Session check error:", err)
                setIsCheckingSession(false)
            }
        }
        checkSession()
    }, [supabase, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) throw signInError

            toast.success('Login realizado com sucesso!')

            // First try metadata (faster, always available)
            const role = data.user.user_metadata?.role

            if (role === 'gestor' || role === 'manager') {
                router.push('/gestor')
                return
            }

            const { data: teacher } = await supabase
                .from('teachers')
                .select('id')
                .eq('user_id', data.user.id)
                .single()

            if (teacher || role === 'teacher' || role === 'professor') {
                router.push('/professor')
            } else {
                router.push('/estudante')
            }

        } catch (err: any) {
            console.error('Login error:', err)
            setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (err: any) {
            console.error('OAuth error:', err)
            toast.error('Erro ao conectar com Google')
        }
    }

    if (isCheckingSession) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-[#4A90D9]" />
                    <p className="text-sm font-medium text-[#6B7C93]">Verificando sessão...</p>
                </div>
            </div>
        )
    }

    return (
        <Card className="w-full shadow-2xl border-[#4A90D9]/20 bg-white/95 backdrop-blur-md">
            <CardHeader className="space-y-4 pb-6">
                <div className="flex justify-center">
                    <Image
                        src="/logo.png"
                        alt="City Coop"
                        width={180}
                        height={55}
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-[#4A90D9]">Bem-vindo de volta!</CardTitle>
                    <CardDescription className="text-[#6B7C93]">
                        Entre com seu email e senha para acessar
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#1a2332] font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-[#1a2332] font-medium">Senha</Label>
                            <Link
                                href="/reset-password"
                                className="text-xs text-[#F5A623] hover:text-[#E09000] underline-offset-4 hover:underline font-medium"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="border-[#6B7C93]/30 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20 h-11"
                        />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base" variant="brand" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[#6B7C93]/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-[#6B7C93]">Ou continue com</span>
                    </div>
                </div>

                <Button variant="outline" type="button" className="w-full h-11" onClick={handleGoogleLogin} disabled={isLoading}>
                    <Icons.google className="mr-2 h-4 w-4" />
                    Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm pt-4 border-t border-[#6B7C93]/10">
                <div className="text-[#6B7C93]">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-[#F5A623] hover:text-[#E09000] underline-offset-4 hover:underline font-semibold">
                        Cadastre-se
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
