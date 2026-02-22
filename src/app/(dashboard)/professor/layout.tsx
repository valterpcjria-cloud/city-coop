import React from 'react'
import { Sidebar } from '@/components/dashboard/professor/sidebar'
import { DashboardHeader } from '@/components/dashboard/professor/header'
import { PageTransition } from '@/components/dashboard/page-transition'
import { MobileNavManager } from '@/components/navigation/MobileNavManager'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfessorDashboardLayout({
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

    // Verify if user is actually a teacher (Use Admin Client to bypass RLS)
    const { data: teacher } = await adminAuth
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single() as any

    if (!teacher) {
        // If not teacher, CHECK if it is a student before redirecting
        const { data: student } = await adminAuth
            .from('students')
            .select('id')
            .eq('user_id', user.id)
            .single() as any

        if (student) {
            redirect('/estudante')
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

    return (
        <div className="flex min-h-screen">
            <Sidebar className="w-64 hidden md:block" />
            <div className="flex-1 flex flex-col min-h-screen">
                <DashboardHeader
                    user={{ name: teacher.name, email: teacher.email }}
                    title="Painel do Professor"
                />
                <main className="flex-1 p-6 pb-20 md:pb-6 bg-slate-50/50">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
            {/* Mobile Navigation — only visible on screens < md */}
            <MobileNavManager
                user={{ name: teacher.name, email: teacher.email }}
            />
        </div>
    )
}

