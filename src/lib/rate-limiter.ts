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

/**
 * Redis Store for Persistent Rate Limiting
 * Uses Upstash REST API for serverless compatibility
 */
class RedisStore implements RateLimitStore {
    private url = process.env.UPSTASH_REDIS_REST_URL
    private token = process.env.UPSTASH_REDIS_REST_TOKEN

    private async fetchRedis(command: string[]) {
        if (!this.url || !this.token) return null

        const response = await fetch(this.url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(command)
        })
        return response.json()
    }

    async get(key: string): Promise<RateLimitEntry | undefined> {
        const redisKey = `ratelimit:${key}`
        const res = await this.fetchRedis(['GET', redisKey])
        if (!res?.result) return undefined
        try {
            return JSON.parse(res.result)
        } catch {
            return undefined
        }
    }

    async set(key: string, entry: RateLimitEntry) {
        const redisKey = `ratelimit:${key}`
        const ttl = Math.ceil((entry.resetTime - Date.now()) / 1000)
        if (ttl > 0) {
            await this.fetchRedis(['SETEX', redisKey, ttl.toString(), JSON.stringify(entry)])
        }
    }

    async delete(key: string) {
        await this.fetchRedis(['DEL', `ratelimit:${key}`])
    }
}

// Global store instance - Default to Redis if env vars exist, otherwise In-Memory
const rateLimitStore: RateLimitStore = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new RedisStore()
    : new InMemoryStore()

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
