// Animation utilities using anime.js
// Provides reusable animation presets for the cyberpunk UI

import anime from 'animejs';

// Animation presets
export const ANIMATION_PRESETS = {
    // Durations
    fast: 200,
    normal: 400,
    slow: 800,
    verySlow: 1200,

    // Easings
    easeOut: 'easeOutExpo',
    easeInOut: 'easeInOutQuad',
    easeOutQuad: 'easeOutQuad',
    bounce: 'easeOutElastic(1, .5)',
    linear: 'linear',
};

// Pulse animation for status indicators
export function pulseAnimation(target: string | HTMLElement, options?: {
    scale?: number;
    duration?: number;
    loop?: boolean;
}) {
    const { scale = 1.1, duration = 1000, loop = true } = options || {};

    return anime({
        targets: target,
        scale: [1, scale, 1],
        opacity: [1, 0.8, 1],
        duration,
        easing: 'easeInOutSine',
        loop,
    });
}

// Glow animation for buttons and icons
export function glowAnimation(target: string | HTMLElement, options?: {
    color?: string;
    intensity?: number;
    duration?: number;
}) {
    const { color = '#22D3EE', intensity = 20, duration = 400 } = options || {};

    return anime({
        targets: target,
        filter: [`drop-shadow(0 0 0px ${color})`, `drop-shadow(0 0 ${intensity}px ${color})`],
        duration,
        easing: 'easeOutExpo',
    });
}

// Ripple effect for clicks
export function rippleAnimation(target: string | HTMLElement, options?: {
    duration?: number;
}) {
    const { duration = 600 } = options || {};

    return anime({
        targets: target,
        scale: [0, 2],
        opacity: [0.5, 0],
        duration,
        easing: 'easeOutExpo',
    });
}

// Breathing animation for idle states
export function breathingAnimation(target: string | HTMLElement, options?: {
    scale?: number;
    duration?: number;
}) {
    const { scale = 1.02, duration = 2000 } = options || {};

    return anime({
        targets: target,
        scale: [1, scale],
        opacity: [0.9, 1],
        duration,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
    });
}

// Status LED blink
export function ledBlinkAnimation(target: string | HTMLElement, options?: {
    color?: string;
    duration?: number;
}) {
    const { duration = 1000 } = options || {};

    return anime({
        targets: target,
        opacity: [1, 0.4, 1],
        boxShadow: [
            '0 0 10px currentColor',
            '0 0 2px currentColor',
            '0 0 10px currentColor',
        ],
        duration,
        easing: 'easeInOutSine',
        loop: true,
    });
}

// Scan line effect
export function scanLineAnimation(target: string | HTMLElement, options?: {
    duration?: number;
}) {
    const { duration = 3000 } = options || {};

    return anime({
        targets: target,
        translateY: ['0%', '100%'],
        duration,
        easing: 'linear',
        loop: true,
    });
}

// Float animation for particles
export function floatAnimation(target: string | HTMLElement, options?: {
    distance?: number;
    duration?: number;
}) {
    const { distance = 20, duration = 4000 } = options || {};

    return anime({
        targets: target,
        translateY: [-distance, distance],
        translateX: anime.random(-10, 10),
        duration: duration + anime.random(-1000, 1000),
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
    });
}

// Shake/vibrate animation for attack warnings
export function vibrateAnimation(target: string | HTMLElement, options?: {
    intensity?: number;
    duration?: number;
}) {
    const { intensity = 3, duration = 300 } = options || {};

    return anime({
        targets: target,
        translateX: [0, -intensity, intensity, -intensity, intensity, 0],
        duration,
        easing: 'easeInOutSine',
    });
}

// Rotate animation for loading/processing
export function rotateAnimation(target: string | HTMLElement, options?: {
    duration?: number;
    loop?: boolean;
}) {
    const { duration = 1500, loop = true } = options || {};

    return anime({
        targets: target,
        rotate: '360deg',
        duration,
        easing: 'linear',
        loop,
    });
}

// Staggered entrance animation
export function staggerEntranceAnimation(targets: string | HTMLElement[], options?: {
    delay?: number;
    duration?: number;
}) {
    const { delay = 50, duration = 600 } = options || {};

    return anime({
        targets,
        opacity: [0, 1],
        translateY: [20, 0],
        duration,
        delay: anime.stagger(delay),
        easing: 'easeOutExpo',
    });
}

// Health bar transition
export function healthBarAnimation(target: string | HTMLElement, toWidth: number, options?: {
    duration?: number;
}) {
    const { duration = 600 } = options || {};

    return anime({
        targets: target,
        width: `${toWidth}%`,
        duration,
        easing: 'easeOutQuad',
    });
}

// Connection line packet animation
export function packetFlowAnimation(target: string | HTMLElement, options?: {
    duration?: number;
}) {
    const { duration = 1500 } = options || {};

    return anime({
        targets: target,
        strokeDashoffset: [anime.setDashoffset, 0],
        duration,
        easing: 'linear',
        loop: true,
    });
}

// Fade in animation
export function fadeInAnimation(target: string | HTMLElement, options?: {
    duration?: number;
    delay?: number;
}) {
    const { duration = 400, delay = 0 } = options || {};

    return anime({
        targets: target,
        opacity: [0, 1],
        duration,
        delay,
        easing: 'easeOutExpo',
    });
}

// Scale in animation
export function scaleInAnimation(target: string | HTMLElement, options?: {
    duration?: number;
    delay?: number;
}) {
    const { duration = 400, delay = 0 } = options || {};

    return anime({
        targets: target,
        scale: [0.8, 1],
        opacity: [0, 1],
        duration,
        delay,
        easing: 'easeOutExpo',
    });
}
