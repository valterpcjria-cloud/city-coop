import { createAdminClient } from '@/lib/supabase/server'
import { KnowledgeBaseTable } from '@/components/dashboard/gestor/knowledge-base-table'

export const dynamic = 'force-dynamic'

export default async function GestorKnowledgeBasePage() {
    const adminAuth = await createAdminClient()

    const { data: knowledge } = await adminAuth
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

    return <KnowledgeBaseTable initialData={knowledge || []} />
}
