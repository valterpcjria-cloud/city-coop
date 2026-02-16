import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/estudante/dashboard-client'

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch Student Data and Nucleus in parallel
    const [studentRes, nucleusMemberRes] = await Promise.all([
        supabase
            .from('students')
            .select('*, classes:class_students(class:classes(*))')
            .eq('user_id', user.id)
            .single(),
        supabase
            .from('nucleus_members')
            .select('role, nucleus:nuclei(*)')
            .eq('user_id', user.id)
            .maybeSingle()
    ])

    const student = studentRes.data as any
    const nucleusMember = nucleusMemberRes.data as any

    const currentClass = student?.classes?.[0]?.class
    const currentNucleus = nucleusMember?.nucleus

    return (
        <DashboardClient
            student={student}
            nucleusMember={nucleusMember}
            currentClass={currentClass}
            currentNucleus={currentNucleus}
        />
    )
}
