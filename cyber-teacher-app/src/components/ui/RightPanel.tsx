'use client';

import { useSimulationStore } from '@/store/simulation-store';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const LOG_COLORS: Record<string, string> = {
    info: '#22D3EE',
    warning: '#F59E0B',
    error: '#EF4444',
    success: '#22C55E',
    attack: '#EF4444',
    defense: '#3B82F6'
};

const PROTOCOL_COLORS: Record<string, string> = {
    DHCP: '#FACC15',
    ARP: '#22D3EE',
    DNS: '#A855F7',
    TCP: '#3B82F6',
    HTTPS: '#22C55E',
    ATTACK: '#EF4444',
    SYN: '#EF4444'
};

const ATTACK_TYPES = [
    { id: 'ddos', label: 'DDoS Flood', icon: '🌊', description: 'Overwhelms target with traffic' },
    { id: 'sql', label: 'SQL Injection', icon: '💉', description: 'Injects malicious database queries' },
    { id: 'mitm', label: 'MITM', icon: '👁️', description: 'Intercepts communications' },
    { id: 'phishing', label: 'Phishing', icon: '🎣', description: 'Social engineering attack' },
    { id: 'malware', label: 'Malware', icon: '🦠', description: 'Deploys malicious software' }
];

const DEFENSE_TYPES = [
    { id: 'waf', label: 'Enable WAF', icon: '🛡️', color: '#22C55E', description: 'Web Application Firewall' },
    { id: 'block', label: 'Block IP', icon: '🚫', color: '#EF4444', description: 'Blocks attacker IP address' },
    { id: 'rate', label: 'Rate Limit', icon: '⏱️', color: '#F59E0B', description: 'Limits request frequency' },
    { id: 'dns', label: 'DNS Filtering', icon: '🔍', color: '#3B82F6', description: 'Filters malicious domains' },
    { id: 'quarantine', label: 'Quarantine', icon: '🔒', color: '#8B5CF6', description: 'Isolates infected nodes' }
];

