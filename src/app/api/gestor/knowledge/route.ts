import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Get categories from types if possible, or define them here for validation
const CATEGORIES = [
    'estrutura_programa',
    'papel_professor',
    'organizacao_nucleos',
    'assembleias',
    'planejamento_evento',
    'conducao_pedagogica',
    'cooperativismo_conceitos',
    'avaliacao'
]

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const body = await request.json()
        const { content, category, metadata } = body

        if (!content || !category) {
            return NextResponse.json({ error: 'Content and category are required' }, { status: 400 })
        }

        if (!CATEGORIES.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('knowledge_base')
            .insert({
                content,
                category,
                metadata: metadata || {}
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('KB Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const body = await request.json()
        const { id, content, category, metadata } = body

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const updateData: any = {}
        if (content) updateData.content = content
        if (category) {
            if (!CATEGORIES.includes(category)) {
                return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
            }
            updateData.category = category
        }
        if (metadata) updateData.metadata = metadata

        const { data, error } = await supabase
            .from('knowledge_base')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('KB Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        const { error } = await supabase
            .from('knowledge_base')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('KB Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
