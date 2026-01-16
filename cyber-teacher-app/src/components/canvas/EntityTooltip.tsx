'use client';

import { useSimulationStore } from '@/store/simulation-store';
import { useState, useEffect, useRef, useMemo } from 'react';
import { NetworkEntity } from '@/types/entities';

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    entity: NetworkEntity | null;
}

export function EntityTooltip() {
    const { entities, viewport } = useSimulationStore();
    const [tooltip, setTooltip] = useState<TooltipState>({
        visible: false,
        x: 0,
        y: 0,
        entity: null
    });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Listen for mouse movements over the canvas
    useEffect(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2 - viewport.offsetX;
            const mouseY = e.clientY - rect.top - rect.height / 2 - viewport.offsetY;

            // Check if mouse is near any entity
            let foundEntity: NetworkEntity | null = null;
            let minDistance = 60; // Hover radius

            entities.forEach((entity) => {
                const dx = mouseX - entity.position.x;
                const dy = mouseY - entity.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    minDistance = distance;
                    foundEntity = entity;
                }
            });

            if (foundEntity) {
                // Clear hide timeout
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                }

                setTooltip({
                    visible: true,
                    x: e.clientX + 15,
                    y: e.clientY - 10,
                    entity: foundEntity
                });
            } else if (tooltip.visible) {
                // Delay hiding tooltip
                if (!hideTimeoutRef.current) {
                    hideTimeoutRef.current = setTimeout(() => {
                        setTooltip(prev => ({ ...prev, visible: false }));
                        hideTimeoutRef.current = null;
                    }, 200);
                }
            }
        };

        const handleMouseLeave = () => {
            hideTimeoutRef.current = setTimeout(() => {
                setTooltip(prev => ({ ...prev, visible: false }));
            }, 100);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [entities, viewport, tooltip.visible]);

    // Get status color
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            idle: '#64748B',
            active: '#22C55E',
            under_attack: '#EF4444',
            blocked: '#F97316',
            connecting: '#22D3EE',
            processing: '#8B5CF6',
            overloaded: '#FBBF24',
            compromised: '#DC2626'
        };
        return colors[status] || '#64748B';
    };

    if (!tooltip.visible || !tooltip.entity) return null;

    const entity = tooltip.entity;

    return (
        <div
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none transition-opacity duration-150"
            style={{
                left: tooltip.x,
                top: tooltip.y,
                opacity: tooltip.visible ? 1 : 0
            }}
        >
            <div
                className="rounded-lg p-3 shadow-xl backdrop-blur-sm"
                style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    minWidth: '180px'
                }}
            >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
                    <span className="text-lg">
                        {entity.type === 'PC' && ''}
                        {entity.type === 'Router' && ''}
                        {entity.type === 'Server' && ''}
                        {entity.type === 'DNS' && ''}
                        {entity.type === 'ISP' && ''}
                        {entity.type === 'Firewall' && ''}
                        {entity.type === 'Attacker' && ''}
                        {entity.type === 'Cloud' && ''}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-white">
                            {entity.metadata.label || entity.type}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            {entity.type}
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-[11px]">
                    {/* IP Address */}
                    {entity.metadata.ip && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">IP Address:</span>
                            <span className="font-mono text-cyan-400">{entity.metadata.ip}</span>
                        </div>
                    )}

                    {/* Hostname */}
                    {entity.metadata.hostname && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Hostname:</span>
                            <span className="font-mono text-slate-300">{entity.metadata.hostname}</span>
                        </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{
                                background: `${getStatusColor(entity.status)}20`,
                                color: getStatusColor(entity.status)
                            }}
                        >
                            {entity.status.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Protocol if available */}
                    {entity.metadata.protocol && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Protocol:</span>
                            <span className="text-purple-400">{entity.metadata.protocol}</span>
                        </div>
                    )}

                    {/* Ports if available */}
                    {entity.metadata.ports && entity.metadata.ports.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Ports:</span>
                            <span className="text-blue-400 font-mono">
                                {entity.metadata.ports.slice(0, 3).join(', ')}
                                {entity.metadata.ports.length > 3 && '...'}
                            </span>
                        </div>
                    )}

                    {/* Health if available */}
                    {entity.health !== undefined && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-slate-400">Health:</span>
                                <span style={{ color: entity.health > 50 ? '#22C55E' : '#EF4444' }}>
                                    {entity.health}%
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${entity.health}%`,
                                        background: entity.health > 70
                                            ? '#22C55E'
                                            : entity.health > 40
                                                ? '#FBBF24'
                                                : '#EF4444'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="mt-2 pt-2 border-t border-slate-700 text-[9px] text-slate-500 text-center">
                    Click to inspect | ID: {entity.id}
                </div>
            </div>
        </div>
    );
}
