import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/estudante/dashboard-client'
import { DashboardMobileHome } from '@/components/dashboard/estudante/mobile/DashboardMobileHome'

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

    // Fetch counts for Student Dashboard
    const [pendingAssessmentsRes, nextEventRes] = await Promise.all([
        currentClass?.id
            ? supabase
                .from('assessments')
                .select('id', { count: 'exact', head: true })
                .eq('class_id', currentClass.id)
            : Promise.resolve({ count: 0 }),
        currentNucleus?.id
            ? supabase
                .from('coop_eventos')
                .select('*')
                .eq('nucleo_escolar_id', currentNucleus.id)
                .gte('data_planejada', new Date().toISOString())
                .order('data_planejada', { ascending: true })
                .limit(1)
                .maybeSingle()
            : Promise.resolve({ data: null })
    ])

    return (
        <div className="w-full h-full">
            {/* Desktop View */}
            <div className="hidden md:block">
                <DashboardContainer>
                    <DashboardClient
                        student={student}
                        nucleusMember={nucleusMember}
                        currentClass={currentClass}
                        currentNucleus={currentNucleus}
                        pendingAssessmentsCount={pendingAssessmentsRes.count || 0}
                        nextEvent={nextEventRes.data}
                    />
                </DashboardContainer>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                <DashboardContainer>
                    <DashboardMobileHome />
                </DashboardContainer>
            </div>
        </div>
    )
}

function DashboardContainer({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => setIsMounted(true), []);
    if (!isMounted) return null;
    return <>{children}</>;
}

