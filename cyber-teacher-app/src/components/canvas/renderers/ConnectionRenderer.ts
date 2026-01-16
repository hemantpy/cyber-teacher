// Enhanced Connection renderer with visual traffic feedback
// Direction arrows, encryption shimmer, congestion, attack pulses

import { Connection, CONNECTION_VISUALS } from '@/types/connections';
import { Position } from '@/types/entities';

// Animation time (synced globally)
let globalTime = 0;

export function updateConnectionTime() {
    globalTime = Date.now() / 1000;
}

export function drawConnection(
    ctx: CanvasRenderingContext2D,
    connection: Connection,
    sourcePos: Position,
    targetPos: Position,
    activeProtocol?: string,
    isHighlighted: boolean = false
) {
    const visual = CONNECTION_VISUALS[connection.style];

    ctx.save();

    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Offset from entity centers to edges
    const offsetStart = 55;
    const offsetEnd = 55;

    const startX = sourcePos.x + Math.cos(angle) * offsetStart;
    const startY = sourcePos.y + Math.sin(angle) * offsetStart;
    const endX = targetPos.x - Math.cos(angle) * offsetEnd;
    const endY = targetPos.y - Math.sin(angle) * offsetEnd;

    // Determine line style based on connection type
    let lineColor = visual.color;
    let glowColor = visual.color;
    let lineWidth = visual.strokeWidth * (connection.bandwidth || 1);

    // ============================================
    // STYLE-BASED COLORING
    // ============================================

    if (connection.style === 'encrypted') {
        lineColor = '#22C55E';
        glowColor = '#22C55E';
    } else if (connection.style === 'pulsing') {
        lineColor = '#EF4444';
        glowColor = '#EF4444';
        // Attack connections are thicker
        lineWidth = visual.strokeWidth * 1.5;
    } else if (connection.style === 'blocked') {
        lineColor = '#F97316';
        glowColor = '#F97316';
    }

    // ============================================
    // HIGHLIGHT EFFECT (for log linking)
    // ============================================

    if (isHighlighted) {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = lineWidth + 8;
        ctx.globalAlpha = 0.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // ============================================
    // GLOW LAYER
    // ============================================

    // Base glow
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = lineWidth + 6;
    ctx.globalAlpha = 0.15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Extra glow for attack connections with pulsing
    if (connection.style === 'pulsing') {
        const pulse = 0.2 + Math.sin(globalTime * 6) * 0.15;
        ctx.lineWidth = lineWidth + 14;
        ctx.globalAlpha = pulse;
        ctx.stroke();

        // Draw attack pulse waves
        drawAttackPulseWaves(ctx, startX, startY, endX, endY, lineColor);
    }

    // Encrypted shimmer effect
    if (connection.style === 'encrypted') {
        drawEncryptionShimmer(ctx, startX, startY, endX, endY);
    }

    ctx.globalAlpha = 1;

    // ============================================
    // MAIN LINE
    // ============================================

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, lineColor);
    gradient.addColorStop(0.5, lineColor);
    gradient.addColorStop(1, lineColor);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    // Blocked connections are dashed and faded
    if (connection.style === 'blocked') {
        ctx.setLineDash([8, 6]);
        ctx.globalAlpha = 0.5;
    } else if (visual.dashArray) {
        const dashValues = visual.dashArray.split(',').map(Number);
        ctx.setLineDash(dashValues);
        ctx.lineDashOffset = -globalTime * 30 * visual.animationSpeed;
    }

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // ============================================
    // TRAFFIC DIRECTION INDICATORS
    // ============================================

    if (connection.status === 'active' || connection.style === 'encrypted' || connection.style === 'pulsing') {
        drawDirectionalFlow(ctx, startX, startY, endX, endY, lineColor, connection.style === 'pulsing');
    }

    // ============================================
    // ARROWHEAD
    // ============================================

    if (connection.status === 'active' || connection.status === 'attack') {
        drawArrowhead(ctx, startX, startY, endX, endY, lineColor);
    }

    // ============================================
    // PROTOCOL LABEL BADGE
    // ============================================

    if (activeProtocol || connection.style === 'encrypted' || connection.style === 'pulsing') {
        const label = activeProtocol || (connection.style === 'encrypted' ? 'HTTPS' : 'ATTACK');
        const badgeColor = connection.style === 'pulsing' ? '#EF4444' : lineColor;
        drawProtocolBadge(ctx, (startX + endX) / 2, (startY + endY) / 2 - 12, label, badgeColor);
    }

    // ============================================
    // CONGESTION INDICATOR
    // ============================================

    if (connection.bandwidth && connection.bandwidth > 1.5) {
        drawCongestionEffect(ctx, startX, startY, endX, endY, connection.bandwidth);
    }

    ctx.restore();
}

