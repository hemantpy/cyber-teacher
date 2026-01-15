// Engine Module - Deterministic Cybersecurity Simulation Engine
// 
// Architecture:
// - WorldState: Pure data layer (world-state.ts)
// - ProtocolEngine: DHCP, ARP, DNS, TCP simulation (protocol-engine.ts)
// - AttackEngine: Attack state machines (attack-engine.ts)
// - DefenseEngine: Defense mechanisms (defense-engine.ts)
// - MetricsEngine: Health/threat calculations (metrics-engine.ts)
// - SimulationEngine: Main tick loop (simulation-engine.ts)
// - LessonRuntime: Lesson step progression (lesson-runtime.ts)
//
// Core Principles:
// 1. State-based, not animation-based
// 2. Everything happens in discrete ticks
// 3. Rendering only observes state
// 4. No randomness unless explicitly injected
// 5. Every event is reproducible

// Main Engine
export {
    SimulationEngine,
    simulationEngine,
    tick
} from './simulation-engine';

// World State Types
export type {
    WorldState,
    WorldPhase,
    WorldMetrics,
    Node,
    NodeType,
    NodeStatus,
    Link,
    Packet,
    PacketProtocol,
    ActiveAttack,
    AttackType,
    AttackPhase,
    ActiveDefense,
    DefenseType,
    EventLog,
    LogType,
    LessonStep,
    LessonCondition,
    LessonAction,
    LessonRuntimeState,
    PortState,
    SecurityConfig
} from './world-state';

// Factory Functions
export {
    createInitialWorldState,
    createDefaultNode,
    createDefaultLink
} from './world-state';

// Attack Engine
export {
    createAttack,
    processAttacks,
    startAttack
} from './attack-engine';

// Defense Engine
export {
    createDefense,
    processDefenses,
    activateDefense
} from './defense-engine';

// Protocol Engine
export {
    processPacketProtocol
} from './protocol-engine';

// Metrics Engine
export {
    calculateMetrics,
    determineWorldPhase,
    updateNodeHealth,
    updateLinkLoads
} from './metrics-engine';

// Lesson Runtime
export {
    evaluateCondition,
    executeAction,
    processLessonStep,
    initializeLesson,
    pauseLesson,
    resumeLesson,
    resetLesson
} from './lesson-runtime';

// Legacy LessonEngine (kept for backwards compatibility)
export { LessonEngine, lessonEngine } from './LessonEngine';
