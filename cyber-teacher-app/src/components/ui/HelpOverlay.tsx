'use client';

import { KEYBOARD_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts';

interface HelpOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Help Content */}
            <div
                className="relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-2xl overflow-hidden flex flex-col"
                style={{
                    background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
                    border: '1px solid rgba(34, 211, 238, 0.3)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(34, 211, 238, 0.1)'
                }}
            >
                {/* Header */}
                <div
                    className="px-6 py-4 border-b flex items-center justify-between"
                    style={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
                >
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="text-2xl">❓</span>
                        Help & Guide
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-700"
                        style={{ color: '#64748B' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Quick Start */}
                    <section>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                            <span></span> Quick Start
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    step: '1',
                                    title: 'Choose a Lesson',
                                    description: 'Browse our 7 interactive cybersecurity lessons',
                                    icon: ''
                                },
                                {
                                    step: '2',
                                    title: 'Watch & Learn',
                                    description: 'See network protocols and attacks visualized',
                                    icon: '�'
                                },
                                {
                                    step: '3',
                                    title: 'Practice Defense',
                                    description: 'Use defense tools to protect your network',
                                    icon: ''
                                }
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: 'rgba(34, 211, 238, 0.05)',
                                        border: '1px solid rgba(34, 211, 238, 0.1)'
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{
                                                background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)',
                                                color: '#0F172A'
                                            }}
                                        >
                                            {item.step}
                                        </span>
                                        <span className="text-lg">{item.icon}</span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                                    <p className="text-xs text-slate-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Interface Overview */}
                    <section>
                        <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                            <span></span> Interface Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { area: 'Left Panel', description: 'Lesson timeline and AI explanations', color: '#22D3EE' },
                                { area: 'Center Canvas', description: 'Network visualization and animations', color: '#8B5CF6' },
                                { area: 'Right Panel', description: 'Attack/Defense tools and logs', color: '#EF4444' },
                                { area: 'Bottom Bar', description: 'Playback controls and progress', color: '#22C55E' },
                                { area: 'Top Status', description: 'Health, threat level, and timer', color: '#F59E0B' },
                                { area: 'Navigation', description: 'Pages: Lessons, Simulation, Campaign', color: '#3B82F6' },
                            ].map((item) => (
                                <div
                                    key={item.area}
                                    className="flex items-center gap-3 p-3 rounded-lg"
                                    style={{ background: 'rgba(30, 41, 59, 0.5)' }}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <div>
                                        <p className="text-xs font-semibold text-white">{item.area}</p>
                                        <p className="text-[10px] text-slate-400">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Keyboard Shortcuts */}
                    <section>
                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                            <span>⌨</span> Keyboard Shortcuts
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {KEYBOARD_SHORTCUTS.map((shortcut) => (
                                <div
                                    key={shortcut.key}
                                    className="flex items-center justify-between p-2 rounded-lg"
                                    style={{ background: 'rgba(30, 41, 59, 0.3)' }}
                                >
                                    <span className="text-xs text-slate-400">{shortcut.description}</span>
                                    <kbd
                                        className="px-2 py-1 rounded text-[10px] font-mono font-bold"
                                        style={{
                                            background: '#1E293B',
                                            color: '#94A3B8',
                                            border: '1px solid #334155'
                                        }}
                                    >
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Attack Types */}
                    <section>
                        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <span></span> Attack Types You'll Learn
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { name: 'DDoS', icon: '' },
                                { name: 'SQL Injection', icon: '' },
                                { name: 'Man-in-the-Middle', icon: '�' },
                                { name: 'Phishing', icon: '' },
                                { name: 'Malware', icon: '' },
                                { name: 'Trojan Horse', icon: '�' },
                                { name: 'Ransomware', icon: '' },
                                { name: 'Zero-Day', icon: '' },
                            ].map((attack) => (
                                <span
                                    key={attack.name}
                                    className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#FCA5A5'
                                    }}
                                >
                                    <span>{attack.icon}</span>
                                    {attack.name}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Tips */}
                    <section>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                            <span></span> Pro Tips
                        </h3>
                        <div className="space-y-2">
                            {[
                                'Use slow motion mode to understand packet flow better',
                                'Hover over timeline steps to highlight related nodes',
                                'Click on nodes in the canvas to inspect their details',
                                'Watch the packet trace logs to understand protocol exchanges',
                                'Try attacking and defending to see real-time effects',
                            ].map((tip, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-2 p-2 rounded-lg"
                                    style={{ background: 'rgba(250, 204, 21, 0.05)' }}
                                >
                                    <span className="text-yellow-400">•</span>
                                    <p className="text-xs text-slate-300">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 border-t flex items-center justify-between"
                    style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}
                >
                    <p className="text-xs text-slate-500">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 mx-1">H</kbd>
                        or <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 mx-1">?</kbd>
                        anytime to toggle this help
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)',
                            color: '#0F172A'
                        }}
                    >
                        Got it! �
                    </button>
                </div>
            </div>
        </div>
    );
}
