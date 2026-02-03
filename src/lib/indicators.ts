import { createClient } from '@/lib/supabase/server'

interface IndicatorScores {
    cooperativism: number
    democratic: number
    nuclei: number
    financial: number
    planning: number
}

// Maps assessment types to indicator column names
const typeMapping: Record<string, keyof IndicatorScores> = {
    cooperativismo: 'cooperativism',
    participacao: 'democratic',
    organizacao_nucleos: 'nuclei',
    gestao_financeira: 'financial',
    planejamento_evento: 'planning',
}

const columnMapping: Record<keyof IndicatorScores, string> = {
    cooperativism: 'cooperativism_understanding',
    democratic: 'democratic_functioning',
    nuclei: 'nuclei_organization',
    financial: 'financial_management',
    planning: 'event_planning',
}

export async function calculateStudentIndicators(studentId: string, classId: string) {
    const supabase = await createClient()

    // Fetch all graded assessments for this student within the class
    const { data: responses } = await supabase
        .from('assessment_responses')
        .select(`
      score,
      assessment:assessments(type)
    `)
        .eq('student_id', studentId)
        .not('score', 'is', null)

    if (!responses || responses.length === 0) return null

    // Calculate averages separately
    const totals: Record<string, { sum: number; count: number }> = {}

    responses.forEach((r: any) => {
        const type = r.assessment.type
        if (!totals[type]) totals[type] = { sum: 0, count: 0 }
        totals[type].sum += r.score
        totals[type].count += 1
    })

    // Prepare update object
    const updates: any = {
        class_id: classId,
        student_id: studentId,
        updated_at: new Date().toISOString()
    }

    // Populate fields based on averages
    for (const [type, data] of Object.entries(totals)) {
        const avg = data.sum / data.count
        const mappedKey = typeMapping[type]
        if (mappedKey) {
            const dbColumn = columnMapping[mappedKey]
            updates[dbColumn] = avg
        }
    }

    // Upsert into maturity_indicators
    // We use upsert to create if not exists or update if exists
    const { error } = await supabase
        .from('maturity_indicators')
        .upsert(updates, { onConflict: 'class_id, student_id' })

    if (error) {
        console.error('Error updating indicators:', error)
        throw error
    }

    return updates
}

export async function getClassAverageIndicators(classId: string) {
    const supabase = await createClient()

    const { data: indicators } = await supabase
        .from('maturity_indicators')
        .select('*')
        .eq('class_id', classId)

    if (!indicators || indicators.length === 0) return null

    const sums = {
        cooperativism_understanding: 0,
        democratic_functioning: 0,
        nuclei_organization: 0,
        financial_management: 0,
        event_planning: 0
    }

    let count = 0

    indicators.forEach((ind: any) => {
        count++
        sums.cooperativism_understanding += ind.cooperativism_understanding || 0
        sums.democratic_functioning += ind.democratic_functioning || 0
        sums.nuclei_organization += ind.nuclei_organization || 0
        sums.financial_management += ind.financial_management || 0
        sums.event_planning += ind.event_planning || 0
    })

    return {
        cooperativismo: sums.cooperativism_understanding / count,
        participacao: sums.democratic_functioning / count,
        organizacao: sums.nuclei_organization / count,
        financeiro: sums.financial_management / count,
        planejamento: sums.event_planning / count
    }
}
