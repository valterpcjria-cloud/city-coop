import { constructMetadata } from '@/lib/metadata'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export const metadata = constructMetadata({
    title: 'Gestão de Eventos',
    description: 'Acompanhe e gerencie os planos de evento da sua cooperativa.'
})

export default async function GestorEventsPage() {
    const adminAuth = await createAdminClient()

    const { data: plans } = await adminAuth
        .from('event_plans')
        .select('*, class:classes(name, school:schools(name))')
        .order('created_at', { ascending: false })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500">Aprovado</Badge>
            case 'submitted': return <Badge className="bg-orange-500">Pendente</Badge>
            case 'rejected': return <Badge variant="destructive">Rejeitado</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Planos de Evento</h2>
                    <p className="text-tech-gray">Oversight global de todos os projetos planeiados.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todos os Planos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Evento</TableHead>
                                <TableHead>Escola / Turma</TableHead>
                                <TableHead>Data Submissão</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.map((plan: any) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.title}</TableCell>
                                    <TableCell>
                                        <div className="text-xs font-semibold">{plan.class?.school?.name || '--'}</div>
                                        <div className="text-xs text-tech-gray">{plan.class?.name || '--'}</div>
                                    </TableCell>
                                    <TableCell>
                                        {plan.submitted_at ? new Date(plan.submitted_at).toLocaleDateString('pt-BR') : '--'}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            Visualizar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!plans || plans.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-tech-gray">
                                        Nenhum plano de evento encontrado.
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
