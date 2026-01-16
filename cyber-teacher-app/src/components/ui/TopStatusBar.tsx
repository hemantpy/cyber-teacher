'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSimulationStore } from '@/store/simulation-store';

export function TopStatusBar() {
    const {
        currentLesson,
        currentStepIndex,
        isPlaying,
        isPaused,
        networkHealth,
        threatLevel,
        elapsedTime,
        incrementElapsedTime
    } = useSimulationStore();

    const currentStep = currentLesson?.steps[currentStepIndex];
    const stepCount = currentLesson?.steps.length || 0;

    // Timer effect - increment elapsed time every second when playing
    useEffect(() => {
        if (!isPlaying || isPaused) return;

        const interval = setInterval(() => {
            incrementElapsedTime();
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, isPaused, incrementElapsedTime]);

    // Format elapsed time as T+ MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `T+ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Health color based on percentage
    const healthColor =
        networkHealth > 70 ? '#22C55E' :
            networkHealth > 40 ? '#F59E0B' : '#EF4444';

    // Threat color based on level
    const threatColor =
        threatLevel > 70 ? '#EF4444' :
            threatLevel > 40 ? '#F59E0B' : '#22C55E';

    // Status indicator
    const statusText = !isPlaying ? 'READY' : isPaused ? 'PAUSED' : 'ONLINE';
    const statusColor = !isPlaying ? '#64748B' : isPaused ? '#F59E0B' : '#22C55E';

    return (
        <header
            className="h-10 flex items-center justify-between px-3 md:px-4 border-b relative overflow-hidden"
            style={{
                background: 'rgba(13, 27, 42, 0.95)',
                borderColor: 'rgba(34, 211, 238, 0.2)'
            }}
        >
            {/* Left: Status Indicator */}
            <div className="flex items-center gap-3 md:gap-5">
                {/* Status */}
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${isPlaying && !isPaused ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: statusColor }}
                    />
                    <span
                        className="text-[10px] md:text-xs font-bold uppercase tracking-wider"
                        style={{ color: statusColor }}
                    >
                        {statusText}
                    </span>
                </div>

                {/* Timer */}
                <div
                    className="hidden sm:block text-xs font-mono px-2 py-0.5 rounded"
                    style={{
                        background: 'rgba(100, 116, 139, 0.2)',
                        color: '#94A3B8'
                    }}
                >
                    {formatTime(elapsedTime)}
                </div>

                {/* Stage Progress - when lesson loaded */}
                {currentLesson && (
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            STAGE {currentStepIndex + 1}/{stepCount}
                        </span>
                        <span
                            className="text-xs font-medium px-2 py-0.5 rounded"
                            style={{
                                background: 'rgba(34, 211, 238, 0.1)',
                                color: '#22D3EE'
                            }}
                        >
                            {currentStep?.ui.title || 'Loading...'}
                        </span>
                    </div>
                )}
            </div>

            {/* Center: Threat Meter */}
            <div className="flex items-center gap-3">
                <span className="hidden md:block text-[10px] text-slate-500 uppercase tracking-wider">
                    THREAT
                </span>
                <div
                    className="w-20 md:w-32 h-1.5 rounded-full overflow-hidden"
                    style={{
                        background: 'rgba(100, 116, 139, 0.2)',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${threatLevel}%`,
                            background: `linear-gradient(90deg, ${threatColor}60, ${threatColor})`
                        }}
                    />
                </div>

                {/* Health Indicator */}
                <span className="hidden md:block text-[10px] text-slate-500 uppercase tracking-wider ml-4">
                    HEALTH
                </span>
                <div
                    className="hidden md:block w-24 h-1.5 rounded-full overflow-hidden"
                    style={{
                        background: 'rgba(100, 116, 139, 0.2)',
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                    }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${networkHealth}%`,
                            background: `linear-gradient(90deg, ${healthColor}60, ${healthColor})`
                        }}
                    />
                </div>
                <span
                    className="hidden md:block text-[10px] font-bold font-mono"
                    style={{ color: healthColor }}
                >
                    {networkHealth}%
                </span>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
                {/* Start Lesson Button */}
                <Link
                    href="/lessons"
                    className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-semibold transition-all hover:scale-105"
                    style={{
                        background: 'rgba(34, 211, 238, 0.15)',
                        border: '1px solid rgba(34, 211, 238, 0.3)',
                        color: '#22D3EE'
                    }}
                >
                    <span className="hidden sm:inline"> </span>Start Lesson 1
                </Link>

                {/* Campaign Button */}
                <Link
                    href="/lessons"
                    className="hidden sm:block px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#A78BFA'
                    }}
                >
                    <span></span> Campaign
                </Link>
            </div>
        </header>
    );
}
