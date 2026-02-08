'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { Loader2, Camera, Building2, UserCircle } from 'lucide-react'

export function ProfileScreen() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile')
                const data = await response.json()
                if (data.profile) {
                    setProfile(data.profile)
                } else {
                    toast.error('Não foi possível carregar o perfil')
                }
            } catch (error) {
                toast.error('Erro ao conectar com o servidor')
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                    bio: profile.bio
                })
            })
            if (!response.ok) throw new Error('Falha ao salvar')
            toast.success('Perfil atualizado com sucesso!')
        } catch (error: any) {
            toast.error('Erro ao salvar alterações')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    const initials = profile?.name?.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <Card className="w-full md:w-80 shadow-premium border-slate-200/60 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-city-blue to-city-blue-dark" />
                    <CardContent className="pt-0 relative flex flex-col items-center">
                        <div className="relative -mt-12 group">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                                <AvatarImage src={profile?.image} />
                                <AvatarFallback className="bg-slate-100 text-city-blue text-xl font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-city-blue transition-colors">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="font-bold text-lg text-slate-800">{profile?.name}</h3>
                            <p className="text-sm text-tech-gray capitalize">{profile?.role}</p>
                        </div>

                        <div className="w-full mt-6 space-y-3 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Building2 className="h-4 w-4 text-city-blue" />
                                <span>{profile?.school?.name || 'Escola não vinculada'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <UserCircle className="h-4 w-4 text-city-blue" />
                                <span className="capitalize">{profile?.role || 'Usuário'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Form */}
                <Card className="flex-1 shadow-premium border-slate-200/60">
                    <CardHeader>
                        <CardTitle className="text-xl text-city-blue">Informações Pessoais</CardTitle>
                        <CardDescription>Mantenha seus dados atualizados para uma melhor experiência.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input
                                        id="name"
                                        value={profile?.name || ''}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="focus-visible:ring-city-blue"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="bg-slate-50 text-slate-500 border-dashed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                <Input
                                    id="phone"
                                    value={profile?.phone || ''}
                                    placeholder="(00) 00000-0000"
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="focus-visible:ring-city-blue"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Sobre Mim (Bio)</Label>
                                <Textarea
                                    id="bio"
                                    rows={4}
                                    placeholder="Conte um pouco sobre você..."
                                    value={profile?.bio || ''}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="resize-none focus-visible:ring-city-blue"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" variant="brand" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar Alterações'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