// ============================================
// EFFECT RENDERERS
// ============================================

function drawDirectionalFlow(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    color: string,
    isAttack: boolean = false
) {
    const particleCount = isAttack ? 6 : 4;
    const speed = isAttack ? 0.6 : 0.4;
    const size = isAttack ? 5 : 4;

    for (let i = 0; i < particleCount; i++) {
        const offset = (i / particleCount);
        const progress = ((globalTime * speed) + offset) % 1;

        const x = x1 + (x2 - x1) * progress;
        const y = y1 + (y2 - y1) * progress;

        // Outer glow
        ctx.fillStyle = color;
        ctx.globalAlpha = isAttack ? 0.5 : 0.4;
        ctx.beginPath();
        ctx.arc(x, y, size + 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = isAttack ? 0.95 : 0.9;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function drawEncryptionShimmer(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number
) {
    const shimmerPos = (globalTime * 0.3) % 1;
    const shimmerWidth = 40;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Calculate shimmer center position along line
    const shimmerX = x1 + dx * shimmerPos;
    const shimmerY = y1 + dy * shimmerPos;

    // Draw shimmer gradient perpendicular to line
    const gradient = ctx.createRadialGradient(
        shimmerX, shimmerY, 0,
        shimmerX, shimmerY, shimmerWidth
    );
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(shimmerX, shimmerY, shimmerWidth, 0, Math.PI * 2);
    ctx.fill();

    // Lock icon at center of encrypted connection
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    ctx.fillStyle = '#22C55E';
    ctx.globalAlpha = 0.8;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('', centerX, centerY + 14);
    ctx.globalAlpha = 1;
}

function drawAttackPulseWaves(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    color: string
) {
    const waveCount = 3;
    const waveSpeed = 0.8;

    for (let i = 0; i < waveCount; i++) {
        const offset = i / waveCount;
        const progress = ((globalTime * waveSpeed) + offset) % 1;

        const x = x1 + (x2 - x1) * progress;
        const y = y1 + (y2 - y1) * progress;

        // Expanding ring
        const ringSize = 8 + (1 - progress) * 12;
        const alpha = progress * 0.4;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, ringSize, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function drawCongestionEffect(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    bandwidth: number
) {
    // Add vibration effect for congested lines
    const vibration = Math.sin(globalTime * 20) * (bandwidth - 1) * 2;
    const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;

    const offsetX = Math.cos(angle) * vibration;
    const offsetY = Math.sin(angle) * vibration;

    // Draw congestion indicator dots
    const centerX = (x1 + x2) / 2 + offsetX;
    const centerY = (y1 + y2) / 2 + offsetY;

    ctx.fillStyle = '#FBBF24';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawArrowhead(
    ctx: CanvasRenderingContext2D,
    fromX: number, fromY: number,
    toX: number, toY: number,
    color: string
) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const headLength = 14;

    // Position arrowhead at 80% along the line
    const arrowX = fromX + (toX - fromX) * 0.8;
    const arrowY = fromY + (toY - fromY) * 0.8;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(arrowX + headLength * Math.cos(angle), arrowY + headLength * Math.sin(angle));
    ctx.lineTo(
        arrowX - headLength * 0.6 * Math.cos(angle - Math.PI / 5),
        arrowY - headLength * 0.6 * Math.sin(angle - Math.PI / 5)
    );
    ctx.lineTo(
        arrowX - headLength * 0.6 * Math.cos(angle + Math.PI / 5),
        arrowY - headLength * 0.6 * Math.sin(angle + Math.PI / 5)
    );
    ctx.closePath();
    ctx.fill();
}

function drawProtocolBadge(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    label: string,
    color: string
) {
    ctx.font = 'bold 10px monospace';
    const textWidth = ctx.measureText(label).width;
    const padding = 6;
    const height = 18;
    const width = textWidth + padding * 2;

    // Badge shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(x - width / 2 + 2, y - height / 2 + 2, width, height, 4);
    ctx.fill();

    // Badge background
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, 4);
    ctx.fill();
    ctx.stroke();

    // Badge text
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
}
