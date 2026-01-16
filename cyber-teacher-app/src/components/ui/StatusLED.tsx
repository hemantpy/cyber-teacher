'use client';

// Status LED component with animated pulse/ripple effect
// Used for indicating active/warning/critical states

import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface StatusLEDProps {
    status: 'active' | 'warning' | 'critical' | 'idle' | 'offline';
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    className?: string;
}

const STATUS_COLORS = {
    active: '#22C55E',   // Green
    warning: '#F59E0B',  // Amber
    critical: '#EF4444', // Red
    idle: '#64748B',     // Slate
    offline: '#1E293B',  // Dark
};

const SIZE_PIXELS = {
    sm: 6,
    md: 8,
    lg: 12,
};

export function StatusLED({
    status,
    size = 'md',
    pulse = true,
    className = ''
}: StatusLEDProps) {
    const ledRef = useRef<HTMLDivElement>(null);
    const rippleRef = useRef<HTMLDivElement>(null);

    const color = STATUS_COLORS[status];
    const pixelSize = SIZE_PIXELS[size];

    useEffect(() => {
        if (!pulse || status === 'offline' || status === 'idle') return;

        // LED glow animation
        const ledAnimation = anime({
            targets: ledRef.current,
            boxShadow: [
                `0 0 ${pixelSize}px ${color}, 0 0 ${pixelSize * 2}px ${color}`,
                `0 0 ${pixelSize / 2}px ${color}, 0 0 ${pixelSize}px ${color}`,
            ],
            opacity: [1, 0.7],
            duration: status === 'critical' ? 500 : 1000,
            direction: 'alternate',
            easing: 'easeInOutSine',
            loop: true,
        });

        // Ripple animation for active states
        let rippleAnimation: anime.AnimeInstance | undefined;
        if (rippleRef.current) {
            rippleAnimation = anime({
                targets: rippleRef.current,
                scale: [1, 2.5],
                opacity: [0.5, 0],
                duration: status === 'critical' ? 800 : 1500,
                easing: 'easeOutExpo',
                loop: true,
            });
        }

        return () => {
            ledAnimation.pause();
            rippleAnimation?.pause();
        };
    }, [status, pulse, color, pixelSize]);

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
            style={{ width: pixelSize * 3, height: pixelSize * 3 }}
        >
            {/* Ripple effect layer */}
            {pulse && status !== 'offline' && status !== 'idle' && (
                <div
                    ref={rippleRef}
                    className="absolute rounded-full"
                    style={{
                        width: pixelSize,
                        height: pixelSize,
                        backgroundColor: color,
                        opacity: 0,
                    }}
                />
            )}

            {/* Main LED */}
            <div
                ref={ledRef}
                className="rounded-full relative z-10"
                style={{
                    width: pixelSize,
                    height: pixelSize,
                    backgroundColor: color,
                    boxShadow: status !== 'offline' && status !== 'idle'
                        ? `0 0 ${pixelSize}px ${color}, 0 0 ${pixelSize * 2}px ${color}`
                        : 'none',
                }}
            />
        </div>
    );
}

// Inline status indicator with label
interface StatusIndicatorProps extends StatusLEDProps {
    label?: string;
}

export function StatusIndicator({
    label,
    ...ledProps
}: StatusIndicatorProps) {
    const color = STATUS_COLORS[ledProps.status];

    return (
        <div className="flex items-center gap-2">
            <StatusLED {...ledProps} />
            {label && (
                <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color }}
                >
                    {label}
                </span>
            )}
        </div>
    );
}
