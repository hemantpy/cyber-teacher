// Attack Engine - Manages attack state machines
// Pure functions that process attacks and generate malicious packets

import {
    WorldState,
    ActiveAttack,
    AttackType,
    AttackPhase,
    Packet,
    Node,
    EventLog
} from './world-state';

function generateId(prefix: string, seed: number, counter: number): string {
    return `${prefix}-${seed}-${counter}`;
}

// ===== ATTACK FACTORIES =====
export function createAttack(
    id: string,
    type: AttackType,
    originNode: string,
    targetNode: string,
    intensity: number,
    startTick: number
): ActiveAttack {
    const durations: Record<AttackType, number> = {
        ddos: 100,
        sql_injection: 30,
        malware: 50,
        mitm: 80,
        phishing: 40,
        ransomware: 60
    };

    return {
        id,
        type,
        originNode,
        targetNode,
        intensity: Math.min(10, Math.max(1, intensity)),
        progress: 0,
        phase: 'preparing',
        packetsSpawned: 0,
        startedAt: startTick,
        duration: durations[type]
    };
}

// ===== DDOS ATTACK =====
function processDDoSAttack(world: WorldState, attack: ActiveAttack): WorldState {
    const targetNode = world.nodes.get(attack.targetNode);
    if (!targetNode) return world;

    const ticksElapsed = world.time - attack.startedAt;
    const newPackets: Packet[] = [...world.packets];
    const logs: EventLog[] = [...world.logs];
    let updatedAttack = { ...attack };

    // Phase transitions
    if (ticksElapsed < 5) {
        updatedAttack.phase = 'preparing';
    } else if (ticksElapsed < 10) {
        updatedAttack.phase = 'launching';
    } else if (ticksElapsed < attack.duration - 10) {
        updatedAttack.phase = 'active';
    } else if (ticksElapsed < attack.duration) {
        updatedAttack.phase = 'subsiding';
    } else {
        updatedAttack.phase = 'complete';
    }

    // Spawn attack packets during active phase
    if (updatedAttack.phase === 'active' || updatedAttack.phase === 'launching') {
        const packetsToSpawn = attack.intensity * 2;

        for (let i = 0; i < packetsToSpawn; i++) {
            const attackPacket: Packet = {
                id: generateId('ddos', world.seed, world.time * 100 + i),
                protocol: 'ATTACK_DDOS',
                source: attack.originNode,
                destination: attack.targetNode,
                path: [attack.originNode, attack.targetNode],
                currentHopIndex: 0,
                payload: { type: 'flood', size: 1500 },
                malicious: true,
                encrypted: false,
                createdAt: world.time,
                ttl: 5
            };
            newPackets.push(attackPacket);
            updatedAttack.packetsSpawned++;
        }

        // Log attack activity
        if (ticksElapsed % 10 === 0) {
            logs.push({
                id: generateId('log', world.seed, world.time),
                time: world.time,
                type: 'attack',
                message: `DDoS: ${packetsToSpawn} packets flooding ${targetNode.label}`,
                nodeIds: [attack.originNode, attack.targetNode]
            });
        }
    }

    // Update progress
    updatedAttack.progress = Math.min(100, (ticksElapsed / attack.duration) * 100);

    // Update target node health based on attack
    let updatedNode = targetNode;
    if (updatedAttack.phase === 'active') {
        const damage = attack.intensity * 0.5;
        updatedNode = {
            ...targetNode,
            health: Math.max(0, targetNode.health - damage),
            status: targetNode.health < 30 ? 'overloaded' : targetNode.status,
            packetsReceivedThisTick: targetNode.packetsReceivedThisTick + attack.intensity * 2
        };
    }

    const newNodes = new Map(world.nodes);
    newNodes.set(attack.targetNode, updatedNode);

    const newAttacks = world.attacks.map(a =>
        a.id === attack.id ? updatedAttack : a
    );

    return {
        ...world,
        nodes: newNodes,
        packets: newPackets,
        attacks: newAttacks,
        logs
    };
}

