import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

async function extractYouTubeTranscript(url: string): Promise<{ title: string; content: string }> {
    try {
        const { YoutubeTranscript } = await import('youtube-transcript')

        // Extract video ID from URL
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
        if (!videoIdMatch) {
            throw new Error('Invalid YouTube URL')
        }

        const videoId = videoIdMatch[1]
        const transcript = await YoutubeTranscript.fetchTranscript(videoId)

        const content = transcript.map((item: any) => item.text).join(' ')

        return {
            title: `YouTube Video: ${videoId}`,
            content: content
        }
    } catch (error: any) {
        throw new Error(`Failed to fetch YouTube transcript: ${error.message}`)
    }
}

async function scrapeWebsite(url: string): Promise<{ title: string; content: string }> {
    try {
        const cheerio = await import('cheerio')

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status}`)
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Remove unwanted elements
        $('script, style, nav, header, footer, aside, iframe, noscript').remove()

        // Extract title
        const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled'

        // Extract main content
        let content = ''

        // Try to find main content area
        const mainSelectors = ['main', 'article', '.content', '#content', '.post', '.entry']
        for (const selector of mainSelectors) {
            const element = $(selector)
            if (element.length) {
                content = element.text().trim()
                break
            }
        }

        // Fallback to body if no main content found
        if (!content) {
            content = $('body').text().trim()
        }

        // Clean up whitespace
        content = content.replace(/\s+/g, ' ').trim()

        return { title, content }
    } catch (error: any) {
        throw new Error(`Failed to scrape website: ${error.message}`)
    }
}

function detectUrlType(url: string): 'youtube' | 'website' {
    const youtubePatterns = [
        /youtube\.com\/watch/,
        /youtube\.com\/embed/,
        /youtu\.be\//,
        /youtube\.com\/v\//
    ]

    for (const pattern of youtubePatterns) {
        if (pattern.test(url)) return 'youtube'
    }

    return 'website'
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const body = await request.json()
        const { url, category, title: customTitle } = body

        if (!url || !category) {
            return NextResponse.json({ error: 'URL and category are required' }, { status: 400 })
        }

        // Validate URL
        try {
            new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }

        const urlType = detectUrlType(url)
        let extracted: { title: string; content: string }

        if (urlType === 'youtube') {
            extracted = await extractYouTubeTranscript(url)
        } else {
            extracted = await scrapeWebsite(url)
        }

        // Insert into knowledge_base
        const { data, error } = await supabase
            .from('knowledge_base')
            .insert({
                content: extracted.content.substring(0, 50000), // Limit content size
                category,
                metadata: {
                    source_type: urlType,
                    source_url: url,
                    title: customTitle || extracted.title,
                    extracted_at: new Date().toISOString()
                }
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            success: true,
            data,
            urlType,
            preview: extracted.content.substring(0, 500) + (extracted.content.length > 500 ? '...' : '')
        })
    } catch (error: any) {
        console.error('URL processing error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
