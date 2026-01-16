'use client';

import { useSimulationStore } from '@/store/simulation-store';
import { useState, useCallback } from 'react';

export function LeftPanel() {
    const {
        currentLesson,
        currentStepIndex,
        setCurrentStep,
        setHighlight,
        clearHighlight,
        isPlaying,
        playbackSpeed,
        setPlaybackSpeed
    } = useSimulationStore();

    const currentStep = currentLesson?.steps[currentStepIndex];
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);
    const [isSlowMotion, setIsSlowMotion] = useState(false);

    // Handle step hover - highlight involved nodes
    const handleStepHover = useCallback((stepIndex: number) => {
        setHoveredStep(stepIndex);
        const step = currentLesson?.steps[stepIndex];
        if (step) {
            // Highlight the first entity mentioned in this step
            const entityToHighlight = step.spawn?.[0]?.id ||
                step.updateEntities?.[0]?.id ||
                step.ui.highlight?.[0];
            if (entityToHighlight) {
                setHighlight(entityToHighlight);
            }
        }
    }, [currentLesson, setHighlight]);

    const handleStepLeave = useCallback(() => {
        setHoveredStep(null);
        clearHighlight();
    }, [clearHighlight]);

    // Allow replay of individual steps
    const handleStepClick = useCallback((stepIndex: number) => {
        if (stepIndex <= currentStepIndex) {
            setCurrentStep(stepIndex);
        }
    }, [currentStepIndex, setCurrentStep]);

    // Toggle slow motion mode
    const toggleSlowMotion = useCallback(() => {
        if (isSlowMotion) {
            setPlaybackSpeed(1);
            setIsSlowMotion(false);
        } else {
            setPlaybackSpeed(0.25);
            setIsSlowMotion(true);
        }
    }, [isSlowMotion, setPlaybackSpeed]);

    return (
        <aside
            className="w-64 flex flex-col border-r overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, #0D1B2A 0%, #0A1628 100%)',
                borderColor: '#22D3EE30'
            }}
        >
            {/* Lesson System Header */}
            <div
                className="px-4 py-3 border-b"
                style={{ borderColor: '#22D3EE20' }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400"></span>
                    <h2
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#22D3EE' }}
                    >
                        Lesson System
                    </h2>
                </div>
                {currentLesson && (
                    <div className="mt-2">
                        <p
                            className="text-[10px] uppercase tracking-wider mb-1"
                            style={{ color: '#64748B' }}
                        >
                            Current Lesson:
                        </p>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: '#E2E8F0' }}
                        >
                            {currentLesson.title}
                        </p>
                    </div>
                )}
            </div>

            {/* Slow Motion Toggle */}
            {currentLesson && (
                <div className="px-4 py-2 border-b flex items-center justify-between"
                    style={{ borderColor: '#22D3EE20' }}>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: '#64748B' }}>
                        Teaching Mode
                    </span>
                    <button
                        onClick={toggleSlowMotion}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${isSlowMotion ? 'ring-2 ring-purple-500' : ''
                            }`}
                        style={{
                            background: isSlowMotion ? '#8B5CF620' : '#1E293B',
                            color: isSlowMotion ? '#A78BFA' : '#64748B',
                            border: `1px solid ${isSlowMotion ? '#8B5CF6' : '#334155'}`
                        }}
                    >
                        � {isSlowMotion ? 'Slow Motion ON' : 'Slow Motion'}
                    </button>
                </div>
            )}

            {/* Step List - Timeline */}
            {currentLesson && (
                <div
                    className="flex-1 overflow-y-auto p-2"
                    style={{ maxHeight: '220px' }}
                >
                    <div className="text-[9px] uppercase tracking-wider mb-2 px-2"
                        style={{ color: '#64748B' }}>
                        Timeline ({currentStepIndex + 1}/{currentLesson.steps.length})
                    </div>
                    {currentLesson.steps.map((step, index) => {
                        const isActive = index === currentStepIndex;
                        const isCompleted = index < currentStepIndex;
                        const isHovered = index === hoveredStep;
                        const canReplay = index <= currentStepIndex;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-start gap-2 p-2 rounded-lg mb-1 transition-all cursor-pointer ${isActive ? 'bg-cyan-500/15' :
                                        isHovered && canReplay ? 'bg-slate-700/30' : ''
                                    }`}
                                style={{
                                    borderLeft: isActive
                                        ? '3px solid #22D3EE'
                                        : isHovered && canReplay
                                            ? '3px solid #64748B'
                                            : '3px solid transparent',
                                    opacity: isCompleted && !isActive ? 0.6 : 1,
                                    boxShadow: isActive ? '0 0 15px rgba(34, 211, 238, 0.15)' : 'none'
                                }}
                                onMouseEnter={() => handleStepHover(index)}
                                onMouseLeave={handleStepLeave}
                                onClick={() => handleStepClick(index)}
                            >
                                {/* Step indicator */}
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 transition-all"
                                    style={{
                                        background: isCompleted
                                            ? '#22C55E'
                                            : isActive
                                                ? '#22D3EE'
                                                : '#1E293B',
                                        color: isCompleted || isActive ? '#0F172A' : '#64748B',
                                        border: `1px solid ${isCompleted ? '#22C55E' :
                                                isActive ? '#22D3EE' :
                                                    '#475569'
                                            }`,
                                        boxShadow: isActive ? '0 0 10px rgba(34, 211, 238, 0.5)' : 'none'
                                    }}
                                >
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-xs font-medium truncate"
                                        style={{
                                            color: isActive ? '#22D3EE' : isCompleted ? '#22C55E' : '#94A3B8'
                                        }}
                                    >
                                        {step.name}
                                    </p>
                                    <p
                                        className="text-[10px] truncate"
                                        style={{ color: '#64748B' }}
                                    >
                                        {step.ui.subtitle}
                                    </p>
                                </div>
                                {/* Replay indicator */}
                                {isCompleted && isHovered && (
                                    <span className="text-[9px]" style={{ color: '#64748B' }}>
                                        ↩
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* AI Explanation */}
            <div
                className="flex-1 border-t overflow-y-auto"
                style={{ borderColor: '#22D3EE20' }}
            >
                <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                        <span>�</span>
                        <h3
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: '#8B5CF6' }}
                        >
                            AI Explanation
                        </h3>
                    </div>

                    {currentStep ? (
                        <div>
                            {/* Step Title */}
                            <h4
                                className="text-sm font-semibold mb-2"
                                style={{ color: '#E2E8F0' }}
                            >
                                {currentStep.ui.title}
                            </h4>

                            {/* Step Details */}
                            <ul className="space-y-1.5 mb-4">
                                {currentStep.ui.details?.map((detail, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs"
                                        style={{ color: '#94A3B8' }}
                                    >
                                        <span style={{ color: '#22D3EE' }}>•</span>
                                        <span>{detail}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* AI Insight */}
                            {currentStep.ui.aiExplanation && (
                                <div
                                    className="p-3 rounded-lg"
                                    style={{
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}
                                >
                                    <p className="text-xs font-medium mb-1" style={{ color: '#8B5CF6' }}>
                                         Did you know?
                                    </p>
                                    <p
                                        className="text-xs leading-relaxed"
                                        style={{ color: '#C4B5FD' }}
                                    >
                                        {currentStep.ui.aiExplanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className="text-center py-8"
                            style={{ color: '#64748B' }}
                        >
                            <p className="text-sm mb-2">No lesson loaded</p>
                            <p className="text-xs">Select a lesson to begin</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lesson Metadata */}
            {currentLesson && (
                <div
                    className="px-4 py-2 border-t flex items-center justify-between text-[10px]"
                    style={{
                        borderColor: '#22D3EE20',
                        color: '#64748B'
                    }}
                >
                    <span>{currentLesson.category}</span>
                    <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                            background: currentLesson.difficulty === 'beginner'
                                ? 'rgba(34, 197, 94, 0.2)'
                                : currentLesson.difficulty === 'intermediate'
                                    ? 'rgba(245, 158, 11, 0.2)'
                                    : 'rgba(239, 68, 68, 0.2)',
                            color: currentLesson.difficulty === 'beginner'
                                ? '#22C55E'
                                : currentLesson.difficulty === 'intermediate'
                                    ? '#F59E0B'
                                    : '#EF4444'
                        }}
                    >
                        {currentLesson.difficulty}
                    </span>
                </div>
            )}
        </aside>
    );
}
