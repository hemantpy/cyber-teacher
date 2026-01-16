'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { chaptersData, lessonsData } from '@/data/lessons-data';

export default function CampaignPage() {
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

    // Simulated completion state (in real app, this would come from user progress)
    const completedLessons = new Set(['lesson-01']); // Example: first lesson completed

    const isChapterUnlocked = (chapterId: number) => {
        const chapter = chaptersData.find(c => c.id === chapterId);
        if (!chapter) return false;
        if (!chapter.unlockCondition) return true;
        return completedLessons.has(chapter.unlockCondition);
    };

    const getChapterProgress = (chapterId: number) => {
        const chapter = chaptersData.find(c => c.id === chapterId);
        if (!chapter) return 0;
        const completed = chapter.lessons.filter(l => completedLessons.has(l)).length;
        return (completed / chapter.lessons.length) * 100;
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            <Navigation />

            {/* Hero Section */}
            <div className="py-8 md:py-12 text-center px-4">
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                    style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}
                >
                    <span className="text-purple-400"></span>
                    <span className="text-sm font-medium text-purple-400">CAMPAIGN MODE</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    <span className="text-white">Your </span>
                    <span
                        style={{
                            background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Journey
                    </span>
                </h1>

                <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
                    Progress through 6 chapters to become a cyber defender. Each chapter builds on the last.
                </p>
            </div>

            {/* Campaign Map */}
            <div className="flex-1 px-4 md:px-8 pb-12 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Chapter Path */}
                    <div className="relative">
                        {/* Connecting Line */}
                        <div
                            className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden md:block"
                            style={{
                                background: 'linear-gradient(180deg, #22D3EE 0%, #3B82F6 50%, #8B5CF6 100%)',
                                opacity: 0.3
                            }}
                        />

                        {chaptersData.map((chapter, index) => {
                            const unlocked = isChapterUnlocked(chapter.id);
                            const progress = getChapterProgress(chapter.id);
                            const isCompleted = progress === 100;
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={chapter.id}
                                    className={`relative flex items-center gap-6 mb-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Chapter Node */}
                                    <div
                                        className={`relative z-10 flex-shrink-0 mx-auto md:mx-0 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                                            }`}
                                        onClick={() => unlocked && setSelectedChapter(chapter.id)}
                                    >
                                        <div
                                            className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${unlocked
                                                ? 'hover:scale-110'
                                                : 'opacity-50'
                                                }`}
                                            style={{
                                                background: isCompleted
                                                    ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                                                    : unlocked
                                                        ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                                                        : '#334155',
                                                boxShadow: unlocked
                                                    ? `0 0 30px ${isCompleted ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                                                    : 'none'
                                            }}
                                        >
                                            <span className="text-2xl md:text-3xl mb-1">
                                                {isCompleted ? '✓' : unlocked ? chapter.id : ''}
                                            </span>
                                            {unlocked && !isCompleted && progress > 0 && (
                                                <div className="w-12 h-1 rounded-full bg-white/30 overflow-hidden">
                                                    <div
                                                        className="h-full bg-white rounded-full"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chapter Info Card */}
                                    <div
                                        className={`flex-1 p-4 md:p-5 rounded-xl transition-all ${selectedChapter === chapter.id ? 'ring-2 ring-cyan-400' : ''
                                            }`}
                                        style={{
                                            background: unlocked
                                                ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                                : 'rgba(30, 41, 59, 0.4)',
                                            border: '1px solid rgba(71, 85, 105, 0.3)'
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded"
                                                style={{
                                                    background: isCompleted
                                                        ? 'rgba(34, 197, 94, 0.2)'
                                                        : unlocked
                                                            ? 'rgba(59, 130, 246, 0.2)'
                                                            : 'rgba(100, 116, 139, 0.2)',
                                                    color: isCompleted
                                                        ? '#22C55E'
                                                        : unlocked
                                                            ? '#60A5FA'
                                                            : '#64748B'
                                                }}
                                            >
                                                Chapter {chapter.id}
                                            </span>
                                            {isCompleted && (
                                                <span className="text-green-400 text-xs">✓ Complete</span>
                                            )}
                                        </div>

                                        <h3 className={`text-lg font-bold mb-1 ${unlocked ? 'text-white' : 'text-slate-500'
                                            }`}>
                                            {chapter.title}
                                        </h3>
                                        <p className={`text-sm mb-3 ${unlocked ? 'text-slate-400' : 'text-slate-600'
                                            }`}>
                                            {chapter.theme}
                                        </p>

                                        {/* Lessons Preview */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {chapter.lessons.map((lessonId) => {
                                                const lesson = lessonsData.find(l => l.id === lessonId);
                                                const isLessonCompleted = completedLessons.has(lessonId);
                                                return (
                                                    <span
                                                        key={lessonId}
                                                        className="text-xs px-2 py-1 rounded"
                                                        style={{
                                                            background: isLessonCompleted
                                                                ? 'rgba(34, 197, 94, 0.2)'
                                                                : 'rgba(71, 85, 105, 0.3)',
                                                            color: isLessonCompleted
                                                                ? '#22C55E'
                                                                : '#94A3B8'
                                                        }}
                                                    >
                                                        {isLessonCompleted ? '✓ ' : ''}{lesson?.title || lessonId}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        {/* Action Button */}
                                        {unlocked && (
                                            <Link
                                                href={`/simulation?lesson=${chapter.lessons[0]}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                                style={{
                                                    background: isCompleted
                                                        ? 'rgba(34, 197, 94, 0.2)'
                                                        : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                                                    color: isCompleted ? '#22C55E' : 'white'
                                                }}
                                            >
                                                {isCompleted ? 'Replay' : 'Start Chapter'} →
                                            </Link>
                                        )}

                                        {!unlocked && (
                                            <p className="text-xs text-slate-500">
                                                 Complete previous chapter to unlock
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress Summary */}
                    <div
                        className="mt-8 p-6 rounded-xl text-center"
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                            border: '1px solid rgba(71, 85, 105, 0.3)'
                        }}
                    >
                        <h3 className="text-lg font-bold text-white mb-4">Your Progress</h3>
                        <div className="flex justify-center gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-cyan-400">
                                    {completedLessons.size}
                                </div>
                                <div className="text-xs text-slate-400">Lessons Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-400">
                                    {chaptersData.filter(c => getChapterProgress(c.id) === 100).length}
                                </div>
                                <div className="text-xs text-slate-400">Chapters Mastered</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">
                                    {Math.round((completedLessons.size / lessonsData.length) * 100)}%
                                </div>
                                <div className="text-xs text-slate-400">Total Progress</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
