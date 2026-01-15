'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SettingsPanel } from '@/components/ui/SettingsPanel';

const navItems = [
    { name: 'Lessons', href: '/lessons', icon: '📚' },
    { name: 'Simulation', href: '/simulation', icon: '🖥️' },
    { name: 'Sandbox', href: '/sandbox', icon: '⚔️' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
];

export function Navigation() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <nav
                className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b relative z-50"
                style={{
                    background: 'linear-gradient(180deg, #0D1B2A 0%, #0A1628 100%)',
                    borderColor: 'rgba(34, 211, 238, 0.2)'
                }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div
                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center relative transition-transform group-hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #22D3EE 0%, #3B82F6 50%, #8B5CF6 100%)',
                            boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)'
                        }}
                    >
                        <span className="text-lg md:text-xl">🛡️</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1
                            className="text-base md:text-lg font-black tracking-wider"
                            style={{
                                background: 'linear-gradient(90deg, #22D3EE 0%, #3B82F6 50%, #22D3EE 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            CyberGuard
                        </h1>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'text-cyan-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                                style={isActive ? {
                                    background: 'rgba(34, 211, 238, 0.1)',
                                    boxShadow: '0 0 10px rgba(34, 211, 238, 0.2)'
                                } : {}}
                            >
                                <span className="mr-1.5">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Side - Settings, Sign In & CTA */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Settings Button */}
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:bg-slate-700/50"
                        style={{ color: '#64748B' }}
                        title="Settings"
                    >
                        ⚙️
                    </button>

                    {/* Sign In - Desktop */}
                    <button className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
                        Sign In
                    </button>

                    {/* Start Defense CTA */}
                    <Link
                        href="/simulation"
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                        }}
                    >
                        <span className="hidden sm:inline">Start Defense</span>
                        <span className="sm:hidden">▶️</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div
                        className="absolute top-full left-0 right-0 md:hidden border-b"
                        style={{
                            background: '#0D1B2A',
                            borderColor: 'rgba(34, 211, 238, 0.2)'
                        }}
                    >
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-6 py-3 text-sm font-medium border-b transition-colors ${isActive
                                        ? 'text-cyan-400 bg-cyan-500/10'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                    style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}
                                >
                                    <span>{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                setSettingsOpen(true);
                            }}
                            className="w-full text-left px-6 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-3 border-b"
                            style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}
                        >
                            <span>⚙️</span>
                            Settings
                        </button>
                        <button
                            className="w-full text-left px-6 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50"
                        >
                            Sign In
                        </button>
                    </div>
                )}
            </nav>

            {/* Settings Modal */}
            <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
}
