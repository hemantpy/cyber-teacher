/**
 * Rate Limiter
 * Sliding window rate limiting for API protection
 */

interface RateLimitRecord {
    tokens: number;
    lastRefill: number;
}

// Store for rate limit records (keyed by IP + endpoint)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Default configuration
const DEFAULT_CONFIG = {
    maxTokens: 30,        // Maximum requests
    refillRate: 30,       // Tokens per second
    windowMs: 1000,       // 1 second window
};

// Endpoint-specific configurations
const ENDPOINT_CONFIGS: Record<string, typeof DEFAULT_CONFIG> = {
    '/api/simulation/action': {
        maxTokens: 10,
        refillRate: 10,
        windowMs: 1000,
    },
    '/api/token': {
        maxTokens: 5,
        refillRate: 5,
        windowMs: 1000,
    },
};

/**
 * Get rate limit configuration for an endpoint
 */
function getConfig(endpoint: string) {
    return ENDPOINT_CONFIGS[endpoint] || DEFAULT_CONFIG;
}

/**
 * Token bucket rate limiter
 * Uses token bucket algorithm for smooth rate limiting
 */
export function checkRateLimit(
    ip: string,
    endpoint: string = 'default'
): { allowed: boolean; remaining: number; resetMs: number } {
    const key = `${ip}:${endpoint}`;
    const config = getConfig(endpoint);
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record) {
        // New client, start with full bucket
        record = {
            tokens: config.maxTokens - 1, // Consume one for this request
            lastRefill: now,
        };
        rateLimitStore.set(key, record);

        return {
            allowed: true,
            remaining: record.tokens,
            resetMs: config.windowMs,
        };
    }

    // Calculate tokens to add based on time elapsed
    const elapsed = now - record.lastRefill;
    const tokensToAdd = (elapsed / 1000) * config.refillRate;

    // Refill tokens (up to max)
    record.tokens = Math.min(config.maxTokens, record.tokens + tokensToAdd);
    record.lastRefill = now;

    if (record.tokens < 1) {
        // No tokens available, rate limited
        const waitMs = ((1 - record.tokens) / config.refillRate) * 1000;

        return {
            allowed: false,
            remaining: 0,
            resetMs: Math.ceil(waitMs),
        };
    }

    // Consume a token
    record.tokens -= 1;

    return {
        allowed: true,
        remaining: Math.floor(record.tokens),
        resetMs: config.windowMs,
    };
}

/**
 * Clean up old rate limit records
 * Call periodically to prevent memory leaks
 */
export function cleanupRateLimitStore(maxAge: number = 60000): void {
    const now = Date.now();

    for (const [key, record] of rateLimitStore.entries()) {
        if (now - record.lastRefill > maxAge) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Get current store size (for monitoring)
 */
export function getRateLimitStoreSize(): number {
    return rateLimitStore.size;
}

// Cleanup old records every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => cleanupRateLimitStore(), 60000);
}
