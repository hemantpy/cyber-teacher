'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { lessonsData, LessonCard } from '@/data/lessons-data';

function LessonCardComponent({ lesson }: { lesson: LessonCard }) {
    const difficultyColors = {
        beginner: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
        intermediate: { bg: 'rgba(251, 191, 36, 0.1)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
        advanced: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' }
    };

    const colors = difficultyColors[lesson.difficulty];

    return (
        <div
            className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
        >
            {/* Hover glow effect */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: 'linear-gradient(145deg, rgba(34, 211, 238, 0.05) 0%, transparent 50%)',
                    boxShadow: '0 0 30px rgba(34, 211, 238, 0.15)'
                }}
            />

            {/* Header: Lesson number & Duration */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60A5FA',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                >
                    Lesson {lesson.number}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                    <span></span>
                    {lesson.duration} min
                </span>
            </div>

            {/* Icon & Title */}
            <div className="mb-3 relative z-10">
                <div className="text-3xl mb-2">{lesson.icon}</div>
                <h3 className="text-xl font-bold text-white mb-1">{lesson.title}</h3>
                <p className="text-sm text-slate-400">{lesson.subtitle}</p>
            </div>

            {/* Difficulty Badge */}
            <div className="mb-4 relative z-10">
                <span
                    className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                    style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`
                    }}
                >
                    {lesson.difficulty}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-400 mb-5 leading-relaxed relative z-10 line-clamp-3">
                {lesson.description}
            </p>

            {/* Topics */}
            <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                {lesson.topics.slice(0, 3).map((topic) => (
                    <span
                        key={topic}
                        className="px-2 py-1 rounded text-[10px] text-slate-400"
                        style={{ background: 'rgba(71, 85, 105, 0.3)' }}
                    >
                        {topic}
                    </span>
                ))}
            </div>

            {/* Start Lesson Button */}
            <Link
                href={`/simulation?lesson=${lesson.id}`}
                className="block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all duration-300 relative z-10"
                style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
            >
                Start Lesson →
            </Link>
        </div>
    );
}

export default function LessonsPage() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            <Navigation />

            {/* Hero Section */}
            <div className="py-12 md:py-16 text-center px-4">
                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{
                        background: 'rgba(34, 211, 238, 0.1)',
                        border: '1px solid rgba(34, 211, 238, 0.3)'
                    }}
                >
                    <span className="text-cyan-400">◉</span>
                    <span className="text-sm font-medium text-cyan-400">INTERACTIVE LEARNING</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="text-white">Cybersecurity </span>
                    <span
                        style={{
                            background: 'linear-gradient(90deg, #3B82F6 0%, #22D3EE 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Lessons
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
                    Master cybersecurity concepts through immersive 2D simulations and hands-on exercises
                </p>
            </div>

            {/* Lessons Grid */}
            <div className="flex-1 px-4 md:px-8 lg:px-12 pb-12 overflow-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessonsData.map((lesson) => (
                        <LessonCardComponent key={lesson.id} lesson={lesson} />
                    ))}
                </div>

                {/* Coming Soon Hint */}
                <div className="text-center mt-12 py-8">
                    <p className="text-slate-500 text-sm">
                        More lessons coming soon • Stay tuned for advanced attack scenarios
                    </p>
                </div>
            </div>
        </div>
    );
}