export function RightPanel() {
    const {
        logs,
        addLog,
        clearLogs,
        setHighlight,
        clearHighlight,
        packets,
        updateEntityStatus,
        damageNetwork,
        healNetwork,
        networkHealth
    } = useSimulationStore();

    const logsEndRef = useRef<HTMLDivElement>(null);
    const [hoveredLogId, setHoveredLogId] = useState<string | null>(null);
    const [showPacketStats, setShowPacketStats] = useState(true);

    // Smooth scroll to latest log
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Calculate packet statistics
    const packetStats = useMemo(() => {
        const stats: Record<string, number> = {};
        packets.forEach(p => {
            stats[p.protocol] = (stats[p.protocol] || 0) + 1;
        });
        return stats;
    }, [packets]);

    // Handle attack button click
    const handleAttack = useCallback((attackType: string, attackId: string) => {
        addLog({
            type: 'attack',
            message: `⚠️ Attack initiated: ${attackType}`,
            protocol: 'ATTACK'
        });

        // Simulate damage
        damageNetwork(10);

        // Flash feedback
        document.body.style.transition = 'background 0.3s';
        document.body.style.background = 'rgba(239, 68, 68, 0.1)';
        setTimeout(() => {
            document.body.style.background = '';
        }, 300);
    }, [addLog, damageNetwork]);

    // Handle defense button click
    const handleDefense = useCallback((defenseType: string, defenseId: string) => {
        addLog({
            type: 'defense',
            message: `🛡️ Defense activated: ${defenseType}`,
            protocol: defenseId.toUpperCase()
        });

        // Simulate healing
        healNetwork(15);

        // Success flash
        document.body.style.transition = 'background 0.3s';
        document.body.style.background = 'rgba(34, 197, 94, 0.1)';
        setTimeout(() => {
            document.body.style.background = '';
        }, 300);
    }, [addLog, healNetwork]);

    // Handle log hover - highlight related entities
    const handleLogHover = useCallback((log: { entityId?: string; id: string }) => {
        setHoveredLogId(log.id);
        if (log.entityId) {
            setHighlight(log.entityId);
        }
    }, [setHighlight]);

    const handleLogLeave = useCallback(() => {
        setHoveredLogId(null);
        clearHighlight();
    }, [clearHighlight]);

    // Format timestamp from number to HH:MM:SS
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toTimeString().substring(0, 8);
    };

    return (
        <aside
            className="w-72 flex flex-col border-l overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, #0D1B2A 0%, #0A1628 100%)',
                borderColor: '#22D3EE30'
            }}
        >
            {/* Details Panel - Contextual Info */}
            <div className="border-b p-3" style={{ borderColor: '#22D3EE20' }}>
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                        DETAILS
                    </h3>
                </div>
                <div className="space-y-2">
                    {/* Dynamic context based on current step */}
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span className="text-xs text-slate-300">Bidirectional Communication</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="text-xs text-slate-300">Cloud Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-xs text-slate-300">Global Reach</span>
                    </div>
                    {networkHealth < 100 && (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            <span className="text-xs text-red-400">Network Under Stress</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Attack Engine */}
            <div className="border-b p-3" style={{ borderColor: '#EF444430' }}>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-500">⚔️</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#EF4444' }}>
                        Attack Engine
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                    {ATTACK_TYPES.map((attack) => (
                        <button
                            key={attack.id}
                            onClick={() => handleAttack(attack.label, attack.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] group"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#EF4444'
                            }}
                            title={attack.description}
                        >
                            <span>{attack.icon}</span>
                            <span className="flex-1 text-left">{attack.label}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[9px]">→</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Defense Engine */}
            <div className="border-b p-3" style={{ borderColor: '#22C55E30' }}>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-500">🛡️</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#22C55E' }}>
                        Defense Engine
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                    {DEFENSE_TYPES.map((defense) => (
                        <button
                            key={defense.id}
                            onClick={() => handleDefense(defense.label, defense.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] group"
                            style={{
                                background: `${defense.color}15`,
                                border: `1px solid ${defense.color}50`,
                                color: defense.color
                            }}
                            title={defense.description}
                        >
                            <span>{defense.icon}</span>
                            <span className="flex-1 text-left">{defense.label}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[9px]">→</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Packet Statistics */}
            <div className="border-b p-3" style={{ borderColor: '#22D3EE20' }}>
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowPacketStats(!showPacketStats)}
                >
                    <div className="flex items-center gap-2">
                        <span>📊</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                            Packet Stats
                        </h3>
                    </div>
                    <span className="text-[10px]" style={{ color: '#64748B' }}>
                        {showPacketStats ? '▼' : '▶'}
                    </span>
                </div>

                {showPacketStats && (
                    <div className="mt-2 grid grid-cols-3 gap-1">
                        {Object.entries(packetStats).length > 0 ? (
                            Object.entries(packetStats).map(([protocol, count]) => (
                                <div
                                    key={protocol}
                                    className="px-2 py-1 rounded text-center"
                                    style={{
                                        background: `${PROTOCOL_COLORS[protocol] || '#64748B'}15`,
                                        border: `1px solid ${PROTOCOL_COLORS[protocol] || '#64748B'}40`
                                    }}
                                >
                                    <div
                                        className="text-[10px] font-bold"
                                        style={{ color: PROTOCOL_COLORS[protocol] || '#64748B' }}
                                    >
                                        {count}
                                    </div>
                                    <div
                                        className="text-[8px] uppercase"
                                        style={{ color: PROTOCOL_COLORS[protocol] || '#64748B' }}
                                    >
                                        {protocol}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                className="col-span-3 text-center py-2 text-[10px]"
                                style={{ color: '#64748B' }}
                            >
                                No active packets
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Packet Trace / Logs */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div
                    className="flex items-center justify-between px-3 py-2 border-b"
                    style={{ borderColor: '#22D3EE20' }}
                >
                    <div className="flex items-center gap-2">
                        <span>📡</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                            Packet Trace
                        </h3>
                        <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                            style={{
                                background: logs.length > 50 ? '#EF444420' : '#1E293B',
                                color: logs.length > 50 ? '#EF4444' : '#64748B'
                            }}
                        >
                            {logs.length}
                        </span>
                    </div>
                    <button
                        onClick={() => clearLogs()}
                        className="text-[10px] px-2 py-0.5 rounded transition-all hover:bg-slate-700"
                        style={{ background: '#1E293B', color: '#64748B' }}
                    >
                        Clear
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ fontSize: '10px' }}>
                    {logs.length === 0 ? (
                        <div className="text-center py-8 opacity-50" style={{ color: '#64748B' }}>
                            No network activity
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className={`flex items-start gap-1.5 p-1.5 rounded cursor-pointer transition-all ${hoveredLogId === log.id ? 'ring-1 ring-yellow-500/50' : ''
                                    }`}
                                style={{
                                    background: hoveredLogId === log.id ? '#1E293B' : '#0F172A80',
                                    borderLeft: `2px solid ${LOG_COLORS[log.type] || '#64748B'}`
                                }}
                                onMouseEnter={() => handleLogHover(log)}
                                onMouseLeave={handleLogLeave}
                            >
                                <span
                                    className="font-mono opacity-50 flex-shrink-0"
                                    style={{ color: '#64748B', fontSize: '9px' }}
                                >
                                    {formatTime(log.timestamp)}
                                </span>
                                <span className="flex-1" style={{ color: '#E2E8F0' }}>
                                    {log.message}
                                </span>
                                {log.protocol && (
                                    <span
                                        className="px-1 rounded text-[8px] font-bold flex-shrink-0"
                                        style={{
                                            background: PROTOCOL_COLORS[log.protocol] || LOG_COLORS[log.type],
                                            color: '#0F172A'
                                        }}
                                    >
                                        {log.protocol}
                                    </span>
                                )}
                                {log.entityId && (
                                    <span
                                        className="text-[8px]"
                                        style={{ color: '#64748B' }}
                                        title={`Entity: ${log.entityId}`}
                                    >
                                        🔗
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>

                {/* Legend */}
                <div
                    className="px-3 py-2 border-t flex flex-wrap gap-2 text-[9px]"
                    style={{ borderColor: '#22D3EE20' }}
                >
                    <span style={{ color: '#22C55E' }}>✓ OK</span>
                    <span style={{ color: '#F59E0B' }}>△ Warn</span>
                    <span style={{ color: '#EF4444' }}>✗ Attack</span>
                    <span style={{ color: '#3B82F6' }}>🛡 Defense</span>
                </div>
            </div>
        </aside>
    );
}
