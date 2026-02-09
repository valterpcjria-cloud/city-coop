/**
 * ===========================================
 * Rate Limiter - API Request Throttling
 * ===========================================
 * 
 * In-memory rate limiter for API protection.
 * Prevents DoS attacks and brute force attempts.
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

/**
 * ===========================================
 * Rate Limiter - Storage Providers
 * ===========================================
 */

interface RateLimitStore {
    get(key: string): Promise<RateLimitEntry | undefined>
    set(key: string, entry: RateLimitEntry): Promise<void>
    delete(key: string): Promise<void>
}

class InMemoryStore implements RateLimitStore {
    private store = new Map<string, RateLimitEntry>()

    async get(key: string) { return this.store.get(key) }
    async set(key: string, entry: RateLimitEntry) { this.store.set(key, entry) }
    async delete(key: string) { this.store.delete(key) }

    constructor() {
        // Cleanup old entries every 5 minutes
        if (typeof setInterval !== 'undefined') {
            setInterval(() => {
                const now = Date.now()
                for (const [key, entry] of this.store.entries()) {
                    if (entry.resetTime < now) {
                        this.store.delete(key)
                    }
                }
            }, 5 * 60 * 1000)
        }
    }
}

// Global store instance - Default to In-Memory
// In a production environment with Redis, you would initialize a RedisStore here if REDIS_URL exists
const rateLimitStore: RateLimitStore = new InMemoryStore()

export interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

export const RATE_LIMITS = {
    // Standard API endpoints
    GET: { maxRequests: 100, windowMs: 60 * 1000 },     // 100 req/min
    POST: { maxRequests: 30, windowMs: 60 * 1000 },     // 30 req/min
    PUT: { maxRequests: 30, windowMs: 60 * 1000 },      // 30 req/min
    DELETE: { maxRequests: 20, windowMs: 60 * 1000 },   // 20 req/min

    // Auth endpoints (stricter)
    AUTH: { maxRequests: 5, windowMs: 60 * 1000 },      // 5 req/min

    // AI endpoints (expensive)
    AI: { maxRequests: 10, windowMs: 60 * 1000 },       // 10 req/min
} as const

export interface RateLimitResult {
    success: boolean
    remaining: number
    resetIn: number
    error?: string
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param config - Rate limit configuration
 */
export async function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = RATE_LIMITS.GET
): Promise<RateLimitResult> {
    const now = Date.now()
    const key = identifier

    let entry = await rateLimitStore.get(key)

    // Create new entry if doesn't exist or window expired
    if (!entry || entry.resetTime < now) {
        entry = {
            count: 0,
            resetTime: now + config.windowMs
        }
    }

    // Increment count
    entry.count++
    await rateLimitStore.set(key, entry)

    const remaining = Math.max(0, config.maxRequests - entry.count)
    const resetIn = Math.ceil((entry.resetTime - now) / 1000)

    if (entry.count > config.maxRequests) {
        console.warn(`[RATE_LIMIT] Limit exceeded for ${identifier}. Count: ${entry.count}/${config.maxRequests}`)
        return {
            success: false,
            remaining: 0,
            resetIn,
            error: `Limite de requisições excedido. Tente novamente em ${resetIn} segundos.`
        }
    }

    return {
        success: true,
        remaining,
        resetIn
    }
}

/**
 * Creates a rate limit key from request info
 */
export function getRateLimitKey(request: Request, userId?: string): string {
    // Prefer user ID over IP for authenticated requests
    if (userId) {
        return `user:${userId}`
    }

    // Get IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() :
        request.headers.get('x-real-ip') ||
        'unknown'

    return `ip:${ip}`
}

/**
 * Get rate limit config based on method and path
 */
export function getRateLimitConfig(method: string, path: string): RateLimitConfig {
    // Auth endpoints
    if (path.includes('/api/auth')) {
        return RATE_LIMITS.AUTH
    }

    // AI endpoints
    if (path.includes('/api/ai') || path.includes('/api/chat')) {
        return RATE_LIMITS.AI
    }

    // Standard methods
    switch (method.toUpperCase()) {
        case 'GET':
            return RATE_LIMITS.GET
        case 'POST':
            return RATE_LIMITS.POST
        case 'PUT':
        case 'PATCH':
            return RATE_LIMITS.PUT
        case 'DELETE':
            return RATE_LIMITS.DELETE
        default:
            return RATE_LIMITS.GET
    }
}
