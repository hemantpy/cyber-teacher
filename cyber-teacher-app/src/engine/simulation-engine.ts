// Simulation Engine - Main tick-based simulation loop
// Orchestrates all subsystems in a deterministic manner

import {
    WorldState,
    Packet,
    Node,
    Link,
    EventLog,
    createInitialWorldState,
    createDefaultNode,
    createDefaultLink,
    NodeType,
    PacketProtocol,
    AttackType,
    DefenseType
} from './world-state';
import { processPacketProtocol } from './protocol-engine';
import { processAttacks, startAttack } from './attack-engine';
import { processDefenses, activateDefense } from './defense-engine';
import { calculateMetrics, determineWorldPhase, updateNodeHealth, updateLinkLoads } from './metrics-engine';

function generateId(prefix: string, seed: number, counter: number): string {
    return `${prefix}-${seed}-${counter}`;
}

// ===== PACKET MOVEMENT =====
function movePackets(world: WorldState): WorldState {
    const arrivedPackets: Packet[] = [];
    const inFlightPackets: Packet[] = [];
    const logs: EventLog[] = [...world.logs];

    for (const packet of world.packets) {
        // Check TTL
        if (world.time - packet.createdAt > packet.ttl) {
            logs.push({
                id: generateId('log', world.seed, world.time),
                time: world.time,
                type: 'system',
                message: `Packet ${packet.protocol} expired (TTL)`,
                nodeIds: [packet.source]
            });
            continue; // Drop expired packet
        }

        // Check if packet has arrived at destination
        if (packet.currentHopIndex >= packet.path.length - 1) {
            arrivedPackets.push(packet);
        } else {
            // Advance packet by one hop
            const currentNode = packet.path[packet.currentHopIndex];
            const nextNode = packet.path[packet.currentHopIndex + 1];

            // Check if link exists and is not blocked
            let linkBlocked = false;
            for (const link of world.links.values()) {
                if ((link.from === currentNode && link.to === nextNode) ||
                    (link.to === currentNode && link.from === nextNode)) {
                    if (link.blocked) {
                        linkBlocked = true;
                    }
                    break;
                }
            }

            if (linkBlocked) {
                logs.push({
                    id: generateId('log', world.seed, world.time),
                    time: world.time,
                    type: 'system',
                    message: `Packet ${packet.protocol} dropped: link blocked`,
                    nodeIds: [currentNode, nextNode]
                });
                continue; // Drop packet
            }

            // Move packet forward
            inFlightPackets.push({
                ...packet,
                currentHopIndex: packet.currentHopIndex + 1
            });
        }
    }

    // Process arrived packets
    let newWorld: WorldState = {
        ...world,
        packets: inFlightPackets,
        logs
    };

    for (const packet of arrivedPackets) {
        // Update destination node's packet counter
        const destNode = newWorld.nodes.get(packet.destination);
        if (destNode) {
            const updatedNode: Node = {
                ...destNode,
                packetsReceivedThisTick: destNode.packetsReceivedThisTick + 1,
                status: destNode.status === 'idle' ? 'active' : destNode.status
            };
            const newNodes = new Map(newWorld.nodes);
            newNodes.set(packet.destination, updatedNode);
            newWorld = { ...newWorld, nodes: newNodes };
        }

        // Process protocol effects
        newWorld = processPacketProtocol(newWorld, packet);
    }

    return newWorld;
}

// ===== RESET TICK COUNTERS =====
function resetTickCounters(world: WorldState): WorldState {
    const newNodes = new Map(world.nodes);

    for (const [id, node] of newNodes) {
        if (node.packetsReceivedThisTick !== 0) {
            newNodes.set(id, { ...node, packetsReceivedThisTick: 0 });
        }
    }

    return { ...world, nodes: newNodes };
}

