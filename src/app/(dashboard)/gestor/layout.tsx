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
    // Parallelize client creation for faster layout rendering
    const [supabase, adminAuth] = await Promise.all([
        createClient(),
        createAdminClient()
    ])

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
            .from('gestors')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle() as any
        manager = data
    } catch (err) {
        console.error('Error fetching gestor profile:', err)
    }

    if (!manager) {
        // Fallback to metadata check before giving up
        const role = user.user_metadata?.role
        if (role === 'manager' || role === 'gestor' || role === 'superadmin') {
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
    const isSuperadmin = manager.is_superadmin || user.user_metadata?.role === 'superadmin'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            {/* Premium Glassmorphism Sidebar */}
            <GestorSidebar className="hidden md:flex shadow-2xl shadow-blue-500/5" isSuperadmin={isSuperadmin} />

            {/* Decorative background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[20%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] animate-pulse delay-700" />
            </div>

            {/* Main Content Area */}
            <div className="md:ml-72 min-h-screen flex flex-col relative z-10 transition-all duration-500">
                {/* Floating Header */}
                <GestorHeader
                    user={{ name: manager.name, email: manager.email }}
                    title="Painel do Gestor"
                />

                {/* Content */}
                <main className="flex-1 px-6 pb-12 pt-4">
                    {children}
                </main>
            </div>
        </div>
    )
}

