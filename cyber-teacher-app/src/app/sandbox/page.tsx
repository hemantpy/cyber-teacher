'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { CyberpunkCanvas } from '@/components/canvas/CyberpunkCanvas';
import { useSimulationStore } from '@/store/simulation-store';
import { useSound } from '@/hooks/use-sound';
import { GridBackground } from '@/components/ui/GridBackground';
import { NeonCard, NeonPanel } from '@/components/ui/NeonCard';
import { CyberButton } from '@/components/ui/CyberButton';
import { StatusLED, StatusIndicator } from '@/components/ui/StatusLED';
import {
    DDoSIcon,
    SQLInjectionIcon,
    MalwareIcon,
    PhishingIcon,
    MITMIcon,
    DefenseFirewallIcon,
    BlockIPIcon,
    RateLimitIcon,
    DNSFilterIcon,
    QuarantineIcon,
    AttackSwordsIcon,
    DefenseShieldIcon,
    TerminalIcon,
    PlayIcon,
    PauseIcon,
    ResetIcon,
    HealthIcon,
} from '@/components/ui/CyberIcons';
import anime from 'animejs';

const ATTACK_TYPES = [
    { id: 'ddos', label: 'DDoS', Icon: DDoSIcon, description: 'Overwhelm with traffic', damage: 15, color: '#EF4444' },
    { id: 'sql', label: 'SQL Injection', Icon: SQLInjectionIcon, description: 'Database attack', damage: 20, color: '#F97316' },
    { id: 'malware', label: 'Malware', Icon: MalwareIcon, description: 'Deploy malware', damage: 25, color: '#DC2626' },
    { id: 'phishing', label: 'Phishing', Icon: PhishingIcon, description: 'Social engineering', damage: 12, color: '#FBBF24' },
    { id: 'mitm', label: 'MITM', Icon: MITMIcon, description: 'Intercept data', damage: 10, color: '#F472B6' },
];

