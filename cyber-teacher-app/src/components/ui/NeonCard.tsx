'use client';

// Neon Card component with animated border glow
// Glassmorphism style with hover effects

import { ReactNode, useRef, useEffect, useState, forwardRef } from 'react';
import anime from 'animejs';

interface NeonCardProps {
    children: ReactNode;
    variant?: 'default' | 'attack' | 'defense' | 'info' | 'warning';
    glow?: boolean;
    hover?: boolean;
    className?: string;
    onClick?: () => void;
}

const VARIANT_COLORS = {
    default: { border: '#22D3EE', bg: 'rgba(34, 211, 238, 0.05)' },
    attack: { border: '#EF4444', bg: 'rgba(239, 68, 68, 0.05)' },
    defense: { border: '#22C55E', bg: 'rgba(34, 197, 94, 0.05)' },
    info: { border: '#3B82F6', bg: 'rgba(59, 130, 246, 0.05)' },
    warning: { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.05)' },
};

export function NeonCard({
    children,
    variant = 'default',
    glow = true,
    hover = true,
    className = '',
    onClick,
}: NeonCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const colors = VARIANT_COLORS[variant];

    useEffect(() => {
        if (!hover || !cardRef.current) return;

        if (isHovered) {
            anime({
                targets: cardRef.current,
                boxShadow: `0 0 20px ${colors.border}40, 0 0 40px ${colors.border}20`,
                borderColor: colors.border,
                duration: 300,
                easing: 'easeOutExpo',
            });
        } else {
            anime({
                targets: cardRef.current,
                boxShadow: glow
                    ? `0 0 10px ${colors.border}20, 0 0 20px ${colors.border}10`
                    : '0 0 0px transparent',
                borderColor: `${colors.border}60`,
                duration: 300,
                easing: 'easeOutExpo',
            });
        }
    }, [isHovered, hover, glow, colors.border]);

    return (
        <div
            ref={cardRef}
            className={`relative rounded-lg backdrop-blur-sm transition-transform ${onClick ? 'cursor-pointer' : ''
                } ${hover ? 'hover:scale-[1.02] active:scale-[0.98]' : ''} ${className}`}
            style={{
                background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(15, 23, 42, 0.8) 100%)`,
                border: `1px solid ${colors.border}60`,
                boxShadow: glow
                    ? `0 0 10px ${colors.border}20, 0 0 20px ${colors.border}10`
                    : 'none',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

// Panel variant - larger, no hover effects
interface NeonPanelProps {
    children: ReactNode;
    title?: string;
    icon?: ReactNode;
    variant?: 'default' | 'attack' | 'defense' | 'info';
    className?: string;
}

export function NeonPanel({
    children,
    title,
    icon,
    variant = 'default',
    className = '',
}: NeonPanelProps) {
    const colors = VARIANT_COLORS[variant];

    return (
        <div
            className={`rounded-xl backdrop-blur-sm ${className}`}
            style={{
                background: `linear-gradient(180deg, ${colors.bg} 0%, rgba(15, 23, 42, 0.9) 100%)`,
                border: `1px solid ${colors.border}30`,
            }}
        >
            {title && (
                <div
                    className="flex items-center gap-2 px-4 py-3 border-b"
                    style={{ borderColor: `${colors.border}20` }}
                >
                    {icon}
                    <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.border }}
                    >
                        {title}
                    </span>
                </div>
            )}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
}
