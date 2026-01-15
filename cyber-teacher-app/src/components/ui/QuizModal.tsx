'use client';

import { useState } from 'react';
import { Quiz, QuizQuestion } from '@/types/lessons';
import { useSound } from '@/hooks/use-sound';

interface QuizModalProps {
    quiz: Quiz;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (score: number) => void;
}

export function QuizModal({ quiz, isOpen, onClose, onComplete }: QuizModalProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const { playSuccess, playError } = useSound();

    if (!isOpen) return null;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        const isCorrect = index === currentQuestion.correctIndex;
        if (isCorrect) {
            setScore(prev => prev + 1);
            playSuccess();
        } else {
            playError();
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
            onComplete(score + (selectedOption === currentQuestion.correctIndex ? 1 : 0));
        }
    };

    if (showResults) {
        const percentage = Math.round((score / totalQuestions) * 100);
        let message = '';
        let emoji = '';

        if (percentage >= 80) {
            message = 'Outstanding! You\'re a Cyber Master!';
            emoji = '🏆';
        } else if (percentage >= 60) {
            message = 'Good job! Keep practicing.';
            emoji = '👍';
        } else {
            message = 'Review the lesson and try again.';
            emoji = '📚';
        }

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div
                    className="w-full max-w-md p-6 rounded-2xl border bg-slate-900 shadow-2xl transform transition-all"
                    style={{ borderColor: '#22D3EE40', boxShadow: '0 0 40px rgba(34, 211, 238, 0.1)' }}
                >
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">{emoji}</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
                        <p className="text-slate-400">{message}</p>
                    </div>

                    <div className="flex justify-center items-center gap-4 mb-8">
                        <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div className="text-3xl font-bold text-cyan-400">{score}/{totalQuestions}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Score</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div className="text-3xl font-bold text-purple-400">{percentage}%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Accuracy</div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: 'linear-gradient(to right, #22D3EE, #3B82F6)' }}
                    >
                        Continue Journey
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div
                className="w-full max-w-lg p-6 rounded-2xl border bg-slate-900 shadow-2xl"
                style={{ borderColor: '#22D3EE40' }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
                        <p className="text-xs text-slate-400">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                </div>

                {/* Question */}
                <div className="mb-6">
                    <p className="text-lg text-slate-200 font-medium leading-relaxed">
                        {currentQuestion.question}
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, idx) => {
                        let optionStyle = 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800';

                        if (isAnswered) {
                            if (idx === currentQuestion.correctIndex) {
                                optionStyle = 'bg-green-500/20 border-green-500 text-green-400';
                            } else if (idx === selectedOption) {
                                optionStyle = 'bg-red-500/20 border-red-500 text-red-400';
                            } else {
                                optionStyle = 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-50';
                            }
                        } else if (selectedOption === idx) {
                            optionStyle = 'bg-cyan-500/20 border-cyan-500 text-cyan-400';
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                disabled={isAnswered}
                                className={`w-full p-4 rounded-xl text-left border transition-all ${optionStyle}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs
                                        ${idx === currentQuestion.correctIndex && isAnswered ? 'bg-green-500 border-green-500 text-black' :
                                            idx === selectedOption && !isAnswered ? 'border-cyan-500 text-cyan-500' :
                                                idx === selectedOption && isAnswered ? 'border-red-500 text-red-500' :
                                                    'border-slate-600 text-slate-500'
                                        }
                                    `}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="flex-1">{option}</span>
                                    {isAnswered && idx === currentQuestion.correctIndex && <span>✅</span>}
                                    {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && <span>❌</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation & Next Button */}
                {isAnswered && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <h4 className="text-sm font-bold text-blue-400 mb-1">Explanation</h4>
                            <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full py-3 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'linear-gradient(to right, #22D3EE, #3B82F6)' }}
                        >
                            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
