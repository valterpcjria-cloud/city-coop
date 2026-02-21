'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            const timeout = setTimeout(() => {
                console.warn("Session check timed out")
                setIsCheckingSession(false)
            }, 5000)

            try {
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                    console.error("Missing Supabase environment variables")
                    setIsCheckingSession(false)
                    clearTimeout(timeout)
                    return
                }

                const { data: { session } } = await supabase.auth.getSession()
                clearTimeout(timeout)

                if (session) {
                    const role = session.user.user_metadata?.role
                    if (role === 'gestor' || role === 'manager') {
                        router.push('/gestor')
                    } else if (role === 'teacher' || role === 'professor') {
                        router.push('/professor')
                    } else {
                        router.push('/estudante')
                    }
                } else {
                    setIsCheckingSession(false)
                }
            } catch (err) {
                console.error("Session check error:", err)
                clearTimeout(timeout)
                setIsCheckingSession(false)
            }
        }
        checkSession()
    }, [supabase, router])

    if (isCheckingSession) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-[#4A90D9]/20 blur-xl animate-pulse" />
                        <Loader2 className="relative h-10 w-10 animate-spin text-[#4A90D9]" />
                    </div>
                    <p className="text-sm font-medium text-[#6B7C93]">Verificando sessão...</p>
                </div>
            </div>
        )
    }

    return <LoginForm />
}

function LoginForm() {
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [focusedField, setFocusedField] = useState<string | null>(null)

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

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
            {/* Background elements forced to be light */}
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Animated Light Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-50/50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* === Login Card === */}
            <div className="relative z-10 w-full max-w-[440px] px-4">

                {/* Card with neon border glow on hover */}
                <div className="group relative">
                    {/* Light mode neon glow */}
                    <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-[#4A90D9]/0 via-[#4A90D9]/0 to-[#F5A623]/0 opacity-0 blur-md transition-all duration-700 group-hover:from-[#4A90D9]/30 group-hover:via-[#4A90D9]/10 group-hover:to-[#F5A623]/30 group-hover:opacity-100" />

                    {/* Card body */}
                    <div className="relative rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl p-8 md:p-10 shadow-xl shadow-slate-200/50">

                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="relative group/logo">
                                <div className="absolute inset-0 bg-[#4A90D9]/10 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover/logo:opacity-100" />
                                <Image
                                    src="/logo.png"
                                    alt="City Coop"
                                    width={180}
                                    height={55}
                                    className="relative object-contain"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
                                Bem-vindo de volta
                            </h1>
                            <p className="text-sm text-slate-500">
                                Acesse sua conta para continuar
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Email
                                </label>
                                <div className={`relative group/input transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                                    <div className={`absolute -inset-[1px] rounded-xl bg-[#4A90D9]/20 blur-sm transition-all duration-300 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`} />
                                    <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${focusedField === 'email' ? 'border-[#4A90D9]/50 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'}`}>
                                        <div className="pl-4 pr-2">
                                            <Mail className={`h-4 w-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-[#4A90D9]' : 'text-slate-400'}`} />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            required
                                            disabled={isLoading}
                                            className="flex-1 h-12 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none pr-4 disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Senha
                                </label>
                                <div className={`relative group/input transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                                    <div className={`absolute -inset-[1px] rounded-xl bg-[#4A90D9]/20 blur-sm transition-all duration-300 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`} />
                                    <div className={`relative flex items-center rounded-xl border transition-all duration-300 ${focusedField === 'password' ? 'border-[#4A90D9]/50 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'}`}>
                                        <div className="pl-4 pr-[11px]">
                                            <Lock className={`h-4 w-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-[#4A90D9]' : 'text-slate-400'}`} />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            required
                                            disabled={isLoading}
                                            className="flex-1 h-12 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none pr-4 disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group/btn relative w-full h-12 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#4A90D9] via-[#3d7ec4] to-[#4A90D9] transition-all duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#4A90D9]/0 via-white/20 to-[#F5A623]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Entrando...
                                            </>
                                        ) : (
                                            <>
                                                Entrar
                                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        {/* Footer Link */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                            <p className="text-xs text-slate-400">
                                Plataforma de Cooperativismo Escolar
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rights Reserved */}
                <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} City Coop. Produzido com Excelência.
                </p>
            </div>
        </div>
    )
}
