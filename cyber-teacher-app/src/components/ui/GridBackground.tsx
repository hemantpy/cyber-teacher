'use client';

// Grid Background with subtle parallax and visual effects
// Includes scan line, particles, and gradient layers

import { useEffect, useRef, ReactNode } from 'react';
import anime from 'animejs';

interface GridBackgroundProps {
    children?: ReactNode;
    showGrid?: boolean;
    showScanLine?: boolean;
    showParticles?: boolean;
    particleCount?: number;
    className?: string;
}

export function GridBackground({
    children,
    showGrid = true,
    showScanLine = false,
    showParticles = true,
    particleCount = 20,
    className = '',
}: GridBackgroundProps) {
    const scanLineRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<HTMLDivElement>(null);

    // Scan line animation
    useEffect(() => {
        if (!showScanLine || !scanLineRef.current) return;

        const animation = anime({
            targets: scanLineRef.current,
            translateY: ['0%', '100%'],
            duration: 3000,
            easing: 'linear',
            loop: true,
        });

        return () => animation.pause();
    }, [showScanLine]);

    // Particle animations
    useEffect(() => {
        if (!showParticles || !particlesRef.current) return;

        const particles = particlesRef.current.children;

        const animations = Array.from(particles).map((particle, i) => {
            return anime({
                targets: particle,
                translateY: [
                    anime.random(-20, 20),
                    anime.random(-20, 20),
                ],
                translateX: [
                    anime.random(-10, 10),
                    anime.random(-10, 10),
                ],
                opacity: [0.1, 0.3, 0.1],
                duration: 4000 + anime.random(-1000, 1000),
                delay: i * 100,
                direction: 'alternate',
                easing: 'easeInOutSine',
                loop: true,
            });
        });

        return () => animations.forEach(a => a.pause());
    }, [showParticles, particleCount]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Base gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, #0A1628 0%, #050A15 70%, #020408 100%)',
                }}
            />

            {/* Grid pattern */}
            {showGrid && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px',
                    }}
                />
            )}

            {/* Gradient overlay layers */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.05) 0%, transparent 50%)',
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
                }}
            />

            {/* Scan line effect */}
            {showScanLine && (
                <div
                    ref={scanLineRef}
                    className="absolute left-0 right-0 h-px pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), transparent)',
                        boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
                    }}
                />
            )}

            {/* Floating particles */}
            {showParticles && (
                <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: particleCount }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: anime.random(2, 4),
                                height: anime.random(2, 4),
                                left: `${anime.random(0, 100)}%`,
                                top: `${anime.random(0, 100)}%`,
                                backgroundColor: i % 3 === 0 ? '#22D3EE' : i % 3 === 1 ? '#8B5CF6' : '#22C55E',
                                opacity: 0.2,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

// Simpler background for panels
export function PanelBackground({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`relative ${className}`}
            style={{
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            }}
        >
            {/* Subtle grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '20px 20px',
                }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
