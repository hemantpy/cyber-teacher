// Lesson type definitions for the 2D cybersecurity simulator

import { EntityType, Position, EntityStatus } from './entities';
import { ConnectionStyle } from './connections';
import { PacketProtocol } from './packets';

export interface LessonEntitySpawn {
    id: string;
    type: EntityType;
    position: Position;
    initialStatus?: EntityStatus;
    metadata?: {
        ip?: string;
        label?: string;
        hostname?: string;
    };
}

export interface LessonConnection {
    id: string;
    sourceId: string;
    targetId: string;
    style?: ConnectionStyle;
}

export interface LessonPacketWave {
    protocol: PacketProtocol;
    connectionId: string;
    count: number;
    interval?: number; // ms between packets
    direction?: 'forward' | 'reverse';
}

export interface LessonStepUI {
    title: string;
    subtitle?: string;
    details: string[];
    highlight?: string[]; // Entity IDs to highlight
    aiExplanation?: string;
}

export interface LessonStep {
    id: string;
    name: string;
    duration: number; // ms
    spawn?: LessonEntitySpawn[];
    removeEntities?: string[];
    connections?: LessonConnection[];
    removeConnections?: string[];
    updateEntities?: Array<{
        id: string;
        status?: EntityStatus;
        metadata?: Record<string, unknown>;
    }>;
    updateConnections?: Array<{
        id: string;
        style?: ConnectionStyle;
    }>;
    packets?: LessonPacketWave[];
    ui: LessonStepUI;
    onComplete?: 'auto' | 'click' | 'wait';
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface Quiz {
    id: string;
    title: string;
    questions: QuizQuestion[];
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    category: 'networking' | 'security' | 'attack' | 'defense';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // minutes
    steps: LessonStep[];
    initialEntities?: LessonEntitySpawn[];
    initialConnections?: LessonConnection[];
    quiz?: Quiz;
}

export interface LessonProgress {
    lessonId: string;
    currentStep: number;
    completed: boolean;
    startedAt: number;
    completedAt?: number;
}