// ===== SQL INJECTION ATTACK =====
function processSQLInjectionAttack(world: WorldState, attack: ActiveAttack): WorldState {
    const targetNode = world.nodes.get(attack.targetNode);
    if (!targetNode) return world;

    const ticksElapsed = world.time - attack.startedAt;
    const logs: EventLog[] = [...world.logs];
    let updatedAttack = { ...attack };

    // Phase transitions
    if (ticksElapsed < 3) {
        updatedAttack.phase = 'preparing';
    } else if (ticksElapsed < 8) {
        updatedAttack.phase = 'launching';

        // Send SQL injection packet
        if (ticksElapsed === 5) {
            const sqlPacket: Packet = {
                id: generateId('sql', world.seed, world.time),
                protocol: 'ATTACK_SQL',
                source: attack.originNode,
                destination: attack.targetNode,
                path: [attack.originNode, attack.targetNode],
                currentHopIndex: 0,
                payload: {
                    query: "'; DROP TABLE users; --",
                    type: 'injection'
                },
                malicious: true,
                encrypted: false,
                createdAt: world.time,
                ttl: 10
            };

            // Check if WAF blocks it
            if (targetNode.security.wafEnabled) {
                updatedAttack.phase = 'blocked';
                logs.push({
                    id: generateId('log', world.seed, world.time),
                    time: world.time,
                    type: 'defense',
                    message: `WAF: Blocked SQL injection attempt on ${targetNode.label}`,
                    nodeIds: [attack.targetNode]
                });
            } else {
                return {
                    ...world,
                    packets: [...world.packets, sqlPacket],
                    attacks: world.attacks.map(a => a.id === attack.id ? updatedAttack : a),
                    logs
                };
            }
        }
    } else if (ticksElapsed < attack.duration) {
        if (updatedAttack.phase !== 'blocked') {
            updatedAttack.phase = 'active';
        }
    } else {
        updatedAttack.phase = 'complete';
    }

    // If attack succeeded, compromise the node
    let updatedNode = targetNode;
    if (updatedAttack.phase === 'active' && !targetNode.security.wafEnabled) {
        updatedNode = {
            ...targetNode,
            status: 'compromised',
            health: Math.max(0, targetNode.health - 20)
        };

        if (ticksElapsed === 10) {
            logs.push({
                id: generateId('log', world.seed, world.time),
                time: world.time,
                type: 'attack',
                message: `SQL Injection: ${targetNode.label} database compromised!`,
                nodeIds: [attack.targetNode]
            });
        }
    }

    updatedAttack.progress = Math.min(100, (ticksElapsed / attack.duration) * 100);

    const newNodes = new Map(world.nodes);
    newNodes.set(attack.targetNode, updatedNode);

    return {
        ...world,
        nodes: newNodes,
        attacks: world.attacks.map(a => a.id === attack.id ? updatedAttack : a),
        logs
    };
}

// ===== MALWARE ATTACK =====
function processMalwareAttack(world: WorldState, attack: ActiveAttack): WorldState {
    const targetNode = world.nodes.get(attack.targetNode);
    if (!targetNode) return world;

    const ticksElapsed = world.time - attack.startedAt;
    const logs: EventLog[] = [...world.logs];
    let updatedAttack = { ...attack };

    if (ticksElapsed < 5) {
        updatedAttack.phase = 'preparing';
    } else if (ticksElapsed < 15) {
        updatedAttack.phase = 'launching';

        // Send malware packet
        if (ticksElapsed === 8) {
            const malwarePacket: Packet = {
                id: generateId('malware', world.seed, world.time),
                protocol: 'ATTACK_MALWARE',
                source: attack.originNode,
                destination: attack.targetNode,
                path: [attack.originNode, attack.targetNode],
                currentHopIndex: 0,
                payload: { type: 'trojan', signature: 'XYZ123' },
                malicious: true,
                encrypted: true, // Often encrypted to evade detection
                createdAt: world.time,
                ttl: 10
            };

            // Check antivirus
            if (targetNode.security.antivirus) {
                updatedAttack.phase = 'blocked';
                logs.push({
                    id: generateId('log', world.seed, world.time),
                    time: world.time,
                    type: 'defense',
                    message: `Antivirus: Blocked malware on ${targetNode.label}`,
                    nodeIds: [attack.targetNode]
                });
            } else {
                return {
                    ...world,
                    packets: [...world.packets, malwarePacket],
                    attacks: world.attacks.map(a => a.id === attack.id ? updatedAttack : a),
                    logs
                };
            }
        }
    } else if (ticksElapsed < attack.duration) {
        if (updatedAttack.phase !== 'blocked') {
            updatedAttack.phase = 'active';
        }
    } else {
        updatedAttack.phase = 'complete';
    }

    // If infected, node starts spawning packets silently
    let updatedNode = targetNode;
    const newPackets = [...world.packets];

    if (updatedAttack.phase === 'active' && !targetNode.security.antivirus) {
        updatedNode = {
            ...targetNode,
            status: 'infected'
        };

        // Infected node spawns C2 packets every 10 ticks
        if (ticksElapsed % 10 === 0 && ticksElapsed > 15) {
            const c2Packet: Packet = {
                id: generateId('c2', world.seed, world.time),
                protocol: 'TCP_DATA',
                source: attack.targetNode,
                destination: attack.originNode,
                path: [attack.targetNode, attack.originNode],
                currentHopIndex: 0,
                payload: { type: 'exfiltration' },
                malicious: true,
                encrypted: true,
                createdAt: world.time,
                ttl: 5
            };
            newPackets.push(c2Packet);
        }
    }

    updatedAttack.progress = Math.min(100, (ticksElapsed / attack.duration) * 100);

    const newNodes = new Map(world.nodes);
    newNodes.set(attack.targetNode, updatedNode);

    return {
        ...world,
        nodes: newNodes,
        packets: newPackets,
        attacks: world.attacks.map(a => a.id === attack.id ? updatedAttack : a),
        logs
    };
}

