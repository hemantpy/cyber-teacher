'use client';

import { Navigation } from '@/components/layout/Navigation';

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            <Navigation />

            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {/* Hero Section */}
                <div className="max-w-3xl text-center">
                    {/* Logo */}
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
                        style={{
                            background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 50%, #8B5CF6 100%)',
                            boxShadow: '0 0 40px rgba(34, 211, 238, 0.4)'
                        }}
                    >
                        <span className="text-4xl"></span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        <span
                            style={{
                                background: 'linear-gradient(90deg, #22D3EE 0%, #3B82F6 50%, #8B5CF6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            CyberGuard
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-slate-300 mb-8">
                        Interactive Cybersecurity Education Platform
                    </p>

                    {/* Description */}
                    <div className="text-slate-400 space-y-4 text-left mb-12">
                        <p>
                            CyberGuard is an immersive 2D network simulation platform designed to teach cybersecurity
                            concepts through visual, hands-on experiences. Watch packets flow through networks,
                            experience cyber attacks in real-time, and learn defensive strategies.
                        </p>
                        <p>
                            Built for students, educators, and anyone curious about how the digital world protects itself
                            from threats.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div
                            className="p-6 rounded-xl"
                            style={{
                                background: 'rgba(30, 41, 59, 0.6)',
                                border: '1px solid rgba(71, 85, 105, 0.4)'
                            }}
                        >
                            <div className="text-3xl mb-3"></div>
                            <h3 className="text-lg font-semibold text-white mb-2">7 Lessons</h3>
                            <p className="text-sm text-slate-400">From boot sequences to advanced attack defense</p>
                        </div>

                        <div
                            className="p-6 rounded-xl"
                            style={{
                                background: 'rgba(30, 41, 59, 0.6)',
                                border: '1px solid rgba(71, 85, 105, 0.4)'
                            }}
                        >
                            <div className="text-3xl mb-3"></div>
                            <h3 className="text-lg font-semibold text-white mb-2">8 Attack Types</h3>
                            <p className="text-sm text-slate-400">DDoS, SQL Injection, Trojans, and more</p>
                        </div>

                        <div
                            className="p-6 rounded-xl"
                            style={{
                                background: 'rgba(30, 41, 59, 0.6)',
                                border: '1px solid rgba(71, 85, 105, 0.4)'
                            }}
                        >
                            <div className="text-3xl mb-3"></div>
                            <h3 className="text-lg font-semibold text-white mb-2">6 Defense Tools</h3>
                            <p className="text-sm text-slate-400">WAF, Rate Limiting, Quarantine, and more</p>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="text-center">
                        <p className="text-xs text-slate-500 mb-3">BUILT WITH</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['Next.js 16', 'React 19', 'TypeScript', 'Canvas 2D', 'Zustand'].map((tech) => (
                                <span
                                    key={tech}
                                    className="px-3 py-1 rounded-full text-xs text-slate-400"
                                    style={{ background: 'rgba(71, 85, 105, 0.3)' }}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pb-8 text-center">
                    <p className="text-sm text-slate-500">
                        Created by <span className="text-cyan-400">Hemant</span> • 2024
                    </p>
                </div>
            </div>
        </div>
    );
}
