import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: assessmentId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const adminClient = await createAdminClient()

        // 1. Verificar se o usuário é o criador (professor)
        const { data: assessment, error: fetchError } = await adminClient
            .from('assessments')
            .select(`
                id, 
                created_by,
                teachers!assessments_created_by_fkey (user_id)
            `)
            .eq('id', assessmentId)
            .single() as any

        if (fetchError || !assessment) {
            return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 })
        }

        // Validar se o professor é quem está deletando
        if (assessment.teachers?.user_id !== user.id) {
            return NextResponse.json({ error: 'Apenas o criador pode excluir esta avaliação' }, { status: 403 })
        }

        // 2. Verificar se existem respostas
        const { count, error: countError } = await adminClient
            .from('assessment_responses')
            .select('*', { count: 'exact', head: true })
            .eq('assessment_id', assessmentId)

        if (countError) throw countError

        if (count && count > 0) {
            return NextResponse.json({
                error: 'Não é possível excluir uma avaliação que já possui respostas de alunos.'
            }, { status: 400 })
        }

        // 3. Deletar
        const { error: deleteError } = await adminClient
            .from('assessments')
            .delete()
            .eq('id', assessmentId)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true, message: 'Avaliação excluída com sucesso' })

    } catch (error: any) {
        console.error('[API] Error deleting assessment:', error)
        return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 })
    }
}
