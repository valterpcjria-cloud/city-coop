import { createClient } from '@/lib/supabase/server'

/**
 * Calculates and updates student indicators using a database function (RPC).
 * This is much more efficient as it avoids fetching all responses to the server.
 */
export async function calculateStudentIndicators(studentId: string, classId: string) {
    const supabase = await createClient()

    // Call the database function
    const { data, error } = await (supabase as any).rpc('calculate_maturity_indicators', {
        p_student_id: studentId,
        p_class_id: classId
    })

    if (error) {
        console.error('Error updating indicators via RPC:', error)
        throw error
    }

    return data
}

/**
 * Gets the average indicators for a class using a database view.
 */
export async function getClassAverageIndicators(classId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v_class_average_indicators' as any)
        .select('*')
        .eq('class_id', classId)
        .single() as any

    if (error || !data) {
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching class averages:', error)
        }
        return null
    }

    return {
        cooperativismo: Number(data.cooperativismo) || 0,
        participacao: Number(data.participacao) || 0,
        organizacao: Number(data.organizacao) || 0,
        financeiro: Number(data.financeiro) || 0,
        planejamento: Number(data.planejamento) || 0
    }
}
