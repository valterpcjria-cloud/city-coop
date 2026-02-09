// ===========================================
// Supabase Middleware Helper
// ===========================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes check
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register') ||
        request.nextUrl.pathname.startsWith('/reset-password')

    const isDashboardRoute = request.nextUrl.pathname.startsWith('/professor') ||
        request.nextUrl.pathname.startsWith('/estudante') ||
        request.nextUrl.pathname.startsWith('/gestor')

    // If user tries to access dashboard without being logged in, redirect to login
    if (!user && isDashboardRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If logged in user tries to access auth pages, redirect to appropriate dashboard
    if (user && isAuthRoute) {
        // Get user role from profile
        const { data: teacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const { data: gestor } = await supabase
            .from('gestors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const url = request.nextUrl.clone()
        if (gestor) {
            url.pathname = '/gestor'
        } else if (teacher) {
            url.pathname = '/professor'
        } else {
            url.pathname = '/estudante'
        }
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