const DEFENSE_TYPES = [
    { id: 'firewall', label: 'Firewall', Icon: DefenseFirewallIcon, color: '#22C55E', heal: 10 },
    { id: 'block', label: 'Block IP', Icon: BlockIPIcon, color: '#EF4444', heal: 8 },
    { id: 'rate', label: 'Rate Limit', Icon: RateLimitIcon, color: '#F59E0B', heal: 12 },
    { id: 'dns', label: 'DNS Filter', Icon: DNSFilterIcon, color: '#3B82F6', heal: 15 },
    { id: 'quarantine', label: 'Quarantine', Icon: QuarantineIcon, color: '#8B5CF6', heal: 20 },
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

            entities.set('user-pc', {
                id: 'user-pc',
                type: 'PC',
                position: { x: -350, y: 0 },
                status: 'active',
                metadata: { label: 'USER PC', ip: '192.168.1.10' }
            });

            entities.set('router', {
                id: 'router',
                type: 'Router',
                position: { x: -150, y: 0 },
                status: 'active',
                metadata: { label: 'ROUTER', ip: '192.168.1.1' }
            });

            entities.set('dns-server', {
                id: 'dns-server',
                type: 'DNS',
                position: { x: -50, y: 150 },
                status: 'active',
                metadata: { label: 'DNS SERVER', ip: '8.8.8.8' }
            });

            entities.set('firewall', {
                id: 'firewall',
                type: 'Firewall',
                position: { x: 50, y: -80 },
                status: 'active',
                metadata: { label: 'FIREWALL' }
            });

            entities.set('web-server', {
                id: 'web-server',
                type: 'Server',
                position: { x: 180, y: 0 },
                status: 'active',
                metadata: { label: 'WEB SERVER', ip: '10.0.0.5' }
            });

            entities.set('attacker', {
                id: 'attacker',
                type: 'Attacker',
                position: { x: 350, y: 0 },
                status: 'idle',
                metadata: { label: 'ATTACKER', ip: '45.5.5.166' }
            });

            setEntities(entities);

            setTimeout(() => {
                addConnection({ id: 'conn-1', sourceId: 'user-pc', targetId: 'router', style: 'solid', status: 'active', protocol: 'DHCP' });
                addConnection({ id: 'conn-2', sourceId: 'router', targetId: 'dns-server', style: 'dotted', status: 'active', protocol: 'DNS' });
                addConnection({ id: 'conn-3', sourceId: 'router', targetId: 'firewall', style: 'solid', status: 'active' });
                addConnection({ id: 'conn-4', sourceId: 'firewall', targetId: 'web-server', style: 'encrypted', status: 'active', protocol: 'HTTP' });
                addConnection({ id: 'conn-attack', sourceId: 'attacker', targetId: 'firewall', style: 'blocked', status: 'idle' });
            }, 200);
        }, 100);

        addSystemLog('info', 'System initialized. Network topology loaded.', '#22D3EE');
        addSystemLog('info', 'DHCP Request from User PC', '#22D3EE');
        addSystemLog('info', 'DHCP | Status: OK', '#22C55E');

        return () => { clearEntities(); };
    }, []);

    const addSystemLog = useCallback((type: LogEntry['type'], message: string, color: string) => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSystemLogs(prev => [...prev.slice(-20), { id, timestamp, type, message, color }]);
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [systemLogs]);

    const handleAttack = useCallback((attack: typeof ATTACK_TYPES[0], buttonRef: HTMLButtonElement | null) => {
        playAttack(attack.id as 'ddos' | 'sql' | 'phishing' | 'malware');
        damageNetwork(attack.damage);

        // Vibrate animation on button
        if (buttonRef) {
            anime({
                targets: buttonRef,
                translateX: [0, -3, 3, -3, 3, 0],
                duration: 300,
                easing: 'easeInOutSine',
            });
        }

        addSystemLog('attack', `[!] ${attack.label} Attack Initiated`, attack.color);
        addSystemLog('attack', `Targeting: Web Server (10.0.0.5)`, attack.color);
        addLog({ type: 'attack', message: `${attack.label} attack launched!`, protocol: 'ATTACK' });

        // Screen flash
        document.body.style.transition = 'background 0.2s';
        document.body.style.background = `${attack.color}15`;
        setTimeout(() => { document.body.style.background = ''; }, 300);

        if (networkHealth - attack.damage <= 0) {
            playError();
            addSystemLog('error', '[X] CRITICAL: Network Compromised!', '#EF4444');
        }
    }, [playAttack, damageNetwork, addLog, networkHealth, playError, addSystemLog]);

    const handleDefense = useCallback((defense: typeof DEFENSE_TYPES[0], buttonRef: HTMLButtonElement | null) => {
        playDefense();
        healNetwork(defense.heal);

        // Pulse animation on button
        if (buttonRef) {
            anime({
                targets: buttonRef,
                scale: [1, 1.05, 1],
                duration: 300,
                easing: 'easeOutExpo',
            });
        }

        addSystemLog('defense', `[+] ${defense.label} Activated`, defense.color);
        addSystemLog('info', `Defense Status: ACTIVE`, defense.color);
        addLog({ type: 'defense', message: `${defense.label} activated!`, protocol: 'DEFENSE' });

        document.body.style.transition = 'background 0.2s';
        document.body.style.background = `${defense.color}15`;
        setTimeout(() => { document.body.style.background = ''; }, 300);

        if (networkHealth + defense.heal >= 100) {
            playSuccess();
            addSystemLog('info', '[OK] Network Fully Secured', '#22C55E');
        }
    }, [playDefense, healNetwork, addLog, networkHealth, playSuccess, addSystemLog]);

    const resetNetwork = useCallback(() => {
        healNetwork(100);
        clearLogs();
        setSystemLogs([]);
        addSystemLog('info', '[R] Network Reset to Healthy State', '#22D3EE');
    }, [healNetwork, clearLogs, addSystemLog]);

    const healthColor = networkHealth > 70 ? '#22C55E' : networkHealth > 40 ? '#F59E0B' : '#EF4444';
    const healthStatus = networkHealth > 70 ? 'active' : networkHealth > 40 ? 'warning' : 'critical';

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#050A15' }}>
            <Navigation />

            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Left Panel - Attack Tools */}
                <NeonPanel
                    variant="attack"
                    title="Attack Tools"
                    icon={<AttackSwordsIcon size="sm" glow />}
                    className="lg:w-52"
                >
                    <div className="flex flex-col gap-2">
                        {ATTACK_TYPES.map((attack) => (
                            <NeonCard
                                key={attack.id}
                                variant="attack"
                                className="p-2"
                                onClick={() => handleAttack(attack, null)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ background: `${attack.color}20` }}
                                    >
                                        <attack.Icon size="md" glow glowIntensity={8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold" style={{ color: attack.color }}>
                                            {attack.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate">
                                            DMG: {attack.damage}
                                        </div>
                                    </div>
                                </div>
                            </NeonCard>
                        ))}
                    </div>
                </NeonPanel>

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
                        <CyberButton
                            variant={isPlaying ? 'defense' : 'neutral'}
                            size="sm"
                            icon={isPlaying ? <PauseIcon size="sm" /> : <PlayIcon size="sm" />}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? 'PAUSE' : 'PLAY'}
                        </CyberButton>

                        <div className="flex items-center gap-1">
                            {[1, 2, 4].map((s) => (
                                <CyberButton
                                    key={s}
                                    variant={speed === s ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSpeed(s)}
                                >
                                    x{s}
                                </CyberButton>
                            ))}
                        </div>

                        <CyberButton
                            variant="neutral"
                            size="sm"
                            icon={<ResetIcon size="sm" />}
                            onClick={resetNetwork}
                        >
                            RESET
                        </CyberButton>
                    </div>

                    {/* Canvas Area */}
                    <GridBackground
                        className="flex-1 relative min-h-[400px]"
                        showGrid={true}
                        showParticles={true}
                        particleCount={15}
                    >
                        <CyberpunkCanvas />

                        {/* Health Overlay */}
                        <div
                            className="absolute top-4 right-4 flex items-center gap-3 px-4 py-2 rounded-lg"
                            style={{
                                background: 'rgba(15, 23, 42, 0.9)',
                                border: `1px solid ${healthColor}40`,
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <HealthIcon size="sm" color={healthColor} glow />
                            <span className="text-xs text-slate-400">NETWORK</span>
                            <div
                                className="w-24 h-2 rounded-full overflow-hidden"
                                style={{ background: 'rgba(30, 41, 59, 0.8)' }}
                            >
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
                            <StatusLED status={healthStatus} size="sm" />
                        </div>
                    </GridBackground>

                    {/* System Logs */}
                    <div
                        className="h-36"
                        style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            borderTop: '1px solid rgba(34, 211, 238, 0.15)'
                        }}
                    >
                        <div
                            className="flex items-center justify-between px-3 py-1.5"
                            style={{ borderBottom: '1px solid rgba(34, 211, 238, 0.1)' }}
                        >
                            <div className="flex items-center gap-2">
                                <TerminalIcon size="sm" color="#22D3EE" glow glowIntensity={5} />
                                <span className="text-xs font-bold text-slate-400 tracking-wider">SYSTEM LOGS</span>
                            </div>
                            <CyberButton variant="ghost" size="sm" onClick={() => setSystemLogs([])}>
                                Clear
                            </CyberButton>
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
                <NeonPanel
                    variant="defense"
                    title="Defense Controls"
                    icon={<DefenseShieldIcon size="sm" glow />}
                    className="lg:w-52"
                >
                    <div className="flex flex-col gap-2">
                        {DEFENSE_TYPES.map((defense) => (
                            <NeonCard
                                key={defense.id}
                                variant="defense"
                                className="p-2"
                                onClick={() => handleDefense(defense, null)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ background: `${defense.color}20` }}
                                    >
                                        <defense.Icon size="md" glow glowIntensity={8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold" style={{ color: defense.color }}>
                                            {defense.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate">
                                            HEAL: +{defense.heal}
                                        </div>
                                    </div>
                                </div>
                            </NeonCard>
                        ))}
                    </div>
                </NeonPanel>
            </div>
        </div>
    );
}
