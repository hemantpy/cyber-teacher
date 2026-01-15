'use client';

import { useSimulationStore } from '@/store/simulation-store';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

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

interface RightPanelProps {
    onStartQuiz?: () => void;
}

export function RightPanel({ onStartQuiz }: RightPanelProps) {
    const {
        logs,
        clearLogs,
        entities,
        currentLesson,
        currentStepIndex,
    } = useSimulationStore();

    const logsEndRef = useRef<HTMLDivElement>(null);
    const isLessonActive = currentLesson !== null;
    const currentStep = currentLesson?.steps[currentStepIndex];
    const isLastStep = currentLesson && currentStepIndex === currentLesson.steps.length - 1;
    const hasQuiz = !!currentLesson?.quiz;

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

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
            {/* No Lesson - Show Get Started */}
            {!isLessonActive ? (
                <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                    <div className="text-center mb-6">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                            style={{
                                background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)',
                                boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)'
                            }}
                        >
                            <span className="text-xl">🎯</span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Get Started</h3>
                        <p className="text-xs text-slate-400">Select a lesson to begin</p>
                    </div>

                    <div className="space-y-2">
                        <Link
                            href="/lessons"
                            className="block p-3 rounded-xl transition-all hover:scale-[1.02]"
                            style={{ background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.3)' }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📚</span>
                                <div>
                                    <h4 className="text-sm font-semibold text-cyan-400">Browse Lessons</h4>
                                    <p className="text-[10px] text-slate-400">7 interactive lessons</p>
                                </div>
                            </div>
                        </Link>
                        <Link
                            href="/campaign"
                            className="block p-3 rounded-xl transition-all hover:scale-[1.02]"
                            style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🗺️</span>
                                <div>
                                    <h4 className="text-sm font-semibold text-purple-400">Campaign Mode</h4>
                                    <p className="text-[10px] text-slate-400">Progress through chapters</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            ) : (
                /* LESSON MODE */
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* What's Happening */}
                    <div className="p-3 border-b" style={{ borderColor: '#22D3EE20' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span>📖</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                                What's Happening
                            </h3>
                        </div>
                        {currentStep && (
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-1">
                                    {currentStep.ui.title}
                                </h4>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {currentStep.ui.subtitle}
                                </p>
                            </div>
                        )}
                        {isLastStep && hasQuiz && (
                            <button
                                onClick={onStartQuiz}
                                className="w-full mt-3 py-2 rounded-lg text-xs font-bold text-white transition-all hover:scale-[1.02] animate-pulse"
                                style={{
                                    background: 'linear-gradient(to right, #22D3EE, #3B82F6)',
                                    boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)'
                                }}
                            >
                                📝 Take Quiz
                            </button>
                        )}
                    </div>

                    {/* Device Status */}
                    <div className="p-3 border-b" style={{ borderColor: '#22D3EE20' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span>🖥️</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                                Devices
                            </h3>
                        </div>
                        <div className="space-y-1.5">
                            {Array.from(entities.values()).slice(0, 5).map((entity) => (
                                <div
                                    key={entity.id}
                                    className="flex items-center gap-2 p-1.5 rounded"
                                    style={{ background: 'rgba(30, 41, 59, 0.5)' }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: entity.status === 'active' ? '#22C55E' :
                                                entity.status === 'connecting' ? '#F59E0B' :
                                                    entity.status === 'compromised' ? '#EF4444' : '#64748B'
                                        }}
                                    />
                                    <span className="text-[11px] text-slate-200 truncate flex-1">
                                        {entity.metadata?.label || entity.type}
                                    </span>
                                    <span className="text-[9px] text-slate-500 capitalize">
                                        {entity.status || 'idle'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Network Activity */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#22D3EE20' }}>
                            <div className="flex items-center gap-2">
                                <span>📡</span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Activity
                                </h3>
                                <span className="text-[9px] text-slate-500">{logs.length}</span>
                            </div>
                            <button
                                onClick={() => clearLogs()}
                                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-slate-700"
                                style={{ background: '#1E293B', color: '#64748B' }}
                            >
                                Clear
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {logs.length === 0 ? (
                                <div className="text-center py-4 text-[10px] text-slate-500">
                                    Waiting for activity...
                                </div>
                            ) : (
                                logs.slice(-15).map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-1 p-1 rounded"
                                        style={{
                                            background: '#0F172A80',
                                            borderLeft: `2px solid ${LOG_COLORS[log.type] || '#64748B'}`
                                        }}
                                    >
                                        <span className="text-[8px] text-slate-500 font-mono flex-shrink-0">
                                            {formatTime(log.timestamp).slice(3, 8)}
                                        </span>
                                        <span className="text-[10px] text-slate-300 flex-1">{log.message}</span>
                                        {log.protocol && (
                                            <span
                                                className="px-1 rounded text-[7px] font-bold flex-shrink-0"
                                                style={{ background: PROTOCOL_COLORS[log.protocol] || '#64748B', color: '#0F172A' }}
                                            >
                                                {log.protocol}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
