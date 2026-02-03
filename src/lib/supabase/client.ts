// ===========================================
// Supabase Client - Browser/Client-side
// ===========================================

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Singleton instance for client-side
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = createClient()
    }
    return supabaseClient
}
