import { ClassForm } from '@/components/forms/class-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewClassPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Nova Turma</h2>
                <p className="text-slate-500">Crie uma nova turma para iniciar o projeto City Coop.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Turma</CardTitle>
                    <CardDescription>
                        Preencha as informações abaixo. O código da turma será usado pelos alunos para se matricularem.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ClassForm />
                </CardContent>
            </Card>
        </div>
    )
}
