'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { CyberpunkCanvas } from '@/components/canvas/CyberpunkCanvas';
import { useSimulationStore } from '@/store/simulation-store';
import { useSound } from '@/hooks/use-sound';

const ATTACK_TYPES = [
    { id: 'ddos', label: 'DDoS', icon: '⚡', description: 'Overwhelm with traffic', damage: 15, color: '#EF4444' },
    { id: 'sql', label: 'SQL Injection', icon: '💉', description: 'Database attack', damage: 20, color: '#F97316' },
    { id: 'malware', label: 'Malware', icon: '🦠', description: 'Deploy malware', damage: 25, color: '#DC2626' },
    { id: 'phishing', label: 'Phishing', icon: '🎣', description: 'Social engineering', damage: 12, color: '#FBBF24' },
    { id: 'mitm', label: 'MITM', icon: '👁️', description: 'Intercept data', damage: 10, color: '#F472B6' },
];

const DEFENSE_TYPES = [
    { id: 'firewall', label: 'Firewall', icon: '🔥', color: '#22C55E', heal: 10 },
    { id: 'block', label: 'Block IP', icon: '🚫', color: '#EF4444', heal: 8 },
    { id: 'rate', label: 'Rate Limit', icon: '⏱️', color: '#F59E0B', heal: 12 },
    { id: 'dns', label: 'DNS Filter', icon: '🔍', color: '#3B82F6', heal: 15 },
    { id: 'quarantine', label: 'Quarantine', icon: '🔒', color: '#8B5CF6', heal: 20 },
];

interface LogEntry {
    id: string;
    timestamp: string;
    type: 'info' | 'attack' | 'defense' | 'error';
    message: string;
    color: string;
}

