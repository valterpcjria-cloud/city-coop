import { createClient } from '@/lib/supabase/server'

export async function checkIsGestor(supabase: any, user: any) {
    if (!user) return false

    const role = user.user_metadata?.role
    if (role === 'gestor' || role === 'manager' || role === 'superadmin') return true

    // Check gestors table
    const { data: gestor } = await supabase
        .from('gestors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    if (gestor) return true

    // Check managers table (legacy fallback)
    const { data: manager } = await supabase
        .from('managers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

    if (manager) return true

    return false
}
