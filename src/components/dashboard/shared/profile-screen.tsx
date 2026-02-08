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

import { createClient } from '@/lib/supabase/client'

export function ProfileScreen() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const supabase = createClient()

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Limite de 2MB
        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB')
            return
        }

        setIsUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuário não autenticado')

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // 1. Upload para o Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Pegar a URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // 3. Atualizar o estado local e enviar para a API
            setProfile({ ...profile, avatar_url: publicUrl })

            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...profile,
                    avatar_url: publicUrl
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Falha ao atualizar avatar no perfil')
            }

            toast.success('Foto de perfil atualizada!')
        } catch (error: any) {
            console.error('Erro detalhado no upload:', error)
            const errorMsg = error.message || error.error_description || 'Erro desconhecido'
            toast.error(`Erro ao fazer upload: ${errorMsg}`)
        } finally {
            setIsUploading(false)
        }
    }

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
                    bio: profile.bio,
                    avatar_url: profile.avatar_url
                })
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Falha ao salvar')
            }
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
                            <Avatar className="h-24 w-24 border-4 border-white shadow-xl bg-white">
                                <AvatarImage src={profile?.avatar_url} className="object-cover" />
                                <AvatarFallback className="bg-slate-100 text-city-blue text-xl font-bold">
                                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : initials}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-city-blue transition-colors cursor-pointer"
                            >
                                <Camera className="h-4 w-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                            </label>
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
                                <Button type="submit" variant="brand" disabled={isSaving || isUploading}>
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
