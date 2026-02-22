import React from 'react'
import { StudentSidebar } from '@/components/dashboard/estudante/sidebar'
import { StudentHeader } from '@/components/dashboard/estudante/header'
import { PageTransition } from '@/components/dashboard/page-transition'
import { StudentMobileNavManager } from '@/components/navigation/StudentMobileNavManager'
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
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop Sidebar - Hidden on mobile */}
            <StudentSidebar className="w-64 hidden md:block" />

            <div className="flex-1 flex flex-col min-h-screen">
                <StudentHeader user={{
                    name: student.name,
                    email: student.email,
                    nucleus: nucleusName,
                    image: student.avatar_url // Use avatar_url if available
                }} />

                {/* Responsive main content: adds bottom padding to accommodate BottomNav */}
                <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>

            {/* Mobile Navigation Orquestration */}
            <StudentMobileNavManager user={{
                name: student.name,
                email: student.email,
                image: student.avatar_url,
                nucleus: nucleusName
            }} />
        </div>
    )
}

