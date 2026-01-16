'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useSimulationStore } from '@/store/simulation-store';
import { drawGrid, drawAttackZone } from './renderers/GridRenderer';
import { drawEntity, updateEntityTime } from './renderers/EntityRenderer';
import { drawConnection, updateConnectionTime } from './renderers/ConnectionRenderer';
import { drawPacket, ENHANCED_PACKET_SPEEDS } from './renderers/PacketRenderer';

// Local packet state for smooth animation (not in React state)
interface LocalPacket {
    id: string;
    connectionId: string;
    protocol: string;
    progress: number;
    speed: number;
    direction: 'forward' | 'reverse';
}

export function SimulationCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const localPacketsRef = useRef<Map<string, LocalPacket>>(new Map());
    const fpsRef = useRef<{ frames: number; lastTime: number; fps: number }>({
        frames: 0,
        lastTime: performance.now(),
        fps: 60
    });

    const {
        entities,
        connections,
        packets,
        viewport,
        setViewportOffset,
        setDragging,
        isPlaying,
        isPaused,
        playbackSpeed,
        networkHealth,
        addLog,
        highlightedEntityId,
        highlightedConnectionId
    } = useSimulationStore();

    // Determine if system is under attack based on entity states
    const isUnderAttack = useMemo(() => {
        return Array.from(entities.values()).some(
            e => e.status === 'under_attack' || e.status === 'compromised'
        );
    }, [entities]);

    // Sync React packets to local ref (only when packets array changes)
    useEffect(() => {
        const localPackets = localPacketsRef.current;
        const reactPacketIds = new Set(packets.map(p => p.id));

        // Add new packets
        packets.forEach(p => {
            if (!localPackets.has(p.id)) {
                const speed = ENHANCED_PACKET_SPEEDS[p.protocol] || ENHANCED_PACKET_SPEEDS.DEFAULT;
                localPackets.set(p.id, {
                    id: p.id,
                    connectionId: p.connectionId,
                    protocol: p.protocol,
                    progress: p.progress,
                    speed: speed,
                    direction: p.direction
                });
            }
        });

        // Remove deleted packets
        localPackets.forEach((_, id) => {
            if (!reactPacketIds.has(id)) {
                localPackets.delete(id);
            }
        });
    }, [packets]);

    // Mouse drag state
    const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

    // Handle resize with debouncing for performance
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const parent = canvas.parentElement;
                if (parent) {
                    const dpr = window.devicePixelRatio || 1;
                    canvas.width = parent.clientWidth * dpr;
                    canvas.height = parent.clientHeight * dpr;
                    canvas.style.width = `${parent.clientWidth}px`;
                    canvas.style.height = `${parent.clientHeight}px`;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.scale(dpr, dpr);
                    }
                }
            }, 100);
        };

        // Initial sizing
        const parent = canvas.parentElement;
        if (parent) {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = parent.clientWidth * dpr;
            canvas.height = parent.clientHeight * dpr;
            canvas.style.width = `${parent.clientWidth}px`;
            canvas.style.height = `${parent.clientHeight}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);

    // Mouse handlers for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            offsetX: viewport.offsetX,
            offsetY: viewport.offsetY
        };
        setDragging(true);
    }, [viewport.offsetX, viewport.offsetY, setDragging]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragStartRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        setViewportOffset(
            dragStartRef.current.offsetX + dx,
            dragStartRef.current.offsetY + dy
        );
    }, [setViewportOffset]);

    const handleMouseUp = useCallback(() => {
        dragStartRef.current = null;
        setDragging(false);
    }, [setDragging]);

    // Handle node click for inspection
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (dragStartRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2 - viewport.offsetX;
        const y = e.clientY - rect.top - rect.height / 2 - viewport.offsetY;

        // Check if click hit any entity (with larger hit area for better UX)
        entities.forEach((entity) => {
            const dx = x - entity.position.x;
            const dy = y - entity.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 55) {
                // Entity clicked - show detailed info
                addLog({
                    type: 'info',
                    message: `� Inspecting: ${entity.metadata.label || entity.type}`,
                    entityId: entity.id,
                    protocol: entity.type
                });

                if (entity.metadata.ip) {
                    addLog({
                        type: 'info',
                        message: `   IP: ${entity.metadata.ip} | Status: ${entity.status.toUpperCase()}`,
                        entityId: entity.id
                    });
                }
            }
        });
    }, [entities, viewport, addLog]);

    // ============================================
    // OPTIMIZED RENDER LOOP
    // ============================================

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let running = true;
        lastTimeRef.current = performance.now();

        const render = (timestamp: number) => {
            if (!running) return;

            // Calculate delta time with frame cap
            const deltaTime = Math.min(timestamp - lastTimeRef.current, 50);
            lastTimeRef.current = timestamp;

            // FPS tracking
            fpsRef.current.frames++;
            if (timestamp - fpsRef.current.lastTime >= 1000) {
                fpsRef.current.fps = fpsRef.current.frames;
                fpsRef.current.frames = 0;
                fpsRef.current.lastTime = timestamp;
            }

            // Update animation times
            updateConnectionTime();
            updateEntityTime();

            const dpr = window.devicePixelRatio || 1;
            const width = canvas.width / dpr;
            const height = canvas.height / dpr;

            // ============================================
            // BACKGROUND LAYER
            // ============================================

            ctx.fillStyle = '#0A0F1A';
            ctx.fillRect(0, 0, width, height);

            // Save context and apply viewport transform
            ctx.save();
            ctx.translate(viewport.offsetX + width / 2, viewport.offsetY + height / 2);

            // Draw grid with health-based coloring
            drawGrid(ctx, width, height, viewport.offsetX, viewport.offsetY, networkHealth, isUnderAttack);

            // ============================================
            // ATTACK ZONES (under entities)
            // ============================================

            // Draw attack indicators around attacked nodes
            entities.forEach((entity) => {
                if (entity.status === 'under_attack' || entity.status === 'compromised') {
                    drawAttackZone(ctx, entity.position.x, entity.position.y, 120);
                }
            });

            // ============================================
            // CONNECTION LAYER
            // ============================================

            connections.forEach((connection) => {
                const source = entities.get(connection.sourceId);
                const target = entities.get(connection.targetId);
                if (source && target) {
                    const isHighlighted = connection.id === highlightedConnectionId;
                    drawConnection(ctx, connection, source.position, target.position, undefined, isHighlighted);
                }
            });

            // ============================================
            // ENTITY LAYER
            // ============================================

            entities.forEach((entity) => {
                const isHighlighted = entity.id === highlightedEntityId;
                drawEntity(ctx, entity, isHighlighted);
            });

            // ============================================
            // PACKET LAYER (top)
            // ============================================

            const localPackets = localPacketsRef.current;
            const packetsToRemove: string[] = [];

            localPackets.forEach((packet) => {
                const connection = connections.get(packet.connectionId);
                if (!connection) {
                    packetsToRemove.push(packet.id);
                    return;
                }

                const source = entities.get(connection.sourceId);
                const target = entities.get(connection.targetId);
                if (!source || !target) {
                    packetsToRemove.push(packet.id);
                    return;
                }

                // Update packet progress (smooth animation independent of React)
                if (isPlaying && !isPaused) {
                    packet.progress += packet.speed * playbackSpeed * deltaTime / 16;
                }

                if (packet.progress >= 1) {
                    packetsToRemove.push(packet.id);
                } else {
                    drawPacket(ctx, packet, source.position, target.position);
                }
            });

            // Batch remove completed packets
            packetsToRemove.forEach(id => localPackets.delete(id));

            ctx.restore();

            // Request next frame
            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);

        return () => {
            running = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [entities, connections, viewport, isPlaying, isPaused, playbackSpeed, networkHealth, isUnderAttack, highlightedEntityId, highlightedConnectionId]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
        />
    );
}
