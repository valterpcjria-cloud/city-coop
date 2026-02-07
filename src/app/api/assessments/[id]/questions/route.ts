import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Question {
    text: string
    type: 'multiple-choice' | 'text' | 'redacao'
    options?: string[]
    correctAnswer?: number
    answerKey?: string
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: assessmentId } = await params
        const supabase = await createClient()

        // Verificar autenticação
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Obter questões do body
        const { questions } = await request.json() as { questions: Question[] }

        if (!Array.isArray(questions)) {
            return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
        }

        // Validar cada questão
        for (const q of questions) {
            if (!q.text || !q.type) {
                return NextResponse.json({ error: 'Questão inválida: texto e tipo são obrigatórios' }, { status: 400 })
            }
            if (q.type === 'multiple-choice') {
                if (!q.options || q.options.length < 2) {
                    return NextResponse.json({ error: 'Questão de múltipla escolha precisa de pelo menos 2 alternativas' }, { status: 400 })
                }
            }
        }

        // Usar admin client para bypass RLS
        const adminClient = await createAdminClient()

        // Verificar se o usuário é professor da turma
        const { data: teacher } = await adminClient
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!teacher) {
            return NextResponse.json({ error: 'Perfil de professor não encontrado' }, { status: 403 })
        }

        // Verificar se a avaliação existe e pertence ao professor
        const { data: assessment, error: assessmentError } = await adminClient
            .from('assessments')
            .select('id, class_id, created_by')
            .eq('id', assessmentId)
            .single()

        if (assessmentError || !assessment) {
            return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 })
        }

        // Verificar se o professor é dono da turma
        const { data: classData } = await adminClient
            .from('classes')
            .select('teacher_id')
            .eq('id', assessment.class_id)
            .single()

        if (classData?.teacher_id !== teacher.id && assessment.created_by !== teacher.id) {
            return NextResponse.json({ error: 'Sem permissão para editar esta avaliação' }, { status: 403 })
        }

        // Atualizar questões
        const { error: updateError } = await adminClient
            .from('assessments')
            .update({ questions })
            .eq('id', assessmentId)

        if (updateError) {
            console.error('Erro ao atualizar questões:', updateError)
            return NextResponse.json({ error: 'Erro ao salvar questões' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Questões atualizadas com sucesso' })

    } catch (error) {
        console.error('Erro na API de questões:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
