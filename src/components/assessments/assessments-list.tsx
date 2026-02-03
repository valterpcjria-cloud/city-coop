import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AssessmentsListProps {
    classId: string
    assessments: any[]
}

const typeLabels: Record<string, string> = {
    cooperativismo: 'Cooperativismo',
    participacao: 'Participação',
    organizacao_nucleos: 'Org. Núcleos',
    planejamento_evento: 'Planejamento',
    gestao_financeira: 'Financeiro',
}

export function AssessmentsList({ classId, assessments }: AssessmentsListProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Avaliações Realizadas</CardTitle>
                    <CardDescription>Gerencie e acompanhe os resultados.</CardDescription>
                </div>
                <Button size="sm" asChild>
                    <Link href={`/professor/turmas/${classId}/avaliacoes/nova`}>
                        <Icons.add className="mr-2 h-4 w-4" />
                        Nova Avaliação
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                {assessments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        Nenhuma avaliação criada ainda.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assessments.map((assessment) => (
                            <div key={assessment.id} className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg hover:bg-slate-100 transition-colors">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-900">{assessment.title}</h4>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {typeLabels[assessment.type] || assessment.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Criado em {format(new Date(assessment.created_at), "d 'de' MMMM", { locale: ptBR })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/professor/turmas/${classId}/avaliacoes/${assessment.id}`}>
                                            Ver Resultados
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
