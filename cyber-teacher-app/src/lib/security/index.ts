/**
 * Security Utilities
 * Central security functions for token management and validation
 */

// Token store (in-memory, for production use Redis)
const tokenStore = new Map<string, { createdAt: number; expiresAt: number }>();

// Token configuration
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const MAX_TOKENS = 50000; // Maximum tokens to store

/**
 * Generate a cryptographically secure token
 */
export function generateToken(): string {
    // Use crypto.randomUUID if available (Node.js 16.7+)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for older environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Create and store a new app token
 */
export function createAppToken(): { token: string; expiresAt: number } {
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + TOKEN_EXPIRY_MS;

    // Clean up expired tokens if store is getting large
    if (tokenStore.size >= MAX_TOKENS) {
        cleanupExpiredTokens();
    }

    tokenStore.set(token, {
        createdAt: now,
        expiresAt
    });

    return { token, expiresAt };
}

/**
 * Validate an app token
 */
export function validateToken(token: string | null): boolean {
    if (!token) return false;

    const record = tokenStore.get(token);
    if (!record) return false;

    // Check if expired
    if (Date.now() > record.expiresAt) {
        tokenStore.delete(token);
        return false;
    }

    return true;
}

/**
 * Revoke a token
 */
export function revokeToken(token: string): void {
    tokenStore.delete(token);
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, record] of tokenStore.entries()) {
        if (now > record.expiresAt) {
            tokenStore.delete(token);
        }
    }
}

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins(): string[] {
    const origins = [
        'https://cyber-teacher-app.vercel.app',
        'https://cyber-teacher.vercel.app'
    ];

    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
        origins.push('http://localhost:3000');
        origins.push('http://127.0.0.1:3000');
    }

    return origins;
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    return getAllowedOrigins().includes(origin);
}

/**
 * Create CORS headers for API responses
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
    const allowedOrigin = origin && isOriginAllowed(origin) ? origin : '';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-App-Token',
        'Access-Control-Max-Age': '86400',
    };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 100): string {
    if (typeof input !== 'string') return '';

    return input
        .slice(0, maxLength)
        .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
        .trim();
}

/**
 * Validate request body size
 */
export function isBodySizeSafe(body: string, maxBytes: number = 2 * 1024 * 1024): boolean {
    return new TextEncoder().encode(body).length <= maxBytes;
}
