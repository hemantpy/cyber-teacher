import { NextResponse } from 'next/server';
import { createAppToken, getCorsHeaders } from '@/lib/security';

/**
 * Token Generation Endpoint
 * Creates a temporary session token for API access
 * 
 * This prevents direct curl/bot abuse without requiring user accounts
 */

export async function GET(request: Request) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        // Generate new token
        const { token, expiresAt } = createAppToken();

        return NextResponse.json(
            {
                token,
                expiresAt,
                expiresIn: Math.floor((expiresAt - Date.now()) / 1000), // seconds
            },
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            }
        );
    } catch (error) {
        console.error('Token generation error:', error);

        return NextResponse.json(
            { error: 'Failed to generate token' },
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
