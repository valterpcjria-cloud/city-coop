'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function OnboardingError() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = getSupabaseClient()

    /* Debug State */
    const [debugInfo, setDebugInfo] = useState<any>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)

                // Check for profiles casually (public check)
                // Note: This might fail if RLS is strict, but let's try to see metadata at least
                setDebugInfo({
                    id: user.id,
                    email: user.email,
                    metadata: user.user_metadata,
                    app_metadata: user.app_metadata
                })
            }
        }
        getUser()
    }, [supabase])

    const handleFixProfile = async () => {
        if (!userId) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/create-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }) // We will rely on metadata first
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao criar perfil')
            }

            toast.success(`Perfil processado: ${data.message || 'Sucesso'}`)

            // Debug: Delay redirect to let user read toast? No, let's redirect.
            // But if it failed silently (success: true but no profile), we need to know.
            console.log('API Response:', data)

            window.location.href = '/'

        } catch (error: any) {
            toast.error(`Erro: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-red-600">Perfil não encontrado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-slate-600">
                        Encontramos sua conta de login, mas seus dados de perfil (gestor/professor/estudante) não foram salvos corretamente.
                    </p>

                    {userId && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 mb-3 font-medium">
                                Podemos tentar corrigir isso agora:
                            </p>
                            <Button
                                onClick={handleFixProfile}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Restaurando Perfil...
                                    </>
                                ) : (
                                    'Restaurar Meu Perfil'
                                )}
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Voltar para Login</Link>
                        </Button>
                        <div className="text-xs text-muted-foreground pt-2">
                            Se o problema persistir, delete a conta e cadastre novamente.
                        </div>
                    </div>

                    {/* Debug Info Area */}
                    {debugInfo && (
                        <div className="mt-6 p-4 bg-slate-900 text-slate-50 text-xs text-left rounded overflow-auto max-h-48 font-mono">
                            <p className="font-bold border-b border-slate-700 pb-1 mb-2">Debug Info (Developer):</p>
                            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
