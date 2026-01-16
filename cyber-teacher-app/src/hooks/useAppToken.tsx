'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';

/**
 * App Token Hook
 * Manages the temporary session token for API protection
 * 
 * Features:
 * - Fetches token on mount
 * - Auto-refreshes before expiry
 * - Provides token for API requests
 * - Handles errors gracefully
 */

interface TokenState {
    token: string | null;
    expiresAt: number | null;
    isLoading: boolean;
    error: string | null;
}

interface UseAppTokenReturn extends TokenState {
    refreshToken: () => Promise<void>;
    getAuthHeaders: () => Record<string, string>;
}

// Token refresh buffer (refresh 5 minutes before expiry)
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function useAppToken(): UseAppTokenReturn {
    const [state, setState] = useState<TokenState>({
        token: null,
        expiresAt: null,
        isLoading: true,
        error: null,
    });

    const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchToken = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch('/api/token', {
                method: 'GET',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch token');
            }

            const data = await response.json();

            setState({
                token: data.token,
                expiresAt: data.expiresAt,
                isLoading: false,
                error: null,
            });

            // Schedule auto-refresh
            const refreshIn = data.expiresAt - Date.now() - REFRESH_BUFFER_MS;
            if (refreshIn > 0) {
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                }
                refreshTimeoutRef.current = setTimeout(fetchToken, refreshIn);
            }

        } catch (error) {
            console.error('Token fetch error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }));
        }
    }, []);

    // Fetch token on mount
    useEffect(() => {
        fetchToken();

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [fetchToken]);

    // Get auth headers for API requests
    const getAuthHeaders = useCallback((): Record<string, string> => {
        if (!state.token) {
            return {};
        }

        return {
            'X-App-Token': state.token,
        };
    }, [state.token]);

    return {
        ...state,
        refreshToken: fetchToken,
        getAuthHeaders,
    };
}

/**
 * Context provider for app-wide token access
 * Can be used to share token across components
 */
const AppTokenContext = createContext<UseAppTokenReturn | null>(null);

export function AppTokenProvider({ children }: { children: ReactNode }) {
    const tokenState = useAppToken();

    return (
        <AppTokenContext.Provider value={tokenState}>
            {children}
        </AppTokenContext.Provider>
    );
}

export function useAppTokenContext(): UseAppTokenReturn {
    const context = useContext(AppTokenContext);

    if (!context) {
        throw new Error('useAppTokenContext must be used within AppTokenProvider');
    }

    return context;
}
