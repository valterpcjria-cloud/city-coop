import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'

export default async function GestorTeachersPage() {
    const adminAuth = await createAdminClient()

    const { data: teachers } = await adminAuth
        .from('teachers')
        .select('*, school:schools(name)')
        .order('name', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Professores</h2>
                    <p className="text-tech-gray">Visualize e gerencie todos os educadores da plataforma.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Professores</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Escola</TableHead>
                                <TableHead>Data Cadastro</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers?.map((teacher: any) => (
                                <TableRow key={teacher.id}>
                                    <TableCell className="font-medium">{teacher.name}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>{teacher.school?.name || 'Não alocado'}</TableCell>
                                    <TableCell>{new Date(teacher.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                </TableRow>
                            ))}
                            {(!teachers || teachers.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-tech-gray">
                                        Nenhum professor encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