// ===== MAIN SIMULATION TICK =====
export function tick(world: WorldState): WorldState {
    // 1. Advance time
    let newWorld: WorldState = {
        ...world,
        time: world.time + 1
    };

    // 2. Reset per-tick counters
    newWorld = resetTickCounters(newWorld);

    // 3. Move packets (advances one hop per tick)
    newWorld = movePackets(newWorld);

    // 4. Process attacks (spawn attack packets, update attack phases)
    newWorld = processAttacks(newWorld);

    // 5. Process defenses (filter packets, update node security)
    newWorld = processDefenses(newWorld);

    // 6. Update node health
    newWorld = updateNodeHealth(newWorld);

    // 7. Update link loads
    newWorld = updateLinkLoads(newWorld);

    // 8. Calculate metrics
    const metrics = calculateMetrics(newWorld);
    newWorld = { ...newWorld, metrics };

    // 9. Determine world phase
    const phase = determineWorldPhase(newWorld);
    newWorld = { ...newWorld, phase };

    // 10. Trim old logs (keep last 100)
    if (newWorld.logs.length > 100) {
        newWorld = {
            ...newWorld,
            logs: newWorld.logs.slice(-100)
        };
    }

    return newWorld;
}

// ===== SIMULATION API =====
export class SimulationEngine {
    private world: WorldState;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private tickRate: number = 100; // ms per tick
    private listeners: Set<(world: WorldState) => void> = new Set();

    constructor(seed?: number) {
        this.world = createInitialWorldState(seed);
    }

    // ===== STATE ACCESS =====
    getWorld(): WorldState {
        return this.world;
    }

    // ===== NODE OPERATIONS =====
    addNode(id: string, type: NodeType, x: number, y: number, label?: string): void {
        const node = createDefaultNode(id, type, { x, y });
        node.label = label || id;
        node.mac = `AA:BB:CC:${id.slice(0, 2).toUpperCase()}:${id.slice(0, 2).toUpperCase()}:01`;

        const newNodes = new Map(this.world.nodes);
        newNodes.set(id, node);

        this.world = {
            ...this.world,
            nodes: newNodes,
            logs: [...this.world.logs, {
                id: generateId('log', this.world.seed, this.world.time),
                time: this.world.time,
                type: 'system',
                message: `Node added: ${label || id} (${type})`,
                nodeIds: [id]
            }]
        };

        this.notifyListeners();
    }

    removeNode(id: string): void {
        const newNodes = new Map(this.world.nodes);
        newNodes.delete(id);

        // Remove associated links
        const newLinks = new Map(this.world.links);
        for (const [linkId, link] of newLinks) {
            if (link.from === id || link.to === id) {
                newLinks.delete(linkId);
            }
        }

        this.world = {
            ...this.world,
            nodes: newNodes,
            links: newLinks
        };

        this.notifyListeners();
    }

    updateNodeStatus(id: string, status: Node['status']): void {
        const node = this.world.nodes.get(id);
        if (!node) return;

        const newNodes = new Map(this.world.nodes);
        newNodes.set(id, { ...node, status });

        this.world = { ...this.world, nodes: newNodes };
        this.notifyListeners();
    }

    // ===== LINK OPERATIONS =====
    addLink(from: string, to: string): void {
        const id = `${from}-${to}`;
        const link = createDefaultLink(id, from, to);

        const newLinks = new Map(this.world.links);
        newLinks.set(id, link);

        // Update node connections
        const newNodes = new Map(this.world.nodes);
        const fromNode = newNodes.get(from);
        const toNode = newNodes.get(to);

        if (fromNode) {
            newNodes.set(from, {
                ...fromNode,
                connections: [...fromNode.connections, to]
            });
        }
        if (toNode) {
            newNodes.set(to, {
                ...toNode,
                connections: [...toNode.connections, from]
            });
        }

        this.world = {
            ...this.world,
            nodes: newNodes,
            links: newLinks
        };

        this.notifyListeners();
    }

