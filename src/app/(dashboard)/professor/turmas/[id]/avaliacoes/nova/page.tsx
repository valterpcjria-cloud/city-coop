import { createClient } from '@/lib/supabase/server'
import { CreateAssessmentForm } from '@/components/assessments/create-assessment-form'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
    console.log('[DEBUG-TRACE:V3] Rendering NewAssessmentPage')
    const supabase = await createClient()
    const { id } = await params

    const { data: turma } = await supabase
        .from('classes')
        .select('name, code')
        .eq('id', id)
        .single()

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/professor/turmas/${id}`}>
                        <Icons.arrowRight className="h-4 w-4 rotate-180" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Nova Avaliação</h2>
                    <p className="text-muted-foreground">{(turma as any)?.name} - Criar teste de competência</p>
                </div>
            </div>

            <CreateAssessmentForm classId={id} />
        </div>
    )
}
