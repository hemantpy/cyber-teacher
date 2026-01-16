import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Middleware
 * Applies security headers to all responses and protects API routes
 */

// Security headers configuration
const securityHeaders = {
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Control referrer information
    'Referrer-Policy': 'same-origin',

    // Disable dangerous browser features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=(), bluetooth=(), payment=(), fullscreen=(self)',

    // Prevent XSS attacks (legacy, CSP is preferred)
    'X-XSS-Protection': '1; mode=block',

    // Content Security Policy - Strict
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ].join('; '),
};

// Rate limiting store (in-memory, resets on server restart)
// For production, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second window
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per second

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
    // Cloudflare
    const cfIP = request.headers.get('cf-connecting-ip');
    if (cfIP) return cfIP;

    // Standard forwarded header
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        const ips = forwarded.split(',');
        return ips[0].trim();
    }

    // Real IP header (nginx)
    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP;

    // Fallback
    return 'unknown';
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }

    if (!record || now > record.resetTime) {
        // New window
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS
        });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
        const ip = getClientIP(request);
        const { allowed, remaining } = checkRateLimit(ip);

        if (!allowed) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please slow down.' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '1',
                        'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
                        'X-RateLimit-Remaining': '0',
                        ...securityHeaders
                    }
                }
            );
        }

        // Continue with rate limit headers
        const response = NextResponse.next();

        // Add security headers
        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());

        return response;
    }

    // For non-API routes, just add security headers
    const response = NextResponse.next();

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
