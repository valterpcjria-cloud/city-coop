import { createAdminClient } from '@/lib/supabase/server'
import { StudentsTable } from '@/components/dashboard/gestor/students-table'

export default async function GestorStudentsPage() {
    const adminAuth = await createAdminClient()

    // Fetch students with school relation
    const { data: students } = await adminAuth
        .from('students')
        .select('*, school:schools(name)')
        .order('name', { ascending: true })

    // Fetch schools for allocation
    const { data: schools } = await adminAuth
        .from('schools')
        .select('id, name')
        .order('name')

    const { data: { user } } = await adminAuth.auth.getUser()
    const { data: gestor } = await adminAuth
        .from('gestors')
        .select('is_superadmin')
        .eq('user_id', user?.id as string)
        .single() as { data: { is_superadmin: boolean } | null, error: any }

    const isSuperadmin = gestor?.is_superadmin || false

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Estudantes</h2>
                    <p className="text-tech-gray">Gestão de matrículas, alocação de séries e ouvidoria.</p>
                </div>
            </div>

            <StudentsTable
                initialStudents={(students || []).map((s: any) => ({
                    ...s,
                    user_id: s.user_id || ''
                }))}
                schools={schools || []}
                isSuperadmin={isSuperadmin}
            />
        </div>
    )
}
