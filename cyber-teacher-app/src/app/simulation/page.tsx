'use client';

import { useState } from 'react';
import { SimulationCanvas } from '@/components/canvas/SimulationCanvas';
import { EntityTooltip } from '@/components/canvas/EntityTooltip';
import { TopStatusBar } from '@/components/ui/TopStatusBar';
import { LeftPanel } from '@/components/ui/LeftPanel';
import { RightPanel } from '@/components/ui/RightPanel';
import { BottomControls } from '@/components/ui/BottomControls';
import { SvgOverlay } from '@/components/svg/SvgOverlay';
import { Navigation } from '@/components/layout/Navigation';

export default function SimulationPage() {
    const [activePanel, setActivePanel] = useState<'left' | 'canvas' | 'right'>('canvas');

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

                    {/* Mobile hint overlay */}
                    <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-sm border border-slate-700">
                        👆 Tap nodes for info • Drag to pan
                    </div>
                </div>

                {/* Right Panel - Hidden on mobile unless selected */}
                <div className={`
          ${activePanel === 'right' ? 'flex' : 'hidden'} 
          md:flex 
          w-full md:w-72 
          flex-shrink-0
        `}>
                    <RightPanel />
                </div>
            </div>

            {/* Bottom Controls */}
            <BottomControls />
        </div>
    );
}
