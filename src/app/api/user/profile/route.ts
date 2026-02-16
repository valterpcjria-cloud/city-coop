import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { validateAuth } from '@/lib/auth-guard'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limiter'
import { recordAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const auth = await validateAuth()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.GET)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = await createClient()
        const user = auth.user!

        // Tenta capturar os dados do usuário autenticado como fallback garantido
        const authData = {
            id: user.id,
            email: user.email,
            name: (user as any).user_metadata?.name || '',
        }

        let userProfile: any = null
        let role: string = ''

        // 1. Tenta buscar em GESTORS (tabela mais recente para admins)
        console.log('[API_PROFILE] Querying gestors for userId:', user.id)
        const { data: gestor, error: gError } = await (supabase.from('gestors') as any)
            .select('*, school:schools(*)')
            .eq('user_id', user.id)
            .maybeSingle()

        if (gError) console.error('[API_PROFILE] Gestors error:', gError.message)

        if (gestor) {
            console.log('[API_PROFILE] Found in gestors')
            userProfile = gestor
            role = 'gestor'
        } else {
            // 2. Tenta buscar em MANAGERS
            console.log('[API_PROFILE] Querying managers...')
            const { data: manager, error: mError } = await (supabase.from('managers') as any)
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle()

            if (mError) console.error('[API_PROFILE] Managers error:', mError.message)

            if (manager) {
                console.log('[API_PROFILE] Found in managers')
                userProfile = manager
                role = 'gestor'
            }
        }

        // 3. Professor
        if (!userProfile) {
            const { data: teacher } = await supabase
                .from('teachers')
                .select('*, school:schools(*)')
                .eq('user_id', user.id)
                .maybeSingle()
            if (teacher) {
                userProfile = teacher
                role = 'professor'
            }
        }

        // 4. Estudante
        if (!userProfile) {
            const { data: student } = await supabase
                .from('students')
                .select('*, school:schools(*)')
                .eq('user_id', user.id)
                .maybeSingle()
            if (student) {
                userProfile = student
                role = 'estudante'
            }
        }

        console.log('[API_PROFILE] Final results:', { found: !!userProfile, role })

        // 5. Fallback para metadados (garante que gestores sempre vejam algo)
        if (!userProfile) {
            const metaRole = (user as any).user_metadata?.role
            if (metaRole === 'manager' || metaRole === 'gestor') {
                console.log('[API_PROFILE] Using metadata fallback')
                userProfile = {
                    name: (user as any).user_metadata?.name || 'Gestor',
                    email: user.email,
                    avatar_url: (user as any).user_metadata?.avatar_url || null
                }
                role = 'gestor'
            }
        }

        if (userProfile) {
            // Garante que o email venha do Auth se não estiver na tabela
            return NextResponse.json({
                profile: {
                    ...userProfile,
                    role,
                    email: userProfile.email || authData.email,
                    name: userProfile.name || authData.name,
                    phone: userProfile.phone || '',
                    bio: userProfile.bio || '',
                    avatar_url: userProfile.avatar_url || null
                }
            })
        }

        return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

    } catch (error: any) {
        console.error('Erro ao buscar perfil:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await validateAuth()
        if (!auth.success) return auth.response!

        const rateLimitKey = getRateLimitKey(request, auth.user?.id)
        const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.POST)
        if (!rateLimit.success) {
            return NextResponse.json({ error: rateLimit.error }, { status: 429 })
        }

        const supabase = await createClient()
        const user = auth.user!

        const body = await request.json()
        const { name, phone, bio, avatar_url } = body

        console.log('[API_PROFILE_POST] Attempting update for user:', user.id, { name, phone, bio, avatar_url })

        // 1. Tenta atualizar em GESTORS
        const { data: gestor } = await (supabase.from('gestors') as any).select('id').eq('user_id', user.id).maybeSingle()
        if (gestor) {
            console.log('[API_PROFILE_POST] Updating gestors table')
            const { error } = await (supabase.from('gestors') as any).update({ name, phone, bio, avatar_url }).eq('id', (gestor as any).id)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        // 2. Tenta atualizar em MANAGERS
        const { data: manager } = await (supabase.from('managers') as any).select('id').eq('user_id', user.id).maybeSingle()
        if (manager) {
            console.log('[API_PROFILE_POST] Updating managers table')
            const { error } = await (supabase.from('managers') as any).update({ name, phone, bio, avatar_url }).eq('id', (manager as any).id)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        // 3. Tenta atualizar em TEACHERS
        const { data: teacher } = await (supabase.from('teachers') as any).select('id').eq('user_id', user.id).maybeSingle()
        if (teacher) {
            const { error } = await (supabase.from('teachers') as any).update({ name, phone, bio, avatar_url }).eq('id', (teacher as any).id)
            if (error) throw error
            return NextResponse.json({ success: true })
        }

        // 4. Tenta atualizar em STUDENTS
        const { data: student } = await (supabase.from('students') as any).select('id').eq('user_id', user.id).maybeSingle()
        if (student) {
            const { error } = await (supabase.from('students') as any).update({ name, phone, bio, avatar_url }).eq('id', (student as any).id)
            if (error) throw error

            // Audit log
            await recordAuditLog({
                userId: user.id,
                action: 'UPDATE_PROFILE',
                resource: 'students',
                resourceId: student.id,
                newData: { name, phone, bio },
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Perfil não encontrado para atualização' }, { status: 404 })

    } catch (error: any) {
        console.error('Erro ao atualizar perfil:', error)
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
    }
}
