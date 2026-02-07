'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase/client'

interface ClassItem {
    id: string
    name: string
    code: string
}

export default function NewElectionPage() {
    const router = useRouter()
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState({
        class_id: '',
        data_inicio_inscricoes: '',
        data_fim_inscricoes: '',
        data_inicio_campanha: '',
        data_fim_campanha: '',
        data_inicio_votacao: '',
        data_fim_votacao: '',
        vagas_administracao: 3,
        vagas_fiscal_efetivos: 3,
        vagas_fiscal_suplentes: 3,
        vagas_etica: 3,
    })

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            const supabase = getSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // Get teacher's classes
            const { data: teacher } = await supabase
                .from('teachers')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (teacher) {
                const { data: classData } = await supabase
                    .from('classes')
                    .select('id, name, code')
                    .eq('teacher_id', teacher.id)
                    .eq('status', 'active')

                setClasses(classData || [])
            }
        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!form.class_id) {
            toast.error('Selecione uma turma')
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch('/api/elections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    data_inicio_inscricoes: form.data_inicio_inscricoes ? new Date(form.data_inicio_inscricoes).toISOString() : null,
                    data_fim_inscricoes: form.data_fim_inscricoes ? new Date(form.data_fim_inscricoes).toISOString() : null,
                    data_inicio_campanha: form.data_inicio_campanha ? new Date(form.data_inicio_campanha).toISOString() : null,
                    data_fim_campanha: form.data_fim_campanha ? new Date(form.data_fim_campanha).toISOString() : null,
                    data_inicio_votacao: form.data_inicio_votacao ? new Date(form.data_inicio_votacao).toISOString() : null,
                    data_fim_votacao: form.data_fim_votacao ? new Date(form.data_fim_votacao).toISOString() : null,
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('✅ Eleição criada com sucesso!')
                router.push('/professor/eleicoes')
            } else {
                toast.error(data.error || 'Erro ao criar eleição')
            }
        } catch (error) {
            console.error('Error creating election:', error)
            toast.error('Erro ao criar eleição')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Icons.spinner className="h-8 w-8 animate-spin text-city-blue" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-city-blue">
                    Nova Eleição
                </h1>
                <p className="text-tech-gray mt-1">
                    Configure uma nova eleição para os Conselhos Cooperativos
                </p>
            </div>

            {/* Class Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Turma</CardTitle>
                    <CardDescription>Selecione a turma para esta eleição</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select
                        value={form.class_id}
                        onValueChange={(value) => setForm({ ...form, class_id: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name} ({cls.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Vagas Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuração de Vagas</CardTitle>
                    <CardDescription>Defina o número de vagas por conselho</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Conselho de Administração</Label>
                        <Input
                            type="number"
                            min={1}
                            value={form.vagas_administracao}
                            onChange={(e) => setForm({ ...form, vagas_administracao: parseInt(e.target.value) || 3 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Conselho de Ética</Label>
                        <Input
                            type="number"
                            min={1}
                            value={form.vagas_etica}
                            onChange={(e) => setForm({ ...form, vagas_etica: parseInt(e.target.value) || 3 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Conselho Fiscal (Efetivos)</Label>
                        <Input
                            type="number"
                            min={1}
                            value={form.vagas_fiscal_efetivos}
                            onChange={(e) => setForm({ ...form, vagas_fiscal_efetivos: parseInt(e.target.value) || 3 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Conselho Fiscal (Suplentes)</Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.vagas_fiscal_suplentes}
                            onChange={(e) => setForm({ ...form, vagas_fiscal_suplentes: parseInt(e.target.value) || 3 })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Dates Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Cronograma</CardTitle>
                    <CardDescription>Configure as datas de cada fase (opcional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Início das Inscrições</Label>
                            <Input
                                type="datetime-local"
                                value={form.data_inicio_inscricoes}
                                onChange={(e) => setForm({ ...form, data_inicio_inscricoes: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fim das Inscrições</Label>
                            <Input
                                type="datetime-local"
                                value={form.data_fim_inscricoes}
                                onChange={(e) => setForm({ ...form, data_fim_inscricoes: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Início da Campanha</Label>
                            <Input
                                type="datetime-local"
                                value={form.data_inicio_campanha}
                                onChange={(e) => setForm({ ...form, data_inicio_campanha: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fim da Campanha</Label>
                            <Input
                                type="datetime-local"
                                value={form.data_fim_campanha}
                                onChange={(e) => setForm({ ...form, data_fim_campanha: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Início da Votação</Label>
                            <Input
                                type="datetime-local"
                                value={form.data_inicio_votacao}
                                onChange={(e) => setForm({ ...form, data_inicio_votacao: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fim da Votação</Label>
                            <Input
                                type="datetime-local"
                                value={form.data_fim_votacao}
                                onChange={(e) => setForm({ ...form, data_fim_votacao: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
                <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-city-blue to-coop-orange text-white"
                    onClick={handleSubmit}
                    disabled={submitting || !form.class_id}
                >
                    {submitting ? (
                        <>
                            <Icons.spinner className="h-5 w-5 mr-2 animate-spin" />
                            Criando...
                        </>
                    ) : (
                        <>
                            <Icons.add className="h-5 w-5 mr-2" />
                            Criar Eleição
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
