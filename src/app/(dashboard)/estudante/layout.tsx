import React from 'react'
import { StudentSidebar } from '@/components/dashboard/estudante/sidebar'
import { StudentHeader } from '@/components/dashboard/estudante/header'
import { PageTransition } from '@/components/dashboard/page-transition'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const adminAuth = await createAdminClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Parallelize student check and nucleus info
    const [studentRes, nucleusMemberRes] = await Promise.all([
        adminAuth
            .from('students')
            .select('*')
            .eq('user_id', user.id)
            .single() as any,
        // Pre-fetch simplified nucleus info
        supabase
            .from('nucleus_members')
            .select('nucleus:nuclei(name)')
            .eq('user_id', user.id) // Assuming user_id is on nucleus_members or use student_id
            .maybeSingle() as any
    ])

    const student = studentRes.data

    if (!student) {
        // ... (rest of the checks if needed, but student is primary here)
        redirect('/onboarding-error')
    }

    const nucleusName = nucleusMemberRes.data?.nucleus?.name || null

    return (
        <div className="flex min-h-screen">
            <StudentSidebar className="w-64 hidden md:block" />
            <div className="flex-1 flex flex-col min-h-screen">
                <StudentHeader user={{
                    name: student.name,
                    email: student.email,
                    nucleus: nucleusName
                }} />
                <main className="flex-1 p-6 bg-slate-50/50">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
        </div>
    )
}
