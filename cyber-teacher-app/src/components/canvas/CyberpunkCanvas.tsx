'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '@/store/simulation-store';
import { NetworkEntity, ENTITY_VISUALS } from '@/types/entities';
import { Connection } from '@/types/connections';

// ===== CYBERPUNK COLOR PALETTE =====
const CYBER_COLORS = {
    bg: '#050A15',
    grid: '#0D1929',
    gridLine: 'rgba(34, 211, 238, 0.08)',
    node: {
        pc: '#22D3EE',
        router: '#8B5CF6',
        dns: '#A855F7',
        firewall: '#F59E0B',
        server: '#22C55E',
        attacker: '#EF4444',
        cloud: '#3B82F6'
    },
    connection: {
        normal: '#3B82F6',
        active: '#22D3EE',
        encrypted: '#22C55E',
        attack: '#EF4444',
        blocked: '#F97316'
    }
};

// ===== PROTOCOL LABELS =====
const PROTOCOL_COLORS: Record<string, string> = {
    'DHCP': '#FACC15',
    'DNS': '#A855F7',
    'HTTP': '#22D3EE',
    'HTTPS': '#22C55E',
    'TCP': '#3B82F6',
    'ATTACK': '#EF4444',
    'MALWARE': '#DC2626'
};

export function CyberpunkCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    const {
        entities,
        connections,
        viewport,
        setViewportOffset,
        setDragging,
        networkHealth
    } = useSimulationStore();

    // Mouse drag state
    const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

    // Handle resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = parent.clientWidth * dpr;
                canvas.height = parent.clientHeight * dpr;
                canvas.style.width = `${parent.clientWidth}px`;
                canvas.style.height = `${parent.clientHeight}px`;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.scale(dpr, dpr);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        dragStartRef.current = {
            x: e.clientX, y: e.clientY,
            offsetX: viewport.offsetX, offsetY: viewport.offsetY
        };
        setDragging(true);
    }, [viewport, setDragging]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragStartRef.current) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setViewportOffset(dragStartRef.current.offsetX + dx, dragStartRef.current.offsetY + dy);
    }, [setViewportOffset]);

    const handleMouseUp = useCallback(() => {
        dragStartRef.current = null;
        setDragging(false);
    }, [setDragging]);

    // ===== MAIN RENDER LOOP =====
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let running = true;

        const render = (timestamp: number) => {
            if (!running) return;
            timeRef.current = timestamp / 1000;

            const dpr = window.devicePixelRatio || 1;
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;

            // Clear
            ctx.fillStyle = CYBER_COLORS.bg;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.translate(viewport.offsetX + width / 2, viewport.offsetY + height / 2);

            // Draw grid
            drawCyberGrid(ctx, width, height, viewport.offsetX, viewport.offsetY, timeRef.current);

            // Draw connections
            connections.forEach((conn) => {
                const source = entities.get(conn.sourceId);
                const target = entities.get(conn.targetId);
                if (source && target) {
                    drawCyberConnection(ctx, conn, source, target, timeRef.current);
                }
            });

            // Draw entities
            entities.forEach((entity) => {
                drawCyberNode(ctx, entity, timeRef.current);
            });

            ctx.restore();

            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);
        return () => {
            running = false;
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [entities, connections, viewport, networkHealth]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
}

// ===== GRID RENDERER =====
function drawCyberGrid(
    ctx: CanvasRenderingContext2D,
    width: number, height: number,
    offsetX: number, offsetY: number,
    time: number
) {
    const gridSize = 40;
    const startX = -width - (offsetX % gridSize);
    const startY = -height - (offsetY % gridSize);

    // Grid lines
    ctx.strokeStyle = CYBER_COLORS.gridLine;
    ctx.lineWidth = 1;

    for (let x = startX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -height);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = startY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-width, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Scanning line effect
    const scanY = Math.sin(time * 0.3) * height * 0.8;
    const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    gradient.addColorStop(0, 'rgba(34, 211, 238, 0)');
    gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(-width, scanY - 20, width * 2, 40);
}

