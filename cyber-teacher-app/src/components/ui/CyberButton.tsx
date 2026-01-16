'use client';

// Cyber Button with animated glow, ripple, and variant styles

import { ReactNode, useRef, forwardRef, MouseEvent } from 'react';
import anime from 'animejs';

interface CyberButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'attack' | 'defense' | 'neutral' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
    onClick?: () => void;
}

const VARIANT_STYLES = {
    primary: {
        bg: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
        border: '#22D3EE',
        text: '#22D3EE',
        hoverGlow: 'rgba(34, 211, 238, 0.4)',
    },
    attack: {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
        border: '#EF4444',
        text: '#EF4444',
        hoverGlow: 'rgba(239, 68, 68, 0.4)',
    },
    defense: {
        bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)',
        border: '#22C55E',
        text: '#22C55E',
        hoverGlow: 'rgba(34, 197, 94, 0.4)',
    },
    neutral: {
        bg: 'rgba(71, 85, 105, 0.2)',
        border: '#64748B',
        text: '#94A3B8',
        hoverGlow: 'rgba(100, 116, 139, 0.3)',
    },
    ghost: {
        bg: 'transparent',
        border: 'transparent',
        text: '#94A3B8',
        hoverGlow: 'rgba(148, 163, 184, 0.1)',
    },
};

const SIZE_STYLES = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    onClick,
}, ref) => {
    const rippleRef = useRef<HTMLSpanElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const styles = VARIANT_STYLES[variant];
    const sizeClass = SIZE_STYLES[size];

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;

        // Ripple effect
        if (rippleRef.current && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            rippleRef.current.style.left = `${x}px`;
            rippleRef.current.style.top = `${y}px`;

            anime({
                targets: rippleRef.current,
                scale: [0, 4],
                opacity: [0.5, 0],
                duration: 600,
                easing: 'easeOutExpo',
            });
        }

        onClick?.();
    };

    const handleMouseEnter = () => {
        if (disabled || !buttonRef.current) return;

        anime({
            targets: buttonRef.current,
            boxShadow: `0 0 20px ${styles.hoverGlow}`,
            duration: 300,
            easing: 'easeOutExpo',
        });
    };

    const handleMouseLeave = () => {
        if (!buttonRef.current) return;

        anime({
            targets: buttonRef.current,
            boxShadow: '0 0 0px transparent',
            duration: 300,
            easing: 'easeOutExpo',
        });
    };

    return (
        <button
            ref={(node) => {
                (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            }}
            className={`
        relative overflow-hidden rounded-lg font-medium
        transition-all duration-200
        flex items-center justify-center gap-2
        ${sizeClass}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
                color: styles.text,
            }}
            disabled={disabled || loading}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Ripple element */}
            <span
                ref={rippleRef}
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 10,
                    height: 10,
                    background: styles.border,
                    transform: 'scale(0)',
                    opacity: 0,
                }}
            />

            {/* Loading spinner */}
            {loading && (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            )}

            {/* Icon left */}
            {!loading && icon && iconPosition === 'left' && (
                <span className="flex-shrink-0">{icon}</span>
            )}

            {/* Content */}
            <span>{children}</span>

            {/* Icon right */}
            {!loading && icon && iconPosition === 'right' && (
                <span className="flex-shrink-0">{icon}</span>
            )}
        </button>
    );
});

CyberButton.displayName = 'CyberButton';

// Icon-only button variant
interface IconButtonProps {
    icon: ReactNode;
    variant?: 'primary' | 'attack' | 'defense' | 'neutral' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    onClick?: () => void;
    title?: string;
}

const ICON_SIZE_STYLES = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
};

export function IconButton({
    icon,
    variant = 'ghost',
    size = 'md',
    disabled = false,
    className = '',
    onClick,
    title,
}: IconButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const styles = VARIANT_STYLES[variant];
    const sizeClass = ICON_SIZE_STYLES[size];

    const handleMouseEnter = () => {
        if (disabled || !buttonRef.current) return;

        anime({
            targets: buttonRef.current,
            scale: 1.1,
            boxShadow: `0 0 15px ${styles.hoverGlow}`,
            duration: 200,
            easing: 'easeOutExpo',
        });
    };

    const handleMouseLeave = () => {
        if (!buttonRef.current) return;

        anime({
            targets: buttonRef.current,
            scale: 1,
            boxShadow: '0 0 0px transparent',
            duration: 200,
            easing: 'easeOutExpo',
        });
    };

    return (
        <button
            ref={buttonRef}
            className={`
        rounded-lg flex items-center justify-center
        transition-colors
        ${sizeClass}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            style={{
                background: variant === 'ghost' ? 'transparent' : styles.bg,
                border: variant === 'ghost' ? 'none' : `1px solid ${styles.border}40`,
                color: styles.text,
            }}
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title={title}
        >
            {icon}
        </button>
    );
}
