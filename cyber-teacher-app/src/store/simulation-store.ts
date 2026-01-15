// Main simulation state store using Zustand

import { create } from 'zustand';
import { NetworkEntity, EntityStatus } from '@/types/entities';
import { Connection, ConnectionStyle } from '@/types/connections';
import { Packet } from '@/types/packets';
import { Lesson, LessonStep } from '@/types/lessons';

export interface LogEntry {
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error' | 'success' | 'attack' | 'defense';
    message: string;
    entityId?: string;
    protocol?: string;
}

export interface ViewportState {
    offsetX: number;
    offsetY: number;
    isDragging: boolean;
}

interface SimulationState {
    // Core simulation data
    entities: Map<string, NetworkEntity>;
    connections: Map<string, Connection>;
    packets: Packet[];

    // Lesson state
    currentLesson: Lesson | null;
    currentStepIndex: number;
    isPlaying: boolean;
    isPaused: boolean;
    playbackSpeed: number;

    // Network state
    networkHealth: number;
    threatLevel: number; // 0-100 threat meter
    elapsedTime: number; // seconds since simulation started
    logs: LogEntry[];

    // Viewport state
    viewport: ViewportState;

    // Actions - Entities
    addEntity: (entity: NetworkEntity) => void;
    removeEntity: (id: string) => void;
    updateEntityStatus: (id: string, status: EntityStatus) => void;
    updateEntityPosition: (id: string, x: number, y: number) => void;
    clearEntities: () => void;

    // Actions - Connections
    addConnection: (connection: Connection) => void;
    removeConnection: (id: string) => void;
    updateConnectionStyle: (id: string, style: ConnectionStyle) => void;
    clearConnections: () => void;

    // Actions - Packets
    addPacket: (packet: Packet) => void;
    updatePacketProgress: (id: string, progress: number) => void;
    removePacket: (id: string) => void;
    clearPackets: () => void;

