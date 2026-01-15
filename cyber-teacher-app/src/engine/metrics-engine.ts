// Metrics Engine - Calculates network health, threat level, and other metrics
// Pure functions that observe world state

import { WorldState, WorldMetrics } from './world-state';

// ===== METRICS CALCULATION =====
export function calculateMetrics(world: WorldState): WorldMetrics {
    const nodes = Array.from(world.nodes.values());

    // Count node states
    const overloadedNodes = nodes.filter(n => n.status === 'overloaded').length;
    const infectedNodes = nodes.filter(n => n.status === 'infected').length;
    const compromisedNodes = nodes.filter(n => n.status === 'compromised').length;
    const quarantinedNodes = nodes.filter(n => n.status === 'quarantined').length;
    const activeNodes = nodes.filter(n =>
        n.status === 'active' || n.status === 'idle'
    ).length;

    // Calculate network health
    // Each overloaded node = -10, infected = -15, compromised = -20, quarantined = -5
    const totalNodes = nodes.length || 1;
    const healthPenalty =
        (overloadedNodes * 10) +
        (infectedNodes * 15) +
        (compromisedNodes * 20) +
        (quarantinedNodes * 5);

    const networkHealth = Math.max(0, Math.min(100, 100 - healthPenalty));

    // Calculate threat level based on active attacks
    const activeAttacks = world.attacks.filter(a =>
        a.phase === 'active' || a.phase === 'launching'
    );

    const attackThreat = activeAttacks.reduce((sum, attack) => {
        return sum + (attack.intensity * 5);
    }, 0);

    // Add threat from malicious packets
    const maliciousPackets = world.packets.filter(p => p.malicious).length;
    const packetThreat = Math.min(30, maliciousPackets * 2);

    const threatLevel = Math.min(100, attackThreat + packetThreat);

    // Calculate packet rate
    const packetRate = world.packets.length;

    // Count active connections
    const activeConnections = Array.from(world.links.values())
        .filter(l => !l.blocked).length;

    return {
        networkHealth,
        threatLevel,
        packetRate,
        compromisedNodes: compromisedNodes + infectedNodes,
        activeConnections,
        packetsInFlight: world.packets.length
    };
}

// ===== PHASE DETERMINATION =====
export function determineWorldPhase(world: WorldState): WorldState['phase'] {
    const metrics = world.metrics;
    const hasActiveAttacks = world.attacks.some(a =>
        a.phase === 'active' || a.phase === 'launching'
    );
    const hasActiveDefenses = world.defenses.length > 0;

    // Check for boot phase
    const allNodesBooting = Array.from(world.nodes.values())
        .every(n => n.status === 'offline' || n.status === 'booting');
    if (allNodesBooting && world.nodes.size > 0) {
        return 'boot';
    }

    // Check for connecting phase
    const nodesConnecting = Array.from(world.nodes.values())
        .some(n => !n.ip && n.status !== 'offline');
    if (nodesConnecting) {
        return 'connecting';
    }

    // Check for compromised state
    if (metrics.networkHealth < 30 || metrics.compromisedNodes > world.nodes.size / 2) {
        return 'compromised';
    }

    // Check for attack/defense states
    if (hasActiveAttacks && hasActiveDefenses) {
        return 'defending';
    }
    if (hasActiveAttacks) {
        return 'under_attack';
    }

    // Check for secured state (after successful defense)
    if (world.phase === 'defending' && !hasActiveAttacks) {
        return 'secured';
    }

    // Default online state
    if (world.nodes.size > 0) {
        return 'online';
    }

    return 'idle';
}

// ===== NODE HEALTH UPDATE =====
export function updateNodeHealth(world: WorldState): WorldState {
    const newNodes = new Map(world.nodes);

    for (const [id, node] of newNodes) {
        let healthChange = 0;

        // Natural recovery for non-compromised nodes
        if (node.status === 'idle' || node.status === 'active') {
            healthChange = 0.5; // Slow recovery
        }

        // Damage from overload
        if (node.status === 'overloaded') {
            healthChange = -1;
        }

        // Damage from infection
        if (node.status === 'infected') {
            healthChange = -0.5;
        }

        // Update health
        const newHealth = Math.max(0, Math.min(100, node.health + healthChange));

        // Status changes based on health
        let newStatus = node.status;
        if (newHealth <= 0 && node.status !== 'quarantined') {
            newStatus = 'compromised';
        } else if (newHealth > 50 && node.status === 'overloaded') {
            newStatus = 'active';
        }

        if (newHealth !== node.health || newStatus !== node.status) {
            newNodes.set(id, {
                ...node,
                health: newHealth,
                status: newStatus
            });
        }
    }

    return {
        ...world,
        nodes: newNodes
    };
}

// ===== LINK LOAD CALCULATION =====
export function updateLinkLoads(world: WorldState): WorldState {
    const newLinks = new Map(world.links);

    // Reset all link loads
    for (const [id, link] of newLinks) {
        newLinks.set(id, { ...link, currentLoad: 0 });
    }

    // Count packets on each link
    for (const packet of world.packets) {
        const currentNode = packet.path[packet.currentHopIndex];
        const nextNode = packet.path[packet.currentHopIndex + 1];

        if (currentNode && nextNode) {
            // Find the link
            for (const [id, link] of newLinks) {
                if ((link.from === currentNode && link.to === nextNode) ||
                    (link.to === currentNode && link.from === nextNode)) {
                    newLinks.set(id, { ...link, currentLoad: link.currentLoad + 1 });
                    break;
                }
            }
        }
    }

    return {
        ...world,
        links: newLinks
    };
}