// ===== NODE RENDERER =====
function drawCyberNode(
    ctx: CanvasRenderingContext2D,
    entity: NetworkEntity,
    time: number
) {
    const { x, y } = entity.position;
    const color = CYBER_COLORS.node[entity.type.toLowerCase() as keyof typeof CYBER_COLORS.node] || '#3B82F6';

    const boxWidth = 70;
    const boxHeight = 60;
    const iconSize = 24;

    ctx.save();

    // Outer glow
    const glowIntensity = 0.3 + Math.sin(time * 2 + x * 0.01) * 0.1;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20 * glowIntensity;

    // Main box
    const gradient = ctx.createLinearGradient(x, y - boxHeight / 2, x, y + boxHeight / 2);
    gradient.addColorStop(0, `${color}30`);
    gradient.addColorStop(0.5, `${color}15`);
    gradient.addColorStop(1, `${color}05`);

    ctx.fillStyle = gradient;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Draw rounded rectangle
    ctx.beginPath();
    ctx.roundRect(x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Icon
    ctx.save();
    ctx.translate(x, y - 10);
    drawNodeIcon(ctx, entity.type, iconSize, color);
    ctx.restore();

    // Label
    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(entity.metadata.label || entity.type, x, y + 22);

    // IP badge below
    if (entity.metadata.ip) {
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.fillText(`IP: ${entity.metadata.ip}`, x, y + 34);
    }

    // Status indicator (top-right corner)
    const statusColors: Record<string, string> = {
        active: '#22C55E',
        idle: '#64748B',
        under_attack: '#EF4444',
        compromised: '#DC2626',
        blocked: '#F97316'
    };
    const statusColor = statusColors[entity.status] || '#64748B';

    ctx.fillStyle = statusColor;
    ctx.shadowColor = statusColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x + boxWidth / 2 - 8, y - boxHeight / 2 + 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
}

// ===== NODE ICON RENDERER =====
function drawNodeIcon(ctx: CanvasRenderingContext2D, type: string, size: number, color: string) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const s = size / 2;

    switch (type) {
        case 'PC':
            // Monitor
            ctx.strokeRect(-s * 0.7, -s * 0.4, s * 1.4, s * 0.8);
            ctx.beginPath();
            ctx.moveTo(-s * 0.2, s * 0.4);
            ctx.lineTo(s * 0.2, s * 0.4);
            ctx.lineTo(s * 0.15, s * 0.6);
            ctx.lineTo(-s * 0.15, s * 0.6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-s * 0.35, s * 0.6);
            ctx.lineTo(s * 0.35, s * 0.6);
            ctx.stroke();
            break;

        case 'Router':
            ctx.strokeRect(-s * 0.6, -s * 0.2, s * 1.2, s * 0.4);
            // Antennas
            ctx.beginPath();
            ctx.moveTo(-s * 0.35, -s * 0.2);
            ctx.lineTo(-s * 0.45, -s * 0.5);
            ctx.moveTo(s * 0.35, -s * 0.2);
            ctx.lineTo(s * 0.45, -s * 0.5);
            ctx.stroke();
            // LEDs
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.arc(i * s * 0.2, 0, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'Firewall':
            // Shield shape
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.5);
            ctx.lineTo(s * 0.4, -s * 0.3);
            ctx.lineTo(s * 0.4, s * 0.1);
            ctx.quadraticCurveTo(s * 0.2, s * 0.4, 0, s * 0.55);
            ctx.quadraticCurveTo(-s * 0.2, s * 0.4, -s * 0.4, s * 0.1);
            ctx.lineTo(-s * 0.4, -s * 0.3);
            ctx.closePath();
            ctx.stroke();
            // Flame
            ctx.beginPath();
            ctx.moveTo(0, s * 0.2);
            ctx.quadraticCurveTo(s * 0.1, 0, 0, -s * 0.15);
            ctx.quadraticCurveTo(-s * 0.1, 0, 0, s * 0.2);
            ctx.fill();
            break;

        case 'DNS':
            // Database cylinder
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.3, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-s * 0.4, -s * 0.3);
            ctx.lineTo(-s * 0.4, s * 0.3);
            ctx.ellipse(0, s * 0.3, s * 0.4, s * 0.15, 0, Math.PI, 0, true);
            ctx.lineTo(s * 0.4, -s * 0.3);
            ctx.stroke();
            break;

        case 'Server':
            // Stacked boxes
            for (let i = 0; i < 3; i++) {
                const ly = -s * 0.4 + i * s * 0.35;
                ctx.strokeRect(-s * 0.5, ly, s * 1, s * 0.3);
                ctx.beginPath();
                ctx.arc(s * 0.3, ly + s * 0.15, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'Attacker':
            // Skull/danger
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.5);
            ctx.lineTo(s * 0.45, s * 0.4);
            ctx.lineTo(-s * 0.45, s * 0.4);
            ctx.closePath();
            ctx.stroke();
            ctx.font = `bold ${s * 0.6}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', 0, s * 0.1);
            break;

        default:
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
            ctx.stroke();
    }
}

// ===== CONNECTION RENDERER =====
function drawCyberConnection(
    ctx: CanvasRenderingContext2D,
    conn: Connection,
    source: NetworkEntity,
    target: NetworkEntity,
    time: number
) {
    const x1 = source.position.x;
    const y1 = source.position.y;
    const x2 = target.position.x;
    const y2 = target.position.y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Offset from node edges
    const offset = 45;
    const startX = x1 + Math.cos(angle) * offset;
    const startY = y1 + Math.sin(angle) * offset;
    const endX = x2 - Math.cos(angle) * offset;
    const endY = y2 - Math.sin(angle) * offset;

    // Determine color
    let color = CYBER_COLORS.connection.normal;
    if (conn.style === 'encrypted') color = CYBER_COLORS.connection.encrypted;
    else if (conn.style === 'pulsing') color = CYBER_COLORS.connection.attack;
    else if (conn.style === 'blocked') color = CYBER_COLORS.connection.blocked;
    else if (conn.status === 'active') color = CYBER_COLORS.connection.active;

    ctx.save();

    // Glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Main line
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2;

    if (conn.style === 'blocked') {
        ctx.setLineDash([6, 4]);
        ctx.globalAlpha = 0.5;
    } else if (conn.style === 'dotted') {
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -time * 20;
    }

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Animated particles
    if (conn.status === 'active' || conn.style === 'encrypted') {
        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
            const progress = ((time * 0.4) + (i / particleCount)) % 1;
            const px = startX + (endX - startX) * progress;
            const py = startY + (endY - startY) * progress;

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Protocol label
    if (conn.protocol) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 12;
        const protocolColor = PROTOCOL_COLORS[conn.protocol] || color;

        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const textWidth = ctx.measureText(conn.protocol).width + 12;

        // Badge background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = protocolColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(midX - textWidth / 2, midY - 8, textWidth, 16, 3);
        ctx.fill();
        ctx.stroke();

        // Arrow
        ctx.fillStyle = protocolColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${conn.protocol}→`, midX, midY);
    }

    // Arrowhead at end
    if (conn.status === 'active') {
        const arrowSize = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}
