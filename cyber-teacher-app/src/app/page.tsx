'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { useSimulationStore } from '@/store/simulation-store';

export default function HomePage() {
  const [systemStatus, setSystemStatus] = useState<'initializing' | 'ready' | 'connecting'>('initializing');
  const [elapsedTime, setElapsedTime] = useState(0);
  const { loadLesson } = useSimulationStore();

  // Initialize timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Simulate initialization
    const timeout = setTimeout(() => {
      setSystemStatus('ready');
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `T+ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConnect = () => {
    setSystemStatus('connecting');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}>
      <Navigation />

      {/* Status Bar */}
      <div
        className="h-10 flex items-center justify-between px-4 md:px-6 border-b"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderColor: 'rgba(71, 85, 105, 0.3)'
        }}
      >
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${systemStatus === 'initializing' ? 'animate-pulse bg-yellow-400' :
              systemStatus === 'ready' ? 'bg-green-400' :
                'animate-pulse bg-cyan-400'
              }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {systemStatus === 'initializing' ? 'INITIALIZING' :
              systemStatus === 'ready' ? 'SYSTEM READY' :
                'CONNECTING...'}
          </span>
        </div>

        {/* Center: Timer */}
        <div className="text-xs font-mono text-slate-400">
          {formatTime(elapsedTime)}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-slate-500">THREAT</span>
          <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div className="h-full w-0 bg-red-500 transition-all duration-500" />
          </div>

          <Link
            href="/lessons"
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-all hidden sm:block"
            style={{
              background: 'rgba(34, 211, 238, 0.15)',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              color: '#22D3EE'
            }}
          >
            📚 Start Lesson 1
          </Link>

          <Link
            href="/lessons"
            className="px-3 py-1 rounded-lg text-xs font-semibold hidden sm:block"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#A78BFA'
            }}
          >
            🗺️ Campaign
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background Grid Effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
                        `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Radial Glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 60%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)'
          }}
        />

        {/* Computer Status Card */}
        <div
          className="relative mb-8 px-6 py-3 rounded-xl text-center"
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <h2 className="text-lg font-bold text-white">Your Computer</h2>
          <p className={`text-sm font-medium ${systemStatus === 'ready' ? 'text-green-400' : 'text-yellow-400'
            }`}>
            {systemStatus === 'initializing' ? 'INITIALIZING' :
              systemStatus === 'ready' ? 'NORMAL' :
                'CONNECTING'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
            <span>HP:<span className="text-green-400 ml-1">100%</span></span>
            <span>CPU:<span className="text-cyan-400 ml-1">17%</span></span>
          </div>
        </div>

        {/* Computer Illustration */}
        <div className="relative mb-8">
          {/* Monitor */}
          <div
            className="w-48 h-32 md:w-64 md:h-44 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              border: '3px solid #334155',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.1)'
            }}
          >
            {/* Screen Content */}
            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-2">
                {systemStatus === 'connecting' ? '🌐' : '🛡️'}
              </div>
              <p className="text-xs text-slate-400">
                {systemStatus === 'initializing' && 'Initializing NIC...'}
                {systemStatus === 'ready' && 'Network Ready'}
                {systemStatus === 'connecting' && 'Discovering Network...'}
              </p>
            </div>

            {/* Scan Line Effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(34, 211, 238, 0.05) 4px, rgba(34, 211, 238, 0.05) 5px)'
              }}
            />
          </div>

          {/* Monitor Stand */}
          <div className="w-16 h-8 mx-auto bg-slate-700 rounded-b-lg" />
          <div className="w-32 h-2 mx-auto bg-slate-600 rounded-full" />

          {/* Tower */}
          <div
            className="absolute -right-12 md:-right-16 top-4 w-10 h-24 md:w-12 md:h-32 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, #334155 0%, #1E293B 100%)',
              border: '2px solid #475569'
            }}
          >
            {/* Power LED */}
            <div
              className={`w-2 h-2 rounded-full mx-auto mt-3 ${systemStatus === 'ready' ? 'bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]' :
                systemStatus === 'connecting' ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]' :
                  'bg-yellow-400 animate-pulse'
                }`}
            />
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-8 relative z-10">
          <h1
            className={`text-2xl md:text-3xl font-bold mb-2 ${systemStatus === 'connecting' ? 'text-cyan-400' : 'text-green-400'
              }`}
          >
            {systemStatus === 'initializing' && 'INITIALIZING...'}
            {systemStatus === 'ready' && 'SYSTEM READY'}
            {systemStatus === 'connecting' && 'CONNECTING...'}
          </h1>
          <p className="text-slate-400 text-sm">
            {systemStatus === 'ready'
              ? 'Click below to begin your network journey'
              : 'Please wait while the system initializes'}
          </p>
        </div>

        {/* Connect Button */}
        {systemStatus === 'ready' && (
          <Link
            href="/simulation"
            onClick={handleConnect}
            className="relative group px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)',
              boxShadow: '0 10px 40px rgba(34, 211, 238, 0.4)'
            }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 50%, #A855F7 100%)',
                filter: 'blur(20px)',
                transform: 'scale(1.1)'
              }}
            />
            <span className="relative flex items-center gap-3">
              <span>🌐</span>
              CONNECT TO INTERNET
            </span>
          </Link>
        )}

        {systemStatus === 'connecting' && (
          <div className="flex items-center gap-3 text-cyan-400">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Establishing Connection...</span>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div
        className="h-12 flex items-center justify-center gap-8 border-t"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderColor: 'rgba(71, 85, 105, 0.3)'
        }}
      >
        <div className="text-center">
          <p className="text-xs text-slate-500">LESSONS</p>
          <p className="text-sm font-bold text-slate-300">7</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">ATTACKS</p>
          <p className="text-sm font-bold text-slate-300">8</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">DEFENSES</p>
          <p className="text-sm font-bold text-slate-300">6</p>
        </div>
      </div>
    </div>
  );
}
