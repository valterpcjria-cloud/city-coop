'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function GestorSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [settings, setSettings] = useState<any[]>([])
    const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/gestor/settings')
                const data = await response.json()
                if (data.settings) {
                    setSettings(data.settings)
                }
            } catch (error) {
                toast.error('Erro ao carregar configurações')
            } finally {
                setIsLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Filter out masked values before saving (we don't want to save "sk-***" to DB)
            const cleanSettings = settings.filter(s => {
                const isMasked = s.value?.includes('***')
                return !isMasked
            })

            if (cleanSettings.length === 0) {
                toast.info('Nenhuma alteração detectada para salvar.')
                setIsSaving(false)
                return
            }

            const response = await fetch('/api/gestor/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: cleanSettings })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Falha ao salvar')
            toast.success('Configurações salvas com sucesso!')

            // Refresh to get updated data (and new masking if needed)
            const refreshRes = await fetch('/api/gestor/settings')
            const refreshData = await refreshRes.json()
            if (refreshData.settings) setSettings(refreshData.settings)

        } catch (error: any) {
            toast.error(`Erro: ${error.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    const updateSetting = (key: string, value: string) => {
        setSettings(settings.map(s => s.key === key ? { ...s, value } : s))
    }

    const handleFocus = (key: string, value: string) => {
        // If it's a masked value, clear it on focus to let user paste new key
        if (value.includes('***')) {
            updateSetting(key, '')
        }
    }

    const toggleShow = (key: string) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-city-blue">Configurações do Sistema</h2>
                <p className="text-tech-gray">Gerencie as chaves de API e conexões com provedores de IA.</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Provedores de Inteligência Artificial</CardTitle>
                        <CardDescription>
                            Configure as chaves necessárias para que o DOT Assistente e as avaliações funcionem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {settings.map((setting) => (
                            <div key={setting.key} className="space-y-2">
                                <Label htmlFor={setting.key} className="capitalize">
                                    {setting.description || setting.key.replace(/_/g, ' ')}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={setting.key}
                                        type={showKeys[setting.key] ? 'text' : 'password'}
                                        value={setting.value || ''}
                                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                                        onFocus={() => handleFocus(setting.key, setting.value || '')}
                                        placeholder="sk-..."
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow(setting.key)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showKeys[setting.key] ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Última atualização: {new Date(setting.updated_at).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        ))}

                        <div className="pt-4">
                            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto" variant="brand">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Configurações'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                            <Icons.settings className="h-4 w-4 text-yellow-600" />
                            Nota de Segurança
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                            As chaves de API são armazenadas de forma segura no banco de dados e acessadas apenas pelo servidor.
                            Certifique-se de não compartilhar o acesso à sua conta de administrador.
                            Caso uma chave seja comprometida, apague o valor e clique em salvar para removê-la.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