// ===== MITM ATTACK =====
function processMITMAttack(world: WorldState, attack: ActiveAttack): WorldState {
    const ticksElapsed = world.time - attack.startedAt;
    const logs: EventLog[] = [...world.logs];
    let updatedAttack = { ...attack };

    if (ticksElapsed < 10) {
        updatedAttack.phase = 'preparing';

        if (ticksElapsed === 5) {
            logs.push({
                id: generateId('log', world.seed, world.time),
                time: world.time,
                type: 'attack',
                message: `MITM: Attacker poisoning ARP tables...`,
                nodeIds: [attack.originNode]
            });
        }
    } else if (ticksElapsed < attack.duration - 10) {
        updatedAttack.phase = 'active';

        // Intercept packets
        if (ticksElapsed % 15 === 0) {
            logs.push({
                id: generateId('log', world.seed, world.time),
                time: world.time,
                type: 'attack',
                message: `MITM: Intercepting traffic between nodes`,
                nodeIds: [attack.originNode, attack.targetNode]
            });
        }
    } else if (ticksElapsed < attack.duration) {
        updatedAttack.phase = 'subsiding';
    } else {
        updatedAttack.phase = 'complete';
    }

    updatedAttack.progress = Math.min(100, (ticksElapsed / attack.duration) * 100);

    return {
        ...world,
        attacks: world.attacks.map(a => a.id === attack.id ? updatedAttack : a),
        logs
    };
}

// ===== ATTACK PROCESSOR =====
export function processAttacks(world: WorldState): WorldState {
    let newWorld = world;

    for (const attack of world.attacks) {
        if (attack.phase === 'complete' || attack.phase === 'blocked') {
            continue;
        }

        switch (attack.type) {
            case 'ddos':
                newWorld = processDDoSAttack(newWorld, attack);
                break;
            case 'sql_injection':
                newWorld = processSQLInjectionAttack(newWorld, attack);
                break;
            case 'malware':
                newWorld = processMalwareAttack(newWorld, attack);
                break;
            case 'mitm':
                newWorld = processMITMAttack(newWorld, attack);
                break;
            default:
                // Handle other attack types similarly
                break;
        }
    }

    // Remove completed attacks after some time
    const cleanedAttacks = newWorld.attacks.filter(attack => {
        if (attack.phase === 'complete' || attack.phase === 'blocked') {
            return world.time - attack.startedAt < attack.duration + 20;
        }
        return true;
    });

    return {
        ...newWorld,
        attacks: cleanedAttacks
    };
}

// ===== START ATTACK =====
export function startAttack(
    world: WorldState,
    type: AttackType,
    originNode: string,
    targetNode: string,
    intensity: number = 5
): WorldState {
    const attack = createAttack(
        generateId('attack', world.seed, world.time),
        type,
        originNode,
        targetNode,
        intensity,
        world.time
    );

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'attack',
        message: `Attack started: ${type.toUpperCase()} targeting ${targetNode}`,
        nodeIds: [originNode, targetNode]
    };

    return {
        ...world,
        attacks: [...world.attacks, attack],
        logs: [...world.logs, log],
        phase: 'under_attack'
    };
}
