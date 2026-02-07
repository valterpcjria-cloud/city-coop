import React from 'react'
import { Sidebar } from '@/components/dashboard/gestor/sidebar'
import { DashboardHeader } from '@/components/dashboard/professor/header'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GestorDashboardLayout({
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

    // Verify if user is a manager
    let manager = null
    try {
        const { data } = await adminAuth
            .from('managers')
            .select('*')
            .eq('user_id', user.id)
            .single() as any
        manager = data
    } catch (err) {
        console.error('Error fetching manager profile:', err)
    }

    if (!manager) {
        // Fallback to metadata check before giving up
        const role = user.user_metadata?.role
        if (role === 'manager') {
            // Create a temporary manager object from metadata to allow access 
            // while table/record issues are resolved
            manager = {
                name: user.user_metadata?.name || 'Gestor',
                email: user.email
            }
        } else {
            // Check if teacher/student before error
            const { data: teacher } = await adminAuth
                .from('teachers')
                .select('id')
                .eq('user_id', user.id)
                .single()
            if (teacher) redirect('/professor')

            const { data: student } = await adminAuth
                .from('students')
                .select('id')
                .eq('user_id', user.id)
                .single()
            if (student) redirect('/estudante')

            redirect('/onboarding-error')
        }
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar className="w-64 hidden md:block" />
            <div className="flex-1 flex flex-col min-h-screen">
                <DashboardHeader
                    user={{ name: manager.name, email: manager.email }}
                    title="Painel do Gestor"
                />
                <main className="flex-1 p-6 bg-slate-50/50">
                    {children}
                </main>
            </div>
        </div>
    )
}
