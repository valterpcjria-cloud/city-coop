import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function GestorStudentsPage() {
    const adminAuth = await createAdminClient()

    const { data: students } = await adminAuth
        .from('students')
        .select('*, school:schools(name)')
        .order('name', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Estudantes</h2>
                    <p className="text-tech-gray">Ouvidoria e gestão de alunos cadastrados.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Escola</TableHead>
                                <TableHead>Ano/Série</TableHead>
                                <TableHead>Data Cadastro</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students?.map((student: any) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>{student.email || '--'}</TableCell>
                                    <TableCell>{student.school?.name || 'Não alocado'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{student.grade_level}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(student.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                </TableRow>
                            ))}
                            {(!students || students.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-tech-gray">
                                        Nenhum estudante encontrado.
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
