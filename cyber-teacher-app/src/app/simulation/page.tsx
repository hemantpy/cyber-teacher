'use client';

import { useState, useCallback } from 'react';
import { SimulationCanvas } from '@/components/canvas/SimulationCanvas';
import { EntityTooltip } from '@/components/canvas/EntityTooltip';
import { TopStatusBar } from '@/components/ui/TopStatusBar';
import { LeftPanel } from '@/components/ui/LeftPanel';
import { RightPanel } from '@/components/ui/RightPanel';
import { BottomControls } from '@/components/ui/BottomControls';
import { SvgOverlay } from '@/components/svg/SvgOverlay';
import { Navigation } from '@/components/layout/Navigation';
import { HelpOverlay } from '@/components/ui/HelpOverlay';
import { QuizModal } from '@/components/ui/QuizModal';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useSimulationStore } from '@/store/simulation-store';

export default function SimulationPage() {
    const [activePanel, setActivePanel] = useState<'left' | 'canvas' | 'right'>('canvas');
    const [showHelp, setShowHelp] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);

    const { currentLesson } = useSimulationStore();

    // Toggle help
    const toggleHelp = useCallback(() => {
        setShowHelp(prev => !prev);
    }, []);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onToggleHelp: toggleHelp,
    });

    const handleQuizComplete = (score: number) => {
        // Here we could update user progress, unlock next chapter, etc.
        console.log('Quiz completed with score:', score);

        // Don't close immediately so user can see results
        // User closes manually via "Continue Journey" which calls onClose
    };

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
            {/* Main Navigation */}
            <Navigation />

            {/* Top Status Bar */}
            <TopStatusBar />

            {/* Mobile Tab Bar - Only visible on small screens */}
            <div className="md:hidden flex border-b" style={{ borderColor: '#22D3EE30', background: '#0D1B2A' }}>
                <button
                    onClick={() => setActivePanel('left')}
                    className={`flex-1 py-2 text-xs font-medium transition-all ${activePanel === 'left' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'
                        }`}
                >
                    📚 Lesson
                </button>
                <button
                    onClick={() => setActivePanel('canvas')}
                    className={`flex-1 py-2 text-xs font-medium transition-all ${activePanel === 'canvas' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'
                        }`}
                >
                    🖥️ Simulation
                </button>
                <button
                    onClick={() => setActivePanel('right')}
                    className={`flex-1 py-2 text-xs font-medium transition-all ${activePanel === 'right' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'
                        }`}
                >
                    ⚔️ Actions
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Hidden on mobile unless selected */}
                <div className={`
          ${activePanel === 'left' ? 'flex' : 'hidden'} 
          md:flex 
          w-full md:w-64 
          flex-shrink-0
        `}>
                    <LeftPanel />
                </div>

                {/* Center - Canvas - Hidden on mobile unless selected */}
                <div className={`
          ${activePanel === 'canvas' ? 'flex' : 'hidden'} 
          md:flex 
          flex-1 
          relative 
          overflow-hidden
        `} style={{ background: 'var(--bg-canvas)' }}>
                    <SimulationCanvas />
                    <SvgOverlay />
                    <EntityTooltip />

                    {/* Help Button - Floating */}
                    <button
                        onClick={toggleHelp}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
                        style={{
                            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                            border: '1px solid rgba(34, 211, 238, 0.4)',
                            boxShadow: '0 4px 15px rgba(34, 211, 238, 0.2)'
                        }}
                        title="Help (Press H)"
                    >
                        <span className="text-lg">❓</span>
                    </button>

                    {/* Mobile hint overlay */}
                    <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-sm border border-slate-700">
                        👆 Tap nodes for info • Drag to pan
                    </div>

                    {/* Keyboard hint - Desktop only */}
                    <div className="hidden md:block absolute bottom-4 right-4 text-[10px] text-slate-500">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 mx-0.5">H</kbd> for help
                        • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 mx-0.5">Space</kbd> play/pause
                    </div>
                </div>

                {/* Right Panel - Hidden on mobile unless selected */}
                <div className={`
          ${activePanel === 'right' ? 'flex' : 'hidden'} 
          md:flex 
          w-full md:w-72 
          flex-shrink-0
        `}>
                    <RightPanel onStartQuiz={() => setShowQuiz(true)} />
                </div>
            </div>

            {/* Bottom Controls */}
            <BottomControls />

            {/* Help Overlay */}
            <HelpOverlay isOpen={showHelp} onClose={() => setShowHelp(false)} />

            {/* Quiz Modal */}
            {currentLesson?.quiz && (
                <QuizModal
                    quiz={currentLesson.quiz}
                    isOpen={showQuiz}
                    onClose={() => setShowQuiz(false)}
                    onComplete={handleQuizComplete}
                />
            )}
        </div>
    );
}
