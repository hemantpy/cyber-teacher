// Lesson Runtime Engine - Drives lesson progression based on world state
// Pure functions that evaluate conditions and trigger actions

import {
    WorldState,
    LessonStep,
    LessonCondition,
    LessonAction,
    LessonRuntimeState,
    EventLog,
    createDefaultNode,
    createDefaultLink,
    NodeType,
    PacketProtocol,
    Packet,
    AttackType,
    DefenseType
} from './world-state';
import { startAttack } from './attack-engine';
import { activateDefense } from './defense-engine';

function generateId(prefix: string, seed: number, counter: number): string {
    return `${prefix}-${seed}-${counter}`;
}

// ===== CONDITION EVALUATION =====
export function evaluateCondition(world: WorldState, condition: LessonCondition): boolean {
    switch (condition.type) {
        case 'node_status': {
            if (!condition.nodeId || !condition.status) return false;
            const node = world.nodes.get(condition.nodeId);
            return node?.status === condition.status;
        }

        case 'packet_arrived': {
            if (!condition.nodeId || !condition.protocol) return false;
            // Check logs for packet arrival
            return world.logs.some(log =>
                log.type === 'protocol' &&
                log.nodeIds.includes(condition.nodeId!) &&
                log.message.includes(condition.protocol!)
            );
        }

        case 'attack_started': {
            return world.attacks.some(a =>
                a.phase === 'active' || a.phase === 'launching'
            );
        }

        case 'defense_active': {
            if (!condition.nodeId) return world.defenses.length > 0;
            return world.defenses.some(d => d.targetNode === condition.nodeId);
        }

        case 'health_below': {
            const threshold = condition.threshold ?? 50;
            return world.metrics.networkHealth < threshold;
        }

        case 'time_elapsed': {
            const lesson = world.lesson;
            if (!lesson || !condition.ticks) return false;
            return world.time - lesson.startedAt >= condition.ticks;
        }

        default:
            return false;
    }
}

// ===== ACTION EXECUTION =====
export function executeAction(world: WorldState, action: LessonAction): WorldState {
    const payload = action.payload;

    switch (action.type) {
        case 'spawn_node': {
            const id = payload.id as string;
            const type = payload.type as NodeType;
            const x = payload.x as number;
            const y = payload.y as number;
            const label = payload.label as string;

            const node = createDefaultNode(id, type, { x, y });
            node.label = label || id;
            node.status = (payload.status as typeof node.status) || 'idle';
            if (payload.ip) node.ip = payload.ip as string;
            node.mac = `AA:BB:CC:${id.slice(0, 2).toUpperCase()}:DD:EE`;

            const newNodes = new Map(world.nodes);
            newNodes.set(id, node);

            return {
                ...world,
                nodes: newNodes,
                logs: [...world.logs, {
                    id: generateId('log', world.seed, world.time),
                    time: world.time,
                    type: 'system',
                    message: `Lesson: ${label || id} appeared`,
                    nodeIds: [id]
                }]
            };
        }

        case 'remove_node': {
            const id = payload.id as string;
            const newNodes = new Map(world.nodes);
            newNodes.delete(id);

            // Remove associated links
            const newLinks = new Map(world.links);
            for (const [linkId, link] of newLinks) {
                if (link.from === id || link.to === id) {
                    newLinks.delete(linkId);
                }
            }

            return {
                ...world,
                nodes: newNodes,
                links: newLinks
            };
        }

        case 'spawn_packet': {
            const protocol = payload.protocol as PacketProtocol;
            const source = payload.source as string;
            const destination = payload.destination as string;

            // Simple path
            const path = [source];
            const sourceNode = world.nodes.get(source);
            if (sourceNode) {
                for (const conn of sourceNode.connections) {
                    const connNode = world.nodes.get(conn);
                    if (connNode && (connNode.type === 'router' || connNode.type === 'firewall')) {
                        path.push(conn);
                        break;
                    }
                }
            }
            path.push(destination);

            const packet: Packet = {
                id: generateId('lesson-pkt', world.seed, world.time),
                protocol,
                source,
                destination,
                path,
                currentHopIndex: 0,
                payload: (payload.data as Record<string, unknown>) || {},
                malicious: protocol.startsWith('ATTACK'),
                encrypted: protocol.includes('TLS') || protocol.includes('HTTPS'),
                createdAt: world.time,
                ttl: 20
            };

            return {
                ...world,
                packets: [...world.packets, packet]
            };
        }

        case 'start_attack': {
            const attackType = payload.type as AttackType;
            const origin = payload.origin as string;
            const target = payload.target as string;
            const intensity = (payload.intensity as number) || 5;

            return startAttack(world, attackType, origin, target, intensity);
        }

        case 'activate_defense': {
            const defenseType = payload.type as DefenseType;
            const target = payload.target as string;
            const config = (payload.config as Record<string, unknown>) || {};

            return activateDefense(world, defenseType, target, config);
        }

        case 'update_node': {
            const id = payload.id as string;
            const node = world.nodes.get(id);
            if (!node) return world;

            const updatedNode = { ...node };
            if (payload.status) updatedNode.status = payload.status as typeof node.status;
            if (payload.health !== undefined) updatedNode.health = payload.health as number;
            if (payload.ip) updatedNode.ip = payload.ip as string;

            const newNodes = new Map(world.nodes);
            newNodes.set(id, updatedNode);

            return { ...world, nodes: newNodes };
        }

        case 'show_message': {
            const message = payload.message as string;

            return {
                ...world,
                logs: [...world.logs, {
                    id: generateId('log', world.seed, world.time),
                    time: world.time,
                    type: 'system',
                    message: `[Lesson] ${message}`,
                    nodeIds: []
                }]
            };
        }

        default:
            return world;
    }
}

