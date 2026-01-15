'use client';

import { useSimulationStore } from '@/store/simulation-store';
import { networkBootLesson } from '@/data/lessons/lesson-01-network-boot';
import { ddosAttackLesson } from '@/data/lessons/lesson-02-ddos-attack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PACKET_SPEEDS } from '@/types/packets';
import { LessonStep, Lesson } from '@/types/lessons';

// Available lessons
const LESSONS = [
    { id: 'lesson-01', name: 'Network Boot', lesson: networkBootLesson, icon: '🖥️' },
    { id: 'lesson-02', name: 'DDoS Attack', lesson: ddosAttackLesson, icon: '⚔️' }
];


export function BottomControls() {
    const {
        isPlaying,
        isPaused,
        playbackSpeed,
        currentLesson,
        currentStepIndex,
        play,
        pause,
        reset,
        nextStep,
        previousStep,
        setPlaybackSpeed,
        loadLesson,
        setCurrentStep,
        addLog,
        addEntity,
        addConnection,
        addPacket,
        updateEntityStatus,
        updateConnectionStyle,
        clearEntities,
        clearConnections,
        clearPackets,
        setNetworkHealth
    } = useSimulationStore();

    const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastExecutedStep = useRef<number>(-1);

    // Rebuild entire simulation state up to a given step
    const rebuildStateToStep = useCallback((targetStep: number, lesson = networkBootLesson) => {
        // Clear all state
        clearEntities();
        clearConnections();
        clearPackets();
        setNetworkHealth(100);

        // Spawn initial entities from lesson
        if (lesson.initialEntities) {
            lesson.initialEntities.forEach((spawn) => {
                addEntity({
                    id: spawn.id,
                    type: spawn.type,
                    position: spawn.position,
                    status: spawn.initialStatus || 'idle',
                    metadata: spawn.metadata || {}
                });
            });
        }

        // Create initial connections
        if (lesson.initialConnections) {
            lesson.initialConnections.forEach((conn) => {
                addConnection({
                    id: conn.id,
                    sourceId: conn.sourceId,
                    targetId: conn.targetId,
                    style: conn.style || 'solid',
                    status: 'idle'
                });
            });
        }

        // Execute all steps from 0 to targetStep (but don't spawn packets for past steps)
        for (let i = 0; i <= targetStep; i++) {
            const step = lesson.steps[i];
            if (!step) continue;

            // Spawn entities
            if (step.spawn) {
                step.spawn.forEach((spawn) => {
                    addEntity({
                        id: spawn.id,
                        type: spawn.type,
                        position: spawn.position,
                        status: spawn.initialStatus || 'idle',
                        metadata: spawn.metadata || {}
                    });
                });
            }

            // Create connections
            if (step.connections) {
                step.connections.forEach((conn) => {
                    addConnection({
                        id: conn.id,
                        sourceId: conn.sourceId,
                        targetId: conn.targetId,
                        style: conn.style || 'solid',
                        status: 'active'
                    });
                });
            }

            // Update entities
            if (step.updateEntities) {
                step.updateEntities.forEach((update) => {
                    if (update.status) {
                        updateEntityStatus(update.id, update.status);
                    }
                });
            }

            // Update connections
            if (step.updateConnections) {
                step.updateConnections.forEach((update) => {
                    if (update.style) {
                        updateConnectionStyle(update.id, update.style);
                    }
                });
            }
        }

        lastExecutedStep.current = targetStep;
    }, [addEntity, addConnection, clearEntities, clearConnections, clearPackets, setNetworkHealth, updateEntityStatus, updateConnectionStyle]);

    // Spawn packets for current step only
    const spawnPacketsForStep = useCallback((step: LessonStep) => {
        if (!step.packets) return;

        step.packets.forEach((packetWave) => {
            const baseInterval = packetWave.interval || 300;
            for (let i = 0; i < packetWave.count; i++) {
                setTimeout(() => {
                    addPacket({
                        id: `packet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        connectionId: packetWave.connectionId,
                        protocol: packetWave.protocol,
                        progress: 0,
                        speed: PACKET_SPEEDS[packetWave.protocol],
                        direction: packetWave.direction || 'forward'
                    });
                }, i * baseInterval);
            }
        });
    }, [addPacket]);

    // Selected lesson state
    const [selectedLessonId, setSelectedLessonId] = useState('lesson-01');

    // Initialize lesson with entities
    const initializeLessonById = useCallback((lessonId: string) => {
        const lessonData = LESSONS.find(l => l.id === lessonId);
        if (!lessonData) return;

        loadLesson(lessonData.lesson);
        rebuildStateToStep(0, lessonData.lesson);
        addLog({ type: 'info', message: `Loaded lesson: ${lessonData.lesson.title}` });
    }, [loadLesson, rebuildStateToStep, addLog]);

    // Handle step changes - rebuild state to current step
    useEffect(() => {
        if (!currentLesson) return;
        if (currentStepIndex === lastExecutedStep.current) return;

        // Rebuild state to current step
        rebuildStateToStep(currentStepIndex, currentLesson);

        // Log the step
        const currentStep = currentLesson.steps[currentStepIndex];
        if (currentStep) {
            addLog({ type: 'info', message: `Step: ${currentStep.ui.title}` });

            // Spawn packets for this step if playing
            if (isPlaying && !isPaused) {
                spawnPacketsForStep(currentStep);
            }
        }
    }, [currentStepIndex, currentLesson, isPlaying, isPaused, rebuildStateToStep, addLog, spawnPacketsForStep]);

    // Spawn packets when play starts
    useEffect(() => {
        if (!currentLesson || !isPlaying || isPaused) return;

        const currentStep = currentLesson.steps[currentStepIndex];
        if (currentStep) {
            spawnPacketsForStep(currentStep);
        }
    }, [isPlaying, isPaused]);

    // Auto-advance to next step based on duration
    useEffect(() => {
        if (!currentLesson || !isPlaying || isPaused) return;

        const currentStep = currentLesson.steps[currentStepIndex];
        if (!currentStep || currentStep.onComplete === 'click') return;

        stepTimeoutRef.current = setTimeout(() => {
            if (currentStepIndex < currentLesson.steps.length - 1) {
                nextStep();
            }
        }, currentStep.duration / playbackSpeed);

        return () => {
            if (stepTimeoutRef.current) {
                clearTimeout(stepTimeoutRef.current);
            }
        };
    }, [currentStepIndex, currentLesson, isPlaying, isPaused, playbackSpeed, nextStep]);

    const handleLoadLesson = () => {
        initializeLessonById(selectedLessonId);
    };

    const handlePlay = () => {
        if (!currentLesson) {
            initializeLessonById(selectedLessonId);
        }
        play();
        addLog({ type: 'info', message: 'Simulation started' });
    };

    const handlePause = () => {
        pause();
        addLog({ type: 'info', message: 'Simulation paused' });
    };

    const handleReset = () => {
        reset();
        lastExecutedStep.current = -1;
        clearEntities();
        clearConnections();
        clearPackets();
        addLog({ type: 'info', message: 'Simulation reset' });
    };

    const handleNextStep = () => {
        clearPackets(); // Clear old packets before advancing
        nextStep();
    };

    const handlePrevStep = () => {
        clearPackets(); // Clear old packets before going back
        previousStep();
    };

    const totalSteps = currentLesson?.steps.length || 0;
    const canGoBack = currentStepIndex > 0;
    const canGoForward = currentStepIndex < totalSteps - 1;

    return (
        <footer
            className="border-t flex flex-col"
            style={{
                background: 'linear-gradient(180deg, #0A1628 0%, #071220 100%)',
                borderColor: '#22D3EE30'
            }}
        >
            {/* Progress Bar - Shows lesson progression */}
            {currentLesson && (
                <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(34, 211, 238, 0.1)' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">BOOT</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500">CONNECTED</span>
                    </div>
                    <div className="relative">
                        {/* Background track */}
                        <div
                            className="h-1.5 rounded-full"
                            style={{ background: 'rgba(34, 211, 238, 0.1)' }}
                        />
                        {/* Progress fill */}
                        <div
                            className="absolute top-0 left-0 h-1.5 rounded-full transition-all duration-500"
                            style={{
                                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                                background: 'linear-gradient(90deg, #22D3EE 0%, #3B82F6 50%, #22C55E 100%)'
                            }}
                        />
                        {/* Step indicators */}
                        <div className="absolute top-0 left-0 w-full h-1.5 flex justify-between px-[2px]">
                            {currentLesson.steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx <= currentStepIndex ? 'bg-cyan-400' : 'bg-slate-600'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Controls Row */}
            <div className="h-14 md:h-16 flex items-center justify-between px-2 md:px-4">
                {/* Left: Lesson Selector */}
                <div className="flex items-center gap-1 md:gap-2">
                    {!currentLesson ? (
                        <>
                            <select
                                value={selectedLessonId}
                                onChange={(e) => setSelectedLessonId(e.target.value)}
                                className="px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm"
                                style={{
                                    background: '#1E293B',
                                    color: '#E2E8F0',
                                    border: '1px solid #22D3EE30'
                                }}
                            >
                                {LESSONS.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.icon} {l.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleLoadLesson}
                                className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all hover:opacity-80"
                                style={{
                                    background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)',
                                    color: '#0F172A'
                                }}
                            >
                                Start
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleReset}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                            style={{
                                background: '#EF444420',
                                color: '#EF4444',
                                border: '1px solid #EF444450'
                            }}
                        >
                            ✕ Reset
                        </button>
                    )}
                </div>

                {/* Center: Playback Controls */}
                <div className="flex items-center gap-1 md:gap-2">
                    {/* Step Back */}
                    <button
                        onClick={handlePrevStep}
                        disabled={!canGoBack}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                        style={{
                            background: '#1E293B',
                            color: '#E2E8F0',
                            border: '1px solid #334155'
                        }}
                    >
                        ⏮
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={isPlaying && !isPaused ? handlePause : handlePlay}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:opacity-90"
                        style={{
                            background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 100%)',
                            color: '#0F172A',
                            boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)'
                        }}
                    >
                        <span className="text-lg">{isPlaying && !isPaused ? '⏸' : '▶'}</span>
                    </button>

                    {/* Step Forward */}
                    <button
                        onClick={handleNextStep}
                        disabled={!canGoForward}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                        style={{
                            background: '#1E293B',
                            color: '#E2E8F0',
                            border: '1px solid #334155'
                        }}
                    >
                        ⏭
                    </button>

                    {/* Speed Control - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-2 ml-4 border-l pl-4" style={{ borderColor: '#334155' }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#64748B' }}>Speed</span>
                        <div className="flex gap-1">
                            {[0.5, 1, 2].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className="px-2 py-1 rounded text-xs font-mono transition-all"
                                    style={{
                                        background: playbackSpeed === speed ? '#22D3EE' : '#1E293B',
                                        color: playbackSpeed === speed ? '#0F172A' : '#94A3B8',
                                        border: `1px solid ${playbackSpeed === speed ? '#22D3EE' : '#334155'}`
                                    }}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Protocol Legend - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider mr-2" style={{ color: '#64748B' }}>Protocols:</span>
                    {[
                        { name: 'DHCP', color: '#FACC15' },
                        { name: 'ARP', color: '#22D3EE' },
                        { name: 'DNS', color: '#A855F7' },
                        { name: 'TCP', color: '#3B82F6' },
                        { name: 'HTTPS', color: '#22C55E' },
                        { name: 'ATTACK', color: '#EF4444' }
                    ].map((protocol) => (
                        <div
                            key={protocol.name}
                            className="px-2 py-1 rounded text-[10px] font-bold tracking-wide"
                            style={{
                                background: `${protocol.color}20`,
                                color: protocol.color,
                                border: `1px solid ${protocol.color}60`
                            }}
                        >
                            [{protocol.name}]
                        </div>
                    ))}
                </div>

                {/* Mobile: Simple step indicator */}
                <div className="flex lg:hidden items-center text-[10px] text-slate-400">
                    {currentStepIndex + 1}/{totalSteps || '-'}
                </div>
            </div>
        </footer>
    );
}

