/**
 * ===========================================
 * Audit Logging Helper
 * ===========================================
 * 
 * Provides a standardized way to record sensitive actions.
 */

import { createAdminClient } from './supabase/server'

interface AuditParams {
    userId: string
    action: string
    resource: string
    resourceId?: string
    oldData?: any
    newData?: any
    ip?: string
    userAgent?: string
}

/**
 * Records an entry in the audit_logs table
 * Uses Admin Client to ensure logs are written even if user permissions are tight
 */
export async function recordAuditLog({
    userId,
    action,
    resource,
    resourceId,
    oldData,
    newData,
    ip,
    userAgent
}: AuditParams) {
    try {
        const supabase = await createAdminClient()

        const { error } = await (supabase as any)
            .from('audit_logs')
            .insert({
                user_id: userId,
                action,
                resource,
                resource_id: resourceId,
                old_data: oldData,
                new_data: newData,
                ip_address: ip,
                user_agent: userAgent
            })

        if (error) {
            console.error('[AUDIT_LOG] Failed to record audit log:', error)
        }
    } catch (err) {
        console.error('[AUDIT_LOG] Unexpected error:', err)
    }
}
