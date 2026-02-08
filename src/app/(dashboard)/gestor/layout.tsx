import React from 'react'
import { GestorSidebar } from '@/components/dashboard/gestor/gestor-sidebar'
import { GestorHeader } from '@/components/dashboard/gestor/gestor-header'
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
            {/* Premium Glassmorphism Sidebar */}
            <GestorSidebar className="hidden md:flex" />

            {/* Main Content Area */}
            <div className="md:ml-72 min-h-screen flex flex-col">
                {/* Floating Header */}
                <GestorHeader
                    user={{ name: manager.name, email: manager.email }}
                    title="Painel do Gestor"
                />

                {/* Content */}
                <main className="flex-1 px-4 pb-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

