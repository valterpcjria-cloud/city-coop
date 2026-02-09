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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-city-blue">Estudantes</h2>
                    <p className="text-tech-gray">Gestão de matrículas, alocação de séries e ouvidoria.</p>
                </div>
            </div>

            <StudentsTable
                initialStudents={students || []}
                schools={schools || []}
            />
        </div>
    )
}
