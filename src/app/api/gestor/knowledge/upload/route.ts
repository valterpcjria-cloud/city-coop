import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Dynamic import for server-side libraries
async function extractPDF(buffer: Buffer): Promise<string> {
    // pdf-parse doesn't have proper ESM exports, use require
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text
}

async function extractDOCX(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
}

async function extractTXT(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8')
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const formData = await request.formData()
        const file = formData.get('file') as File
        const category = formData.get('category') as string
        const title = formData.get('title') as string

        if (!file || !category) {
            return NextResponse.json({ error: 'File and category are required' }, { status: 400 })
        }

        // Get file extension
        const filename = file.name
        const extension = filename.split('.').pop()?.toLowerCase()
        const supportedTypes = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'gif', 'webp']

        if (!extension || !supportedTypes.includes(extension)) {
            return NextResponse.json({
                error: `Unsupported file type: ${extension}. Supported: ${supportedTypes.join(', ')}`
            }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        let extractedContent = ''
        let sourceType = 'text'

        // Extract content based on file type
        if (extension === 'pdf') {
            extractedContent = await extractPDF(buffer)
            sourceType = 'pdf'
        } else if (extension === 'docx') {
            extractedContent = await extractDOCX(buffer)
            sourceType = 'docx'
        } else if (extension === 'txt') {
            extractedContent = await extractTXT(buffer)
            sourceType = 'txt'
        } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
            // For images, we'll store a placeholder and let the AI describe it later
            // Or use OCR if text extraction is needed
            sourceType = 'image'
            extractedContent = `[Imagem: ${filename}] - Conteúdo visual a ser processado pela IA.`
        }

        // Upload file to Supabase Storage
        const storagePath = `knowledge/${Date.now()}_${filename}`
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(storagePath, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            })

        if (uploadError) {
            console.error('Storage error:', uploadError)
            // Continue without file storage if it fails
        }

        // Get public URL if uploaded
        let fileUrl = null
        if (!uploadError) {
            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(storagePath)
            fileUrl = urlData?.publicUrl
        }

        // Insert into knowledge_base
        const { data, error } = await supabase
            .from('knowledge_base')
            .insert({
                content: extractedContent.trim().substring(0, 50000), // Limit content size
                category,
                metadata: {
                    source_type: sourceType,
                    original_filename: filename,
                    file_path: storagePath,
                    file_url: fileUrl,
                    title: title || filename,
                    extracted_at: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            success: true,
            data,
            preview: extractedContent.substring(0, 500) + (extractedContent.length > 500 ? '...' : '')
        })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
