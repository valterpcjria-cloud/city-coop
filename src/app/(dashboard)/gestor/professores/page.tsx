import { createAdminClient } from '@/lib/supabase/server'
import { TeachersTable } from '@/components/dashboard/gestor/teachers-table'

export default async function GestorTeachersPage() {
    const adminAuth = await createAdminClient()

    // Fetch teachers with school relation
    const { data: teachers } = await adminAuth
        .from('teachers')
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
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Professores</h2>
                    <p className="text-tech-gray">Gestão de educadores e alocação escolar.</p>
                </div>
            </div>

            <TeachersTable
                initialTeachers={teachers || []}
                schools={schools || []}
                isSuperadmin={isSuperadmin}
            />
        </div>
    )
}