export default function SandboxPage() {
    const {
        networkHealth,
        damageNetwork,
        healNetwork,
        logs,
        clearLogs,
        addLog,
        setEntities,
        addConnection,
        clearEntities,
        clearConnections,
        clearPackets
    } = useSimulationStore();
    const { playAttack, playDefense, playSuccess, playError } = useSound();

    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Initialize network topology
    useEffect(() => {
        clearEntities();
        clearConnections();
        clearPackets();

        setTimeout(() => {
            const entities = new Map();

            // USER PC - Left side
            entities.set('user-pc', {
                id: 'user-pc',
                type: 'PC',
                position: { x: -300, y: 0 },
                status: 'active',
                metadata: { label: 'USER PC', ip: '192.168.1.10' }
            });

            // ROUTER - Center-left
            entities.set('router', {
                id: 'router',
                type: 'Router',
                position: { x: -100, y: 0 },
                status: 'active',
                metadata: { label: 'ROUTER', ip: '192.168.1.1' }
            });

            // DNS SERVER - Bottom center
            entities.set('dns-server', {
                id: 'dns-server',
                type: 'DNS',
                position: { x: 0, y: 120 },
                status: 'active',
                metadata: { label: 'DNS SERVER', ip: '8.8.8.8' }
            });

            // FIREWALL - Center
            entities.set('firewall', {
                id: 'firewall',
                type: 'Firewall',
                position: { x: 100, y: -60 },
                status: 'active',
                metadata: { label: 'FIREWALL' }
            });

            // WEB SERVER - Right side
            entities.set('web-server', {
                id: 'web-server',
                type: 'Server',
                position: { x: 200, y: 0 },
                status: 'active',
                metadata: { label: 'WEB SERVER', ip: '10.0.0.5' }
            });

            // ATTACKER - Far right
            entities.set('attacker', {
                id: 'attacker',
                type: 'Attacker',
                position: { x: 350, y: 0 },
                status: 'idle',
                metadata: { label: 'ATTACKER', ip: '45.5.5.166' }
            });

            setEntities(entities);

            // Add connections with delay
            setTimeout(() => {
                // User PC -> Router
                addConnection({
                    id: 'conn-1',
                    sourceId: 'user-pc',
                    targetId: 'router',
                    style: 'solid',
                    status: 'active',
                    protocol: 'DHCP'
                });

                // Router -> DNS
                addConnection({
                    id: 'conn-2',
                    sourceId: 'router',
                    targetId: 'dns-server',
                    style: 'dotted',
                    status: 'active',
                    protocol: 'DNS'
                });

                // Router -> Firewall
                addConnection({
                    id: 'conn-3',
                    sourceId: 'router',
                    targetId: 'firewall',
                    style: 'solid',
                    status: 'active'
                });

                // Firewall -> Web Server
                addConnection({
                    id: 'conn-4',
                    sourceId: 'firewall',
                    targetId: 'web-server',
                    style: 'encrypted',
                    status: 'active',
                    protocol: 'HTTP'
                });

                // Attacker -> Firewall (attack connection - initially hidden)
                addConnection({
                    id: 'conn-attack',
                    sourceId: 'attacker',
                    targetId: 'firewall',
                    style: 'blocked',
                    status: 'idle'
                });
            }, 200);
        }, 100);

        // Add initial log
        addSystemLog('info', 'System initialized. Network topology loaded.', '#22D3EE');
        addSystemLog('info', 'DHCP Request from User PC', '#22D3EE');
        addSystemLog('info', 'DHCP | Status: OK', '#22C55E');

        return () => {
            clearEntities();
        };
    }, []);

    const addSystemLog = useCallback((type: LogEntry['type'], message: string, color: string) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSystemLogs(prev => [...prev.slice(-20), { id, timestamp, type, message, color }]);
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [systemLogs]);

    const handleAttack = useCallback((attack: typeof ATTACK_TYPES[0]) => {
        playAttack(attack.id as 'ddos' | 'sql' | 'phishing' | 'malware');
        damageNetwork(attack.damage);

        addSystemLog('attack', `⚠️ ${attack.label} Attack Initiated`, attack.color);
        addSystemLog('attack', `Targeting: Web Server (10.0.0.5)`, attack.color);
        addLog({ type: 'attack', message: `${attack.label} attack launched!`, protocol: 'ATTACK' });

        // Flash effect
        document.body.style.transition = 'background 0.2s';
        document.body.style.background = `${attack.color}15`;
        setTimeout(() => { document.body.style.background = ''; }, 300);

        if (networkHealth - attack.damage <= 0) {
            playError();
            addSystemLog('error', '💀 CRITICAL: Network Compromised!', '#EF4444');
        }
    }, [playAttack, damageNetwork, addLog, networkHealth, playError, addSystemLog]);

    const handleDefense = useCallback((defense: typeof DEFENSE_TYPES[0]) => {
        playDefense();
        healNetwork(defense.heal);

        addSystemLog('defense', `🛡️ ${defense.label} Activated`, defense.color);
        addSystemLog('info', `Defense Status: ACTIVE`, defense.color);
        addLog({ type: 'defense', message: `${defense.label} activated!`, protocol: 'DEFENSE' });

        // Flash effect  
        document.body.style.transition = 'background 0.2s';
        document.body.style.background = `${defense.color}15`;
        setTimeout(() => { document.body.style.background = ''; }, 300);

        if (networkHealth + defense.heal >= 100) {
            playSuccess();
            addSystemLog('info', '✅ Network Fully Secured', '#22C55E');
        }
    }, [playDefense, healNetwork, addLog, networkHealth, playSuccess, addSystemLog]);

    const resetNetwork = useCallback(() => {
        healNetwork(100);
        clearLogs();
        setSystemLogs([]);
        addSystemLog('info', '🔄 Network Reset to Healthy State', '#22D3EE');
    }, [healNetwork, clearLogs, addSystemLog]);

    const healthColor = networkHealth > 70 ? '#22C55E' : networkHealth > 40 ? '#F59E0B' : '#EF4444';

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#050A15' }}>
            <Navigation />

            {/* Main Content - Full Height Layout */}
            <div className="flex-1 flex flex-col lg:flex-row">

                {/* Left Panel - Attack Tools */}
                <div
                    className="lg:w-48 p-3 flex flex-col gap-2"
                    style={{
                        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        borderRight: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-500">⚔️</span>
                        <span className="text-xs font-bold text-red-400 tracking-wider">ATTACK TOOLS</span>
                    </div>
                    {ATTACK_TYPES.map((attack) => (
                        <button
                            key={attack.id}
                            onClick={() => handleAttack(attack)}
                            className="w-full p-2 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                            style={{
                                background: `linear-gradient(135deg, ${attack.color}20 0%, ${attack.color}05 100%)`,
                                border: `1px solid ${attack.color}40`,
                                boxShadow: `0 0 10px ${attack.color}10`
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{attack.icon}</span>
                                <span className="text-xs font-medium" style={{ color: attack.color }}>{attack.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Center - Canvas */}
                <div className="flex-1 flex flex-col">
                    {/* Top Controls */}
                    <div
                        className="flex items-center justify-center gap-4 py-3 px-4"
                        style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            borderBottom: '1px solid rgba(34, 211, 238, 0.15)'
                        }}
                    >
                        {/* Play/Pause */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="px-4 py-1.5 rounded text-xs font-bold transition-all"
                            style={{
                                background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                border: `1px solid ${isPlaying ? '#EF4444' : '#22C55E'}`,
                                color: isPlaying ? '#EF4444' : '#22C55E'
                            }}
                        >
                            {isPlaying ? '▶ PLAY' : '⏸ PAUSE'}
                        </button>

                        {/* Speed Controls */}
                        <div className="flex items-center gap-1">
                            {[1, 2, 4].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSpeed(s)}
                                    className="w-8 h-7 rounded text-xs font-bold transition-all"
                                    style={{
                                        background: speed === s ? 'rgba(34, 211, 238, 0.3)' : 'rgba(30, 41, 59, 0.5)',
                                        border: `1px solid ${speed === s ? '#22D3EE' : '#334155'}`,
                                        color: speed === s ? '#22D3EE' : '#64748B'
                                    }}
                                >
                                    x{s}
                                </button>
                            ))}
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={resetNetwork}
                            className="px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2"
                            style={{
                                background: 'rgba(100, 116, 139, 0.2)',
                                border: '1px solid #475569',
                                color: '#94A3B8'
                            }}
                        >
                            ↻ RESET
                        </button>
                    </div>

                    {/* Canvas Area */}
                    <div
                        className="flex-1 relative"
                        style={{
                            background: 'radial-gradient(circle at center, #0A1628 0%, #050A15 100%)',
                            minHeight: '400px'
                        }}
                    >
                        <CyberpunkCanvas />

                        {/* Health Overlay */}
                        <div className="absolute top-4 right-4 flex items-center gap-3 px-4 py-2 rounded-lg"
                            style={{
                                background: 'rgba(15, 23, 42, 0.9)',
                                border: `1px solid ${healthColor}40`
                            }}
                        >
                            <span className="text-xs text-slate-400">NETWORK HEALTH</span>
                            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.max(0, Math.min(100, networkHealth))}%`,
                                        background: healthColor,
                                        boxShadow: `0 0 10px ${healthColor}`
                                    }}
                                />
                            </div>
                            <span className="text-sm font-bold" style={{ color: healthColor }}>
                                {Math.max(0, Math.min(100, networkHealth))}%
                            </span>
                        </div>
                    </div>

                    {/* System Logs */}
                    <div
                        className="h-36"
                        style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            borderTop: '1px solid rgba(34, 211, 238, 0.15)'
                        }}
                    >
                        <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid rgba(34, 211, 238, 0.1)' }}>
                            <span className="text-xs font-bold text-slate-400">📡 SYSTEM LOGS</span>
                            <button
                                onClick={() => setSystemLogs([])}
                                className="text-[10px] text-slate-500 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <div
                            ref={logContainerRef}
                            className="h-[calc(100%-28px)] overflow-y-auto p-2 font-mono text-[11px]"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {systemLogs.map((log) => (
                                <div key={log.id} className="flex gap-2 py-0.5">
                                    <span className="text-slate-600">[{log.timestamp}]</span>
                                    <span style={{ color: log.color }}>{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Defense Controls */}
                <div
                    className="lg:w-48 p-3 flex flex-col gap-2"
                    style={{
                        background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        borderLeft: '1px solid rgba(34, 197, 94, 0.2)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">🛡️</span>
                        <span className="text-xs font-bold text-green-400 tracking-wider">DEFENSE CONTROLS</span>
                    </div>
                    {DEFENSE_TYPES.map((defense) => (
                        <button
                            key={defense.id}
                            onClick={() => handleDefense(defense)}
                            className="w-full p-2 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: `linear-gradient(135deg, ${defense.color}20 0%, ${defense.color}05 100%)`,
                                border: `1px solid ${defense.color}40`,
                                boxShadow: `0 0 10px ${defense.color}10`
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{defense.icon}</span>
                                <span className="text-xs font-medium" style={{ color: defense.color }}>{defense.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
