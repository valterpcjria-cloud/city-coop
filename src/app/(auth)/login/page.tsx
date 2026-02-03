'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons' // We'll need to create this
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const supabase = getSupabaseClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                // Now that layouts are safe, we can default to one and let them bounce
                router.push('/professor')
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

            // Check user role to redirect appropriately
            // For MVP we'll check if it's a teacher or student by querying tables
            // Ideally this should be in public.users or metadata

            const { data: teacher } = await supabase
                .from('teachers')
                .select('id')
                .eq('user_id', data.user.id)
                .single()

            if (teacher) {
                router.push('/professor')
            } else {
                router.push('/estudante') // Default to student if not teacher
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

    return (
        <Card className="w-full shadow-xl border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl text-center">Acesse sua conta</CardTitle>
                <CardDescription className="text-center">
                    Entre com seu email e senha para continuar
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Senha</Label>
                            <Link
                                href="/reset-password"
                                className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
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
                        />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
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
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                    {/* We'll create the Icons component separately */}
                    <span className="mr-2">G</span>
                    Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                <div>
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline font-medium">
                        Cadastre-se
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
