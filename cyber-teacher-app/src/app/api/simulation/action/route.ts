import { NextResponse } from 'next/server';
import { validateToken, getCorsHeaders, isBodySizeSafe } from '@/lib/security';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { validateSimulationAction } from '@/lib/security/validation';

/**
 * Simulation Action Endpoint
 * Secure endpoint for executing simulation actions
 * 
 * Security measures:
 * - Token validation (X-App-Token header)
 * - Rate limiting (10 req/sec per IP)
 * - Strict input validation (enum-only actions)
 * - Body size limit (2MB max)
 * - No code execution
 */

// Get client IP from headers
function getClientIP(request: Request): string {
    const headers = request.headers;

    // Cloudflare
    const cfIP = headers.get('cf-connecting-ip');
    if (cfIP) return cfIP;

    // Standard forwarded header
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    // Real IP (nginx)
    const realIP = headers.get('x-real-ip');
    if (realIP) return realIP;

    return 'unknown';
}

export async function POST(request: Request) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        // 1. Check rate limit
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, '/api/simulation/action');

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please slow down.' },
                {
                    status: 429,
                    headers: {
                        ...corsHeaders,
                        'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        // 2. Validate token
        const appToken = request.headers.get('x-app-token');

        if (!validateToken(appToken)) {
            return NextResponse.json(
                { error: 'Invalid or missing app token. Please refresh the page.' },
                {
                    status: 401,
                    headers: corsHeaders,
                }
            );
        }

        // 3. Check content type
        const contentType = request.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            return NextResponse.json(
                { error: 'Content-Type must be application/json' },
                {
                    status: 415,
                    headers: corsHeaders,
                }
            );
        }

        // 4. Read and validate body size
        const bodyText = await request.text();

        if (!isBodySizeSafe(bodyText, 10 * 1024)) { // 10KB max for simulation actions
            return NextResponse.json(
                { error: 'Request body too large' },
                {
                    status: 413,
                    headers: corsHeaders,
                }
            );
        }

        // 5. Parse JSON
        let payload: unknown;
        try {
            payload = JSON.parse(bodyText);
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON' },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // 6. Validate payload schema
        const validation = validateSimulationAction(payload);

        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // 7. Process the sanitized action
        // In a real implementation, this would interact with the simulation engine
        // For now, we just acknowledge the action
        const action = validation.sanitized!;

        return NextResponse.json(
            {
                success: true,
                action: action.action,
                message: `Action ${action.action} accepted`,
                timestamp: Date.now(),
            },
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                },
            }
        );

    } catch (error) {
        console.error('Simulation action error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}

// Handle CORS preflight
export async function OPTIONS(request: Request) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
