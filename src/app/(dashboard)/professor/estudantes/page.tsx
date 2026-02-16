import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { StudentsTable } from '@/components/dashboard/gestor/students-table'

export const dynamic = 'force-dynamic'

async function getContext() {
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
    if (!user) return null

    // Fetch teacher's school_id
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: teacher } = await adminClient
        .from('teachers')
        .select('school_id, schools(name)')
        .eq('user_id', user.id)
        .single() as any

    return teacher
}

async function getStudents(schoolId: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: students } = await supabase
        .from('students')
        .select('*, schools:school_id(name)')
        .eq('school_id', schoolId)
        .order('name')

    return (students || []).map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        name: s.name,
        email: s.email,
        cpf: s.cpf || null,
        role: 'estudante' as const,
        school_id: s.school_id,
        school: s.schools ? { name: s.schools.name } : undefined,
        is_active: s.is_active ?? true,
        grade_level: s.grade_level,
        created_at: s.created_at
    }))
}

export default async function ProfessorStudentsPage() {
    const context = await getContext()
    if (!context?.school_id) return <div>Acesso negado ou erro ao carregar contexto.</div>

    const students = await getStudents(context.school_id)
    const schools = [{ id: context.school_id, name: context.schools?.name }]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 -m-6 mb-0 bg-gradient-to-r from-[#4A90D9]/10 via-white to-[#F5A623]/10 border-b">
                <div>
                    <h1 className="text-3xl font-bold text-[#4A90D9]">Gerenciar Estudantes</h1>
                    <p className="text-[#6B7C93]">
                        Visualize e cadastre alunos da escola {context.schools?.name}.
                    </p>
                </div>
            </div>

            <div className="pt-6">
                <StudentsTable initialStudents={students} schools={schools} />
            </div>
        </div>
    )
}
