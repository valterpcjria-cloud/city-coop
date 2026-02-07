import { createAdminClient } from '@/lib/supabase/server'

export async function getSystemSettings() {
    try {
        const supabase = await createAdminClient()
        const { data, error } = await supabase
            .from('system_settings')
            .select('key, value')

        if (error) {
            console.error('Error fetching system settings:', error)
            return {}
        }

        return (data as any[]).reduce((acc: any, item) => {
            acc[item.key] = item.value
            return acc
        }, {})
    } catch (err) {
        console.error('getSystemSettings failed:', err)
        return {}
    }
}

export async function getAIKeys() {
    const settings = await getSystemSettings()

    return {
        anthropic: settings.anthropic_api_key || process.env.ANTHROPIC_API_KEY,
        openai: settings.openai_api_key || process.env.OPENAI_API_KEY
    }
}
