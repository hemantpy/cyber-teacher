'use client';

import { useState, useCallback } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { SimulationCanvas } from '@/components/canvas/SimulationCanvas';
import { SvgOverlay } from '@/components/svg/SvgOverlay';
import { useSimulationStore } from '@/store/simulation-store';
import { useSound } from '@/hooks/use-sound';

const ATTACK_TYPES = [
    { id: 'ddos', label: 'DDoS Flood', icon: '🌊', description: 'Overwhelm with traffic', damage: 15 },
    { id: 'sql', label: 'SQL Injection', icon: '💉', description: 'Database attack', damage: 20 },
    { id: 'mitm', label: 'Man-in-the-Middle', icon: '👁️', description: 'Intercept data', damage: 10 },
    { id: 'phishing', label: 'Phishing', icon: '🎣', description: 'Social engineering', damage: 12 },
    { id: 'malware', label: 'Malware', icon: '🦠', description: 'Deploy malware', damage: 25 },
    { id: 'ransomware', label: 'Ransomware', icon: '🔐', description: 'Encrypt files', damage: 30 },
];

const DEFENSE_TYPES = [
    { id: 'waf', label: 'Web Firewall', icon: '🛡️', color: '#22C55E', heal: 10 },
    { id: 'block', label: 'Block IP', icon: '🚫', color: '#EF4444', heal: 8 },
    { id: 'rate', label: 'Rate Limit', icon: '⏱️', color: '#F59E0B', heal: 12 },
    { id: 'dns', label: 'DNS Filter', icon: '🔍', color: '#3B82F6', heal: 15 },
    { id: 'quarantine', label: 'Quarantine', icon: '🔒', color: '#8B5CF6', heal: 20 },
    { id: 'backup', label: 'Restore Backup', icon: '💾', color: '#22D3EE', heal: 25 },
];

export default function SandboxPage() {
    const { networkHealth, damageNetwork, healNetwork, addLog, clearLogs, logs } = useSimulationStore();
    const { playAttack, playDefense, playSuccess, playError } = useSound();
    const [attackHistory, setAttackHistory] = useState<string[]>([]);
    const [defenseHistory, setDefenseHistory] = useState<string[]>([]);

    const handleAttack = useCallback((attack: typeof ATTACK_TYPES[0]) => {
        playAttack(attack.id as any);
        damageNetwork(attack.damage);
        addLog({ type: 'attack', message: `⚠️ ${attack.label} attack launched!`, protocol: 'ATTACK' });
        setAttackHistory(prev => [...prev.slice(-9), attack.id]);

        // Visual feedback
        document.body.style.transition = 'background 0.3s';
        document.body.style.background = 'rgba(239, 68, 68, 0.15)';
        setTimeout(() => { document.body.style.background = ''; }, 400);

        if (networkHealth - attack.damage <= 0) {
            playError();
            addLog({ type: 'error', message: '💀 NETWORK COMPROMISED!', protocol: 'CRITICAL' });
        }
    }, [playAttack, damageNetwork, addLog, networkHealth, playError]);

    const handleDefense = useCallback((defense: typeof DEFENSE_TYPES[0]) => {
        playDefense();
        healNetwork(defense.heal);
        addLog({ type: 'defense', message: `🛡️ ${defense.label} activated!`, protocol: 'DEFENSE' });
        setDefenseHistory(prev => [...prev.slice(-9), defense.id]);

        // Visual feedback
        document.body.style.transition = 'background 0.3s';
        document.body.style.background = 'rgba(34, 197, 94, 0.15)';
        setTimeout(() => { document.body.style.background = ''; }, 400);

        if (networkHealth + defense.heal >= 100) {
            playSuccess();
            addLog({ type: 'success', message: '✓ Network fully secured!', protocol: 'OK' });
        }
    }, [playDefense, healNetwork, addLog, networkHealth, playSuccess]);

    const resetNetwork = useCallback(() => {
        healNetwork(100);
        clearLogs();
        setAttackHistory([]);
        setDefenseHistory([]);
        addLog({ type: 'info', message: '🔄 Network reset to healthy state', protocol: 'SYSTEM' });
    }, [healNetwork, clearLogs, addLog]);

    const healthColor = networkHealth > 70 ? '#22C55E' : networkHealth > 40 ? '#F59E0B' : '#EF4444';

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            <Navigation />

            {/* Header */}
            <div className="py-6 px-4 text-center border-b" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                    <span>⚔️</span>
                    <span className="text-sm font-medium text-red-400">SANDBOX MODE</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Attack & Defense Lab</h1>
                <p className="text-sm text-slate-400">Experiment freely with attacks and defenses</p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Left - Attacks */}
                <div className="lg:w-64 p-4 border-b lg:border-b-0 lg:border-r" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <h2 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                        <span>⚔️</span> ATTACK ENGINE
                    </h2>
                    <div className="space-y-2">
                        {ATTACK_TYPES.map((attack) => (
                            <button
                                key={attack.id}
                                onClick={() => handleAttack(attack)}
                                className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{attack.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-red-400">{attack.label}</p>
                                        <p className="text-[10px] text-slate-500">{attack.description}</p>
                                    </div>
                                    <span className="text-[10px] text-red-500">-{attack.damage}%</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center - Canvas & Health */}
                <div className="flex-1 flex flex-col">
                    {/* Health Bar */}
                    <div className="p-4 border-b" style={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white">Network Health</span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold" style={{ color: healthColor }}>
                                    {Math.max(0, Math.min(100, networkHealth))}%
                                </span>
                                <button
                                    onClick={resetNetwork}
                                    className="text-xs px-2 py-1 rounded hover:bg-slate-700"
                                    style={{ background: '#1E293B', color: '#64748B' }}
                                >
                                    🔄 Reset
                                </button>
                            </div>
                        </div>
                        <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(30, 41, 59, 0.8)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${Math.max(0, Math.min(100, networkHealth))}%`,
                                    background: `linear-gradient(90deg, ${healthColor} 0%, ${healthColor}CC 100%)`,
                                    boxShadow: `0 0 20px ${healthColor}50`
                                }}
                            />
                        </div>
                        {networkHealth <= 0 && (
                            <p className="text-center text-red-400 text-sm mt-2 animate-pulse">
                                💀 NETWORK COMPROMISED - Click Reset to restore
                            </p>
                        )}
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 relative" style={{ background: 'var(--bg-canvas)', minHeight: '300px' }}>
                        <SimulationCanvas />
                        <SvgOverlay />
                    </div>

                    {/* Activity Log */}
                    <div className="h-32 border-t overflow-y-auto p-2" style={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400">📡 Activity Log</span>
                            <button onClick={clearLogs} className="text-[9px] text-slate-500 hover:text-white">Clear</button>
                        </div>
                        <div className="space-y-1">
                            {logs.slice(-10).map((log) => (
                                <div key={log.id} className="text-[10px] text-slate-400">
                                    {log.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right - Defenses */}
                <div className="lg:w-64 p-4 border-t lg:border-t-0 lg:border-l" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                    <h2 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                        <span>🛡️</span> DEFENSE ENGINE
                    </h2>
                    <div className="space-y-2">
                        {DEFENSE_TYPES.map((defense) => (
                            <button
                                key={defense.id}
                                onClick={() => handleDefense(defense)}
                                className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    background: `${defense.color}15`,
                                    border: `1px solid ${defense.color}50`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{defense.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium" style={{ color: defense.color }}>{defense.label}</p>
                                    </div>
                                    <span className="text-[10px]" style={{ color: defense.color }}>+{defense.heal}%</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
