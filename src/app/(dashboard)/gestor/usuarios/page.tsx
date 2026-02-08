import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { UsersTable } from '@/components/dashboard/gestor/users-table'

export const dynamic = 'force-dynamic'

async function checkSuperadmin() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore
                    }
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Use admin client to bypass RLS for superadmin check
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: gestor, error } = await adminClient
        .from('gestors')
        .select('is_superadmin')
        .eq('user_id', user.id)
        .single()

    console.log('Superadmin check:', { userId: user.id, gestor, error })

    return gestor?.is_superadmin || false
}

async function getUsers() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [gestorsRes, teachersRes, studentsRes] = await Promise.all([
        supabase.from('gestors').select('*, schools:school_id(name)').order('name'),
        supabase.from('teachers').select('*, schools:school_id(name)').order('name'),
        supabase.from('students').select('*, schools:school_id(name)').order('name')
    ])

    const users = [
        ...(gestorsRes.data || []).map((g: any) => ({
            id: g.id,
            user_id: g.user_id,
            name: g.name,
            email: g.email,
            phone: g.phone,
            role: 'gestor' as const,
            school_id: null,
            school_name: null,
            is_superadmin: g.is_superadmin,
            is_active: g.is_active ?? true,
            created_at: g.created_at
        })),
        ...(teachersRes.data || []).map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            name: t.name,
            email: t.email,
            phone: t.phone,
            cpf: t.cpf,
            role: 'professor' as const,
            school_id: t.school_id,
            school_name: t.schools?.name || null,
            is_superadmin: false,
            is_active: t.is_active ?? true,
            created_at: t.created_at
        })),
        ...(studentsRes.data || []).map((s: any) => ({
            id: s.id,
            user_id: s.user_id,
            name: s.name,
            email: s.email,
            phone: null,
            cpf: s.cpf,
            role: 'estudante' as const,
            school_id: s.school_id,
            school_name: s.schools?.name || null,
            is_superadmin: false,
            is_active: s.is_active ?? true,
            grade_level: s.grade_level,
            created_at: s.created_at
        }))
    ]

    users.sort((a, b) => a.name.localeCompare(b.name))
    return users
}

async function getSchools() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
        .from('schools')
        .select('id, name')
        .order('name')

    return data || []
}

export default async function UsersPage() {
    const isSuperadmin = await checkSuperadmin()

    if (!isSuperadmin) {
        redirect('/gestor')
    }

    const [users, schools] = await Promise.all([
        getUsers(),
        getSchools()
    ])

    return (
        <div className="p-6">
            <UsersTable initialUsers={users} schools={schools} />
        </div>
    )
}