    // Actions - Lesson
    loadLesson: (lesson: Lesson) => void;
    setCurrentStep: (index: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    getCurrentStep: () => LessonStep | null;

    // Actions - Playback
    play: () => void;
    pause: () => void;
    reset: () => void;
    setPlaybackSpeed: (speed: number) => void;

    // Actions - Logs
    addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
    clearLogs: () => void;

    // Actions - Health
    setNetworkHealth: (health: number) => void;
    damageNetwork: (amount: number) => void;
    healNetwork: (amount: number) => void;

    // Actions - Threat & Time
    setThreatLevel: (level: number) => void;
    setElapsedTime: (time: number) => void;
    incrementElapsedTime: () => void;

    // Actions - Viewport
    setViewportOffset: (x: number, y: number) => void;
    setDragging: (isDragging: boolean) => void;

    // Actions - Highlighting (for log-to-canvas linking)
    highlightedEntityId: string | null;
    highlightedConnectionId: string | null;
    setHighlight: (entityId: string | null, connectionId?: string | null) => void;
    clearHighlight: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    // Initial state
    entities: new Map(),
    connections: new Map(),
    packets: [],
    currentLesson: null,
    currentStepIndex: 0,
    isPlaying: false,
    isPaused: false,
    playbackSpeed: 1,
    networkHealth: 100,
    threatLevel: 0,
    elapsedTime: 0,
    logs: [],
    viewport: {
        offsetX: 0,
        offsetY: 0,
        isDragging: false
    },

    // Entity actions
    addEntity: (entity) => set((state) => {
        const newEntities = new Map(state.entities);
        newEntities.set(entity.id, entity);
        return { entities: newEntities };
    }),

    removeEntity: (id) => set((state) => {
        const newEntities = new Map(state.entities);
        newEntities.delete(id);
        return { entities: newEntities };
    }),

    updateEntityStatus: (id, status) => set((state) => {
        const entity = state.entities.get(id);
        if (!entity) return state;
        const newEntities = new Map(state.entities);
        newEntities.set(id, { ...entity, status });
        return { entities: newEntities };
    }),

    updateEntityPosition: (id, x, y) => set((state) => {
        const entity = state.entities.get(id);
        if (!entity) return state;
        const newEntities = new Map(state.entities);
        newEntities.set(id, { ...entity, position: { x, y } });
        return { entities: newEntities };
    }),

    clearEntities: () => set({ entities: new Map() }),

    // Connection actions
    addConnection: (connection) => set((state) => {
        const newConnections = new Map(state.connections);
        newConnections.set(connection.id, connection);
        return { connections: newConnections };
    }),

    removeConnection: (id) => set((state) => {
        const newConnections = new Map(state.connections);
        newConnections.delete(id);
        return { connections: newConnections };
    }),

    updateConnectionStyle: (id, style) => set((state) => {
        const connection = state.connections.get(id);
        if (!connection) return state;
        const newConnections = new Map(state.connections);
        newConnections.set(id, { ...connection, style });
        return { connections: newConnections };
    }),

    clearConnections: () => set({ connections: new Map() }),

    // Packet actions
    addPacket: (packet) => set((state) => ({
        packets: [...state.packets, packet]
    })),

    updatePacketProgress: (id, progress) => set((state) => ({
        packets: state.packets.map(p =>
            p.id === id ? { ...p, progress } : p
        )
    })),

    removePacket: (id) => set((state) => ({
        packets: state.packets.filter(p => p.id !== id)
    })),

    clearPackets: () => set({ packets: [] }),

    // Lesson actions
    loadLesson: (lesson) => set({
        currentLesson: lesson,
        currentStepIndex: 0,
        isPlaying: false,
        isPaused: false
    }),

    setCurrentStep: (index) => set({ currentStepIndex: index }),

    nextStep: () => set((state) => {
        const lesson = state.currentLesson;
        if (!lesson) return state;
        const nextIndex = Math.min(state.currentStepIndex + 1, lesson.steps.length - 1);
        return { currentStepIndex: nextIndex };
    }),

    previousStep: () => set((state) => ({
        currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
    })),

    getCurrentStep: () => {
        const state = get();
        if (!state.currentLesson) return null;
        return state.currentLesson.steps[state.currentStepIndex] || null;
    },

    // Playback actions
    play: () => set({ isPlaying: true, isPaused: false }),
    pause: () => set({ isPaused: true }),
    reset: () => set({
        currentStepIndex: 0,
        isPlaying: false,
        isPaused: false,
        packets: [],
        networkHealth: 100,
        logs: []
    }),
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    // Log actions
    addLog: (entry) => set((state) => ({
        logs: [
            ...state.logs,
            {
                ...entry,
                id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now()
            }
        ].slice(-100) // Keep last 100 logs
    })),

    clearLogs: () => set({ logs: [] }),

    // Health actions
    setNetworkHealth: (health) => set({
        networkHealth: Math.max(0, Math.min(100, health))
    }),

    damageNetwork: (amount) => set((state) => ({
        networkHealth: Math.max(0, state.networkHealth - amount)
    })),

    healNetwork: (amount) => set((state) => ({
        networkHealth: Math.min(100, state.networkHealth + amount)
    })),

    // Threat & Time actions
    setThreatLevel: (level) => set({
        threatLevel: Math.max(0, Math.min(100, level))
    }),

    setElapsedTime: (time) => set({ elapsedTime: time }),

    incrementElapsedTime: () => set((state) => ({
        elapsedTime: state.elapsedTime + 1
    })),

    // Viewport actions
    setViewportOffset: (x, y) => set((state) => ({
        viewport: { ...state.viewport, offsetX: x, offsetY: y }
    })),

    setDragging: (isDragging) => set((state) => ({
        viewport: { ...state.viewport, isDragging }
    })),

    // Highlight actions (for log-to-canvas linking)
    highlightedEntityId: null,
    highlightedConnectionId: null,

    setHighlight: (entityId, connectionId = null) => set({
        highlightedEntityId: entityId,
        highlightedConnectionId: connectionId
    }),

    clearHighlight: () => set({
        highlightedEntityId: null,
        highlightedConnectionId: null
    })
}));
