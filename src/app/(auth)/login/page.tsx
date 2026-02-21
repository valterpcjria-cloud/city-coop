'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const supabase = getSupabaseClient()
    const [isCheckingSession, setIsCheckingSession] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            const timeout = setTimeout(() => {
                setIsCheckingSession(false)
            }, 5000)

            try {
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
                clearTimeout(timeout)
                setIsCheckingSession(false)
            }
        }
        checkSession()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                .maybeSingle()

            if (teacher || role === 'teacher' || role === 'professor') {
                router.push('/professor')
            } else {
                router.push('/estudante')
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
            {/* Base Background Overlay */}
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Premium Animated Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-50/40 rounded-full blur-[100px] animate-pulse" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-[440px] px-4">

                {/* Background Card with Neon Border */}
                <div className="group relative">
                    <div className="absolute -inset-[1px] rounded-[32px] bg-gradient-to-r from-[#4A90D9]/0 via-[#4A90D9]/0 to-[#F5A623]/0 opacity-0 blur-md transition-all duration-700 group-hover:from-[#4A90D9]/30 group-hover:via-[#4A90D9]/10 group-hover:to-[#F5A623]/20 group-hover:opacity-100" />

                    <div className="relative rounded-[32px] border border-slate-200/60 bg-white/95 backdrop-blur-2xl p-8 md:p-10 shadow-2xl shadow-slate-200/40">

                        {/* Interactive Logo Link - Redirects to Landing Page (/) as requested for Login screen */}
                        <div className="flex justify-center mb-10 overflow-visible">
                            <a
                                href="/"
                                className="relative z-[100] transform transition-all duration-300 hover:scale-105 active:scale-95 group/logo pointer-events-auto block w-fit h-fit"
                                title="Voltar para Início"
                            >
                                {/* Logo Neon Glows */}
                                <div className="absolute inset-0 bg-[#4A90D9]/10 rounded-full blur-2xl group-hover/logo:bg-[#4A90D9]/20 transition-all duration-500 pointer-events-none" />
                                <div className="absolute -inset-6 bg-gradient-to-r from-[#4A90D9]/30 via-[#F5A623]/10 to-[#4A90D9]/30 rounded-full blur-3xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <Image
                                    src="/logo.png"
                                    alt="City Coop"
                                    width={200}
                                    height={60}
                                    className="relative object-contain drop-shadow-[0_4px_12px_rgba(74,144,217,0.15)] pointer-events-none"
                                    priority
                                />
                            </a>
                        </div>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
                                Bem-vindo de volta
                            </h1>
                            <p className="text-sm font-medium text-slate-400">
                                Acesse sua conta com excelência
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                                    Identificação
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                                    <div className={`absolute -inset-[1px] rounded-2xl bg-[#4A90D9]/20 blur-sm transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`} />
                                    <div className={`relative flex items-center rounded-2xl border transition-all duration-300 bg-slate-50/50 ${focusedField === 'email' ? 'border-[#4A90D9]/50 bg-white shadow-xl shadow-blue-500/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <div className="pl-4 pr-[11px]">
                                            <Mail className={`h-4 w-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-[#4A90D9]' : 'text-slate-400'}`} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            required
                                            disabled={isLoading}
                                            className="flex-1 h-13 bg-transparent text-slate-700 placeholder:text-slate-300 text-[15px] outline-none pr-4 disabled:opacity-50 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                                    Segurança
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                                    <div className={`absolute -inset-[1px] rounded-2xl bg-[#4A90D9]/20 blur-sm transition-opacity duration-300 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`} />
                                    <div className={`relative flex items-center rounded-2xl border transition-all duration-300 bg-slate-50/50 ${focusedField === 'password' ? 'border-[#4A90D9]/50 bg-white shadow-xl shadow-blue-500/5' : 'border-slate-100 hover:border-slate-200'}`}>
                                        <div className="pl-4 pr-[11px]">
                                            <Lock className={`h-4 w-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-[#4A90D9]' : 'text-slate-400'}`} />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            required
                                            disabled={isLoading}
                                            className="flex-1 h-13 bg-transparent text-slate-700 placeholder:text-slate-300 text-[15px] outline-none pr-4 disabled:opacity-50 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group/btn relative w-full h-14 rounded-2xl font-bold text-[15px] overflow-hidden transition-all duration-500 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#4A90D9] via-[#5c9ce0] to-[#4A90D9] transition-transform duration-700 group-hover/btn:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#4A90D9]/0 via-white/20 to-[#F5A623]/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />

                                    <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                Entrar na Plataforma
                                                <ArrowRight className="h-5 w-5 transition-transform duration-500 group-hover/btn:translate-x-1" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 pt-6 border-t border-slate-100/80 text-center">
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                City Coop &copy; {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