    removeLink(id: string): void {
        const newLinks = new Map(this.world.links);
        newLinks.delete(id);
        this.world = { ...this.world, links: newLinks };
        this.notifyListeners();
    }

    // ===== PACKET OPERATIONS =====
    spawnPacket(
        protocol: PacketProtocol,
        source: string,
        destination: string,
        payload: Record<string, unknown> = {}
    ): void {
        // Find path (simple: direct or through router)
        const path = this.findPath(source, destination);

        const packet: Packet = {
            id: generateId('pkt', this.world.seed, this.world.time),
            protocol,
            source,
            destination,
            path,
            currentHopIndex: 0,
            payload,
            malicious: protocol.startsWith('ATTACK'),
            encrypted: protocol.includes('TLS') || protocol.includes('HTTPS'),
            createdAt: this.world.time,
            ttl: 20
        };

        this.world = {
            ...this.world,
            packets: [...this.world.packets, packet],
            logs: [...this.world.logs, {
                id: generateId('log', this.world.seed, this.world.time),
                time: this.world.time,
                type: 'packet',
                message: `${protocol} packet: ${source} → ${destination}`,
                nodeIds: [source, destination]
            }]
        };

        this.notifyListeners();
    }

    private findPath(source: string, destination: string): string[] {
        // Simple pathfinding: if direct link exists, use it
        // Otherwise try to go through router

        const sourceNode = this.world.nodes.get(source);
        if (!sourceNode) return [source, destination];

        if (sourceNode.connections.includes(destination)) {
            return [source, destination];
        }

        // Find router in connections
        for (const connId of sourceNode.connections) {
            const connNode = this.world.nodes.get(connId);
            if (connNode && (connNode.type === 'router' || connNode.type === 'firewall')) {
                if (connNode.connections.includes(destination)) {
                    return [source, connId, destination];
                }
            }
        }

        // Fallback to direct path
        return [source, destination];
    }

    // ===== ATTACK OPERATIONS =====
    launchAttack(type: AttackType, fromNode: string, toNode: string, intensity: number = 5): void {
        this.world = startAttack(this.world, type, fromNode, toNode, intensity);
        this.notifyListeners();
    }

    // ===== DEFENSE OPERATIONS =====
    enableDefense(type: DefenseType, targetNode: string, config: Record<string, unknown> = {}): void {
        this.world = activateDefense(this.world, type, targetNode, config);
        this.notifyListeners();
    }

    // ===== SIMULATION CONTROL =====
    start(): void {
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            this.world = tick(this.world);
            this.notifyListeners();
        }, this.tickRate);
    }

    pause(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    step(): void {
        this.world = tick(this.world);
        this.notifyListeners();
    }

    reset(): void {
        this.pause();
        this.world = createInitialWorldState(Date.now());
        this.notifyListeners();
    }

    setTickRate(ms: number): void {
        this.tickRate = Math.max(16, Math.min(1000, ms));
        if (this.intervalId) {
            this.pause();
            this.start();
        }
    }

    isRunning(): boolean {
        return this.intervalId !== null;
    }

    // ===== LISTENERS =====
    subscribe(listener: (world: WorldState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        for (const listener of this.listeners) {
            listener(this.world);
        }
    }

    // ===== SNAPSHOT =====
    snapshot(): WorldState {
        return JSON.parse(JSON.stringify({
            ...this.world,
            nodes: Array.from(this.world.nodes.entries()),
            links: Array.from(this.world.links.entries())
        }));
    }

    restore(snapshot: WorldState): void {
        this.world = {
            ...snapshot,
            nodes: new Map(snapshot.nodes as unknown as [string, Node][]),
            links: new Map(snapshot.links as unknown as [string, Link][])
        };
        this.notifyListeners();
    }
}

// ===== SINGLETON INSTANCE =====
export const simulationEngine = new SimulationEngine();

// ===== RE-EXPORTS =====
export { startAttack } from './attack-engine';
export { activateDefense } from './defense-engine';
export * from './world-state';