// ===== LESSON STEP PROCESSOR =====
export function processLessonStep(world: WorldState, steps: LessonStep[]): WorldState {
    const lesson = world.lesson;
    if (!lesson || lesson.paused) return world;

    const currentStep = steps[lesson.currentStepIndex];
    if (!currentStep) return world;

    let newWorld = world;

    // Check if step trigger is met (for first time in step)
    const stepJustStarted = !lesson.completedSteps.includes(currentStep.id);
    if (stepJustStarted) {
        // Execute step actions
        for (const action of currentStep.actions) {
            newWorld = executeAction(newWorld, action);
        }

        // Mark as in-progress (but not completed)
    }

    // Check completion condition
    if (evaluateCondition(newWorld, currentStep.completionCondition)) {
        // Advance to next step
        const newLessonState: LessonRuntimeState = {
            ...lesson,
            currentStepIndex: lesson.currentStepIndex + 1,
            completedSteps: [...lesson.completedSteps, currentStep.id]
        };

        const log: EventLog = {
            id: generateId('log', newWorld.seed, newWorld.time),
            time: newWorld.time,
            type: 'system',
            message: `Lesson step completed: ${currentStep.name}`,
            nodeIds: []
        };

        return {
            ...newWorld,
            lesson: newLessonState,
            logs: [...newWorld.logs, log]
        };
    }

    return newWorld;
}

// ===== LESSON INITIALIZATION =====
export function initializeLesson(
    world: WorldState,
    lessonId: string,
    initialActions: LessonAction[] = []
): WorldState {
    // Clear existing state
    let newWorld: WorldState = {
        ...world,
        nodes: new Map(),
        links: new Map(),
        packets: [],
        attacks: [],
        defenses: [],
        logs: [],
        metrics: {
            networkHealth: 100,
            threatLevel: 0,
            packetRate: 0,
            compromisedNodes: 0,
            activeConnections: 0,
            packetsInFlight: 0
        },
        lesson: {
            lessonId,
            currentStepIndex: 0,
            completedSteps: [],
            paused: false,
            startedAt: world.time
        }
    };

    // Execute initial setup actions
    for (const action of initialActions) {
        newWorld = executeAction(newWorld, action);
    }

    return {
        ...newWorld,
        logs: [...newWorld.logs, {
            id: generateId('log', newWorld.seed, newWorld.time),
            time: newWorld.time,
            type: 'system',
            message: `Lesson started: ${lessonId}`,
            nodeIds: []
        }]
    };
}

// ===== LESSON CONTROL =====
export function pauseLesson(world: WorldState): WorldState {
    if (!world.lesson) return world;
    return {
        ...world,
        lesson: { ...world.lesson, paused: true }
    };
}

export function resumeLesson(world: WorldState): WorldState {
    if (!world.lesson) return world;
    return {
        ...world,
        lesson: { ...world.lesson, paused: false }
    };
}

export function resetLesson(world: WorldState): WorldState {
    if (!world.lesson) return world;
    return {
        ...world,
        lesson: {
            ...world.lesson,
            currentStepIndex: 0,
            completedSteps: [],
            startedAt: world.time
        }
    };
}
