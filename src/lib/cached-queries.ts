/**
 * ===========================================
 * Cached Queries - React 19 Request Deduplication
 * ===========================================
 * 
 * Uses React.cache() to deduplicate identical Supabase calls
 * across Server Components in the same request lifecycle.
 * 
 * When a layout and its child page both call getUser(),
 * Supabase is only queried ONCE per request.
 */

import { cache } from 'react'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Cached user session - deduplicated across Server Components in same request.
 * Call this instead of creating a new client and calling getUser() directly.
 */
export const getUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
})

/**
 * Cached Supabase client - deduplicated per request.
 * Avoids creating multiple server clients in the same render pass.
 */
export const getServerClient = cache(async () => {
    return await createClient()
})

/**
 * Cached admin client - deduplicated per request.
 * Used for bypassing RLS in server-side operations.
 */
export const getAdminClient = cache(async () => {
    return await createAdminClient()
})
