/**
 * ===========================================
 * API Response Helpers - Performance Optimized
 * ===========================================
 * 
 * Standardized API responses with intelligent caching headers
 * for CDN/Edge caching (Vercel, Cloudflare, etc.)
 */

import { NextResponse } from 'next/server'

type CacheStrategy = 'short' | 'medium' | 'long' | 'none'

const CACHE_HEADERS: Record<CacheStrategy, string> = {
    /** 10s fresh, 30s stale-while-revalidate — for fast-changing data */
    short: 'public, s-maxage=10, stale-while-revalidate=30',
    /** 60s fresh, 5min stale-while-revalidate — for dashboard data */
    medium: 'public, s-maxage=60, stale-while-revalidate=300',
    /** 1h fresh, 24h stale-while-revalidate — for reference/config data */
    long: 'public, s-maxage=3600, stale-while-revalidate=86400',
    /** No cache — for mutations, auth, and sensitive data */
    none: 'no-store, max-age=0',
}

/**
 * Optimized JSON response with performance headers
 */
export function jsonResponse(
    data: unknown,
    options?: { status?: number; cache?: CacheStrategy }
) {
    const { status = 200, cache = 'none' } = options ?? {}

    return NextResponse.json(data, {
        status,
        headers: {
            'Cache-Control': CACHE_HEADERS[cache],
            'X-Content-Type-Options': 'nosniff',
        },
    })
}

/**
 * Standardized error response
 */
export function errorResponse(message: string, status = 500) {
    return jsonResponse({ error: message }, { status, cache: 'none' })
}

/**
 * Success response with cache
 */
export function successResponse(data: unknown, cache: CacheStrategy = 'none') {
    return jsonResponse({ success: true, ...data as object }, { cache })
}
