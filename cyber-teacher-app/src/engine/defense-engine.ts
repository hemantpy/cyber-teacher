// Defense Engine - Manages defense mechanisms
// Pure functions that process defenses and mitigate attacks

import {
    WorldState,
    ActiveDefense,
    DefenseType,
    Node,
    Packet,
    EventLog
} from './world-state';

function generateId(prefix: string, seed: number, counter: number): string {
    return `${prefix}-${seed}-${counter}`;
}

// ===== DEFENSE FACTORIES =====
export function createDefense(
    id: string,
    type: DefenseType,
    targetNode: string,
    config: Record<string, unknown>,
    startTick: number,
    duration: number = -1 // -1 = permanent
): ActiveDefense {
    const effectiveness: Record<DefenseType, number> = {
        firewall: 80,
        waf: 90,
        rate_limit: 70,
        block_ip: 95,
        dns_filter: 75,
        quarantine: 100,
        backup_restore: 100
    };

    return {
        id,
        type,
        targetNode,
        config,
        activatedAt: startTick,
        duration,
        effectiveness: effectiveness[type]
    };
}

// ===== FIREWALL DEFENSE =====
export function applyFirewall(world: WorldState, defense: ActiveDefense): WorldState {
    const targetNode = world.nodes.get(defense.targetNode);
    if (!targetNode) return world;

    // Update node security config
    const updatedNode: Node = {
        ...targetNode,
        security: {
            ...targetNode.security,
            firewallEnabled: true
        }
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(defense.targetNode, updatedNode);

    // Filter out malicious packets targeting this node
    const blockedCount = world.packets.filter(
        p => p.destination === defense.targetNode && p.malicious
    ).length;

    const filteredPackets = world.packets.filter(
        p => !(p.destination === defense.targetNode && p.malicious && !p.encrypted)
    );

    const logs = [...world.logs];
    if (blockedCount > 0) {
        logs.push({
            id: generateId('log', world.seed, world.time),
            time: world.time,
            type: 'defense',
            message: `Firewall: Blocked ${blockedCount} malicious packets`,
            nodeIds: [defense.targetNode]
        });
    }

    return {
        ...world,
        nodes: newNodes,
        packets: filteredPackets,
        logs
    };
}

// ===== WAF (Web Application Firewall) =====
export function applyWAF(world: WorldState, defense: ActiveDefense): WorldState {
    const targetNode = world.nodes.get(defense.targetNode);
    if (!targetNode) return world;

    const updatedNode: Node = {
        ...targetNode,
        security: {
            ...targetNode.security,
            wafEnabled: true
        }
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(defense.targetNode, updatedNode);

    // Block SQL injection and similar application-layer attacks
    const blockedPackets = world.packets.filter(
        p => p.destination === defense.targetNode &&
            (p.protocol === 'ATTACK_SQL' ||
                (p.payload.type === 'injection'))
    );

    const filteredPackets = world.packets.filter(
        p => !(p.destination === defense.targetNode &&
            (p.protocol === 'ATTACK_SQL' ||
                (p.payload.type === 'injection')))
    );

    const logs = [...world.logs];
    if (blockedPackets.length > 0) {
        logs.push({
            id: generateId('log', world.seed, world.time),
            time: world.time,
            type: 'defense',
            message: `WAF: Blocked ${blockedPackets.length} injection attempts`,
            nodeIds: [defense.targetNode]
        });
    }

    return {
        ...world,
        nodes: newNodes,
        packets: filteredPackets,
        logs
    };
}

// ===== RATE LIMITING =====
export function applyRateLimit(world: WorldState, defense: ActiveDefense): WorldState {
    const targetNode = world.nodes.get(defense.targetNode);
    if (!targetNode) return world;

    const rateLimit = (defense.config.limit as number) || 10;

    // Count packets to this node
    const packetsToNode = world.packets.filter(p => p.destination === defense.targetNode);

    const logs = [...world.logs];
    let filteredPackets = world.packets;

    if (packetsToNode.length > rateLimit) {
        // Drop excess packets, prioritizing malicious ones
        const maliciousPackets = packetsToNode.filter(p => p.malicious);
        const legitimatePackets = packetsToNode.filter(p => !p.malicious);

        const packetsToKeep = [
            ...legitimatePackets.slice(0, rateLimit),
            ...maliciousPackets.slice(0, Math.max(0, rateLimit - legitimatePackets.length))
        ];

        const packetIdsToKeep = new Set(packetsToKeep.map(p => p.id));
        const droppedCount = packetsToNode.length - packetsToKeep.length;

        filteredPackets = world.packets.filter(
            p => p.destination !== defense.targetNode || packetIdsToKeep.has(p.id)
        );

        if (droppedCount > 0) {
            logs.push({
                id: generateId('log', world.seed, world.time),
                time: world.time,
                type: 'defense',
                message: `Rate Limit: Dropped ${droppedCount} excess packets`,
                nodeIds: [defense.targetNode]
            });
        }
    }

    const updatedNode: Node = {
        ...targetNode,
        security: {
            ...targetNode.security,
            rateLimit
        }
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(defense.targetNode, updatedNode);

    return {
        ...world,
        nodes: newNodes,
        packets: filteredPackets,
        logs
    };
}

// ===== IP BLOCKING =====
export function applyIPBlock(world: WorldState, defense: ActiveDefense): WorldState {
    const targetNode = world.nodes.get(defense.targetNode);
    if (!targetNode) return world;

    const blockedIP = defense.config.ip as string;
    const blockedNodeId = defense.config.nodeId as string;

    // Find node by IP or ID
    let sourceToBlock: string | undefined;
    if (blockedNodeId) {
        sourceToBlock = blockedNodeId;
    } else if (blockedIP) {
        for (const [id, node] of world.nodes) {
            if (node.ip === blockedIP) {
                sourceToBlock = id;
                break;
            }
        }
    }

    if (!sourceToBlock) return world;

    // Block all packets from this source
    const blockedCount = world.packets.filter(
        p => p.source === sourceToBlock && p.destination === defense.targetNode
    ).length;

    const filteredPackets = world.packets.filter(
        p => !(p.source === sourceToBlock && p.destination === defense.targetNode)
    );

    const logs = [...world.logs];
    if (blockedCount > 0) {
        logs.push({
            id: generateId('log', world.seed, world.time),
            time: world.time,
            type: 'defense',
            message: `IP Block: Blocked ${blockedCount} packets from ${blockedIP || sourceToBlock}`,
            nodeIds: [defense.targetNode, sourceToBlock]
        });
    }

    // Update blocked IPs list
    const updatedNode: Node = {
        ...targetNode,
        security: {
            ...targetNode.security,
            blockedIPs: [...targetNode.security.blockedIPs, blockedIP || sourceToBlock]
        }
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(defense.targetNode, updatedNode);

    return {
        ...world,
        nodes: newNodes,
        packets: filteredPackets,
        logs
    };
}

// ===== QUARANTINE =====
export function applyQuarantine(world: WorldState, defense: ActiveDefense): WorldState {
    const targetNode = world.nodes.get(defense.targetNode);
    if (!targetNode) return world;

    // Disconnect node from network
    const updatedNode: Node = {
        ...targetNode,
        status: 'quarantined',
        connections: []
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(defense.targetNode, updatedNode);

    // Block all links to/from this node
    const newLinks = new Map(world.links);
    for (const [id, link] of newLinks) {
        if (link.from === defense.targetNode || link.to === defense.targetNode) {
            newLinks.set(id, { ...link, blocked: true });
        }
    }

    // Remove all packets to/from this node
    const filteredPackets = world.packets.filter(
        p => p.source !== defense.targetNode && p.destination !== defense.targetNode
    );

    const logs: EventLog[] = [...world.logs, {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'defense',
        message: `Quarantine: ${targetNode.label} isolated from network`,
        nodeIds: [defense.targetNode]
    }];

    return {
        ...world,
        nodes: newNodes,
        links: newLinks,
        packets: filteredPackets,
        logs
    };
}

// ===== BACKUP RESTORE =====
export function applyBackupRestore(world: WorldState, defense: ActiveDefense): WorldState {
    const targetNode = world.nodes.get(defense.targetNode);
    if (!targetNode) return world;

    // Restore node to healthy state
    const updatedNode: Node = {
        ...targetNode,
        status: 'idle',
        health: 100,
        security: {
            ...targetNode.security,
            // Keep security settings but clear infection
        }
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(defense.targetNode, updatedNode);

    const logs: EventLog[] = [...world.logs, {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'defense',
        message: `Backup Restore: ${targetNode.label} restored to healthy state`,
        nodeIds: [defense.targetNode]
    }];

    return {
        ...world,
        nodes: newNodes,
        logs
    };
}

// ===== DEFENSE PROCESSOR =====
export function processDefenses(world: WorldState): WorldState {
    let newWorld = world;

    for (const defense of world.defenses) {
        // Check if defense has expired
        if (defense.duration > 0) {
            const elapsed = world.time - defense.activatedAt;
            if (elapsed > defense.duration) {
                continue; // Skip expired defenses
            }
        }

        switch (defense.type) {
            case 'firewall':
                newWorld = applyFirewall(newWorld, defense);
                break;
            case 'waf':
                newWorld = applyWAF(newWorld, defense);
                break;
            case 'rate_limit':
                newWorld = applyRateLimit(newWorld, defense);
                break;
            case 'block_ip':
                newWorld = applyIPBlock(newWorld, defense);
                break;
            case 'quarantine':
                newWorld = applyQuarantine(newWorld, defense);
                break;
            case 'backup_restore':
                newWorld = applyBackupRestore(newWorld, defense);
                break;
            default:
                break;
        }
    }

    // Remove expired defenses
    const activeDefenses = newWorld.defenses.filter(defense => {
        if (defense.duration === -1) return true; // Permanent
        return world.time - defense.activatedAt < defense.duration;
    });

    // Check if we're defending
    const hasActiveDefenses = activeDefenses.length > 0;
    const hasActiveAttacks = newWorld.attacks.some(a => a.phase === 'active');

    let phase = newWorld.phase;
    if (hasActiveAttacks && hasActiveDefenses) {
        phase = 'defending';
    } else if (!hasActiveAttacks && newWorld.phase === 'defending') {
        phase = 'secured';
    }

    return {
        ...newWorld,
        defenses: activeDefenses,
        phase
    };
}

// ===== ACTIVATE DEFENSE =====
export function activateDefense(
    world: WorldState,
    type: DefenseType,
    targetNode: string,
    config: Record<string, unknown> = {},
    duration: number = -1
): WorldState {
    const defense = createDefense(
        generateId('defense', world.seed, world.time),
        type,
        targetNode,
        config,
        world.time,
        duration
    );

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'defense',
        message: `Defense activated: ${type.replace('_', ' ').toUpperCase()} on ${targetNode}`,
        nodeIds: [targetNode]
    };

    return {
        ...world,
        defenses: [...world.defenses, defense],
        logs: [...world.logs, log]
    };
}
