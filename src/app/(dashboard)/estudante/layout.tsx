import React from 'react'
import { StudentSidebar } from '@/components/dashboard/estudante/sidebar'
import { StudentHeader } from '@/components/dashboard/estudante/header'
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

    // Verify if user is student (Use Admin Client to bypass RLS)
    const { data: student } = await adminAuth
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single() as any

    if (!student) {
        // If not student, CHECK if teacher
        const { data: teacher } = await adminAuth
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (teacher) {
            redirect('/professor')
        }

        const { data: manager } = await adminAuth
            .from('managers')
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (manager) {
            redirect('/gestor')
        }

        // If neither, go to error page
        redirect('/onboarding-error')
    }

    // Get student's nucleus to show in header
    // This is a bit more complex join, simplified here
    let nucleusName = null
    const { data: nucleusMember } = await supabase
        .from('nucleus_members')
        .select('nucleus:nuclei(name)')
        .eq('student_id', student.id)
        .single() as any

    if (nucleusMember?.nucleus) {
        nucleusName = nucleusMember.nucleus.name
    }

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
                    {children}
                </main>
            </div>
        </div>
    )
}
