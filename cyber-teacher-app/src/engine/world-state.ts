// Core World State Types - Pure Data Layer
// This is the single source of truth for the simulation

// ===== NODE TYPES =====
export type NodeType =
    | 'pc'
    | 'router'
    | 'dns'
    | 'firewall'
    | 'server'
    | 'isp'
    | 'attacker'
    | 'cloud';

export type NodeStatus =
    | 'offline'
    | 'booting'
    | 'idle'
    | 'active'
    | 'overloaded'
    | 'infected'
    | 'quarantined'
    | 'compromised';

export interface PortState {
    port: number;
    protocol: string;
    open: boolean;
    service?: string;
}

export interface SecurityConfig {
    firewallEnabled: boolean;
    wafEnabled: boolean;
    rateLimit: number; // packets per tick
    antivirus: boolean;
    allowedProtocols: string[];
    blockedIPs: string[];
}

export interface Node {
    id: string;
    type: NodeType;
    label: string;
    ip?: string;
    mac?: string;
    gateway?: string;
    dnsServer?: string;
    ports: PortState[];
    status: NodeStatus;
    health: number; // 0-100
    security: SecurityConfig;
    connections: string[]; // NodeIds
    position: { x: number; y: number };
    arpTable: Map<string, string>; // IP -> MAC
    dnsCache: Map<string, string>; // hostname -> IP
    packetsReceivedThisTick: number;
}

// ===== LINK TYPES =====
export interface Link {
    id: string;
    from: string; // NodeId
    to: string;   // NodeId
    bandwidth: number;
    currentLoad: number;
    latency: number; // ticks
    blocked: boolean;
    encrypted: boolean;
}

// ===== PACKET TYPES =====
export type PacketProtocol =
    | 'DHCP_DISCOVER'
    | 'DHCP_OFFER'
    | 'DHCP_REQUEST'
    | 'DHCP_ACK'
    | 'ARP_REQUEST'
    | 'ARP_REPLY'
    | 'DNS_QUERY'
    | 'DNS_RESPONSE'
    | 'TCP_SYN'
    | 'TCP_SYN_ACK'
    | 'TCP_ACK'
    | 'TCP_DATA'
    | 'TCP_FIN'
    | 'TLS_HANDSHAKE'
    | 'HTTP_REQUEST'
    | 'HTTP_RESPONSE'
    | 'HTTPS_REQUEST'
    | 'HTTPS_RESPONSE'
    | 'ICMP_PING'
    | 'ICMP_PONG'
    | 'ATTACK_DDOS'
    | 'ATTACK_SQL'
    | 'ATTACK_MALWARE'
    | 'ATTACK_MITM';

export interface Packet {
    id: string;
    protocol: PacketProtocol;
    source: string;      // NodeId
    destination: string; // NodeId
    path: string[];      // NodeIds
    currentHopIndex: number;
    payload: Record<string, unknown>;
    malicious: boolean;
    encrypted: boolean;
    createdAt: number;   // tick
    ttl: number;         // ticks until expiry
}

// ===== ATTACK TYPES =====
export type AttackType =
    | 'ddos'
    | 'sql_injection'
    | 'malware'
    | 'mitm'
    | 'phishing'
    | 'ransomware';

export type AttackPhase =
    | 'preparing'
    | 'launching'
    | 'active'
    | 'subsiding'
    | 'complete'
    | 'blocked';

export interface ActiveAttack {
    id: string;
    type: AttackType;
    originNode: string;
    targetNode: string;
    intensity: number;   // 1-10
    progress: number;    // 0-100
    phase: AttackPhase;
    packetsSpawned: number;
    startedAt: number;   // tick
    duration: number;    // ticks
}

// ===== DEFENSE TYPES =====
export type DefenseType =
    | 'firewall'
    | 'waf'
    | 'rate_limit'
    | 'block_ip'
    | 'dns_filter'
    | 'quarantine'
    | 'backup_restore';

export interface ActiveDefense {
    id: string;
    type: DefenseType;
    targetNode: string;
    config: Record<string, unknown>;
    activatedAt: number; // tick
    duration: number;    // ticks, -1 = permanent
    effectiveness: number; // 0-100
}

// ===== LESSON TYPES =====
export interface LessonCondition {
    type: 'node_status' | 'packet_arrived' | 'attack_started' | 'defense_active' | 'health_below' | 'time_elapsed';
    nodeId?: string;
    status?: NodeStatus;
    protocol?: PacketProtocol;
    threshold?: number;
    ticks?: number;
}

export interface LessonAction {
    type: 'spawn_node' | 'remove_node' | 'spawn_packet' | 'start_attack' | 'activate_defense' | 'update_node' | 'show_message';
    payload: Record<string, unknown>;
}

export interface LessonStep {
    id: string;
    name: string;
    trigger: LessonCondition;
    actions: LessonAction[];
    completionCondition: LessonCondition;
    uiHint?: {
        title: string;
        description: string;
        highlight?: string[];
    };
}

export interface LessonRuntimeState {
    lessonId: string;
    currentStepIndex: number;
    completedSteps: string[];
    paused: boolean;
    startedAt: number;
}

// ===== LOG TYPES =====
export type LogType = 'packet' | 'attack' | 'defense' | 'system' | 'protocol' | 'error';

export interface EventLog {
    id: string;
    time: number; // tick
    type: LogType;
    message: string;
    nodeIds: string[];
    metadata?: Record<string, unknown>;
}

// ===== WORLD STATE =====
export type WorldPhase =
    | 'boot'
    | 'connecting'
    | 'online'
    | 'under_attack'
    | 'defending'
    | 'compromised'
    | 'secured'
    | 'idle';

export interface WorldMetrics {
    networkHealth: number;    // 0-100
    threatLevel: number;      // 0-100
    packetRate: number;       // packets per tick
    compromisedNodes: number;
    activeConnections: number;
    packetsInFlight: number;
}

export interface WorldState {
    time: number; // current tick
    phase: WorldPhase;
    nodes: Map<string, Node>;
    links: Map<string, Link>;
    packets: Packet[];
    attacks: ActiveAttack[];
    defenses: ActiveDefense[];
    lesson: LessonRuntimeState | null;
    logs: EventLog[];
    metrics: WorldMetrics;
    seed: number; // for deterministic randomness
}

// ===== FACTORY FUNCTIONS =====
export function createDefaultNode(id: string, type: NodeType, position: { x: number; y: number }): Node {
    return {
        id,
        type,
        label: id,
        status: 'offline',
        health: 100,
        ports: [],
        security: {
            firewallEnabled: type === 'firewall',
            wafEnabled: false,
            rateLimit: 100,
            antivirus: false,
            allowedProtocols: [],
            blockedIPs: []
        },
        connections: [],
        position,
        arpTable: new Map(),
        dnsCache: new Map(),
        packetsReceivedThisTick: 0
    };
}

export function createDefaultLink(id: string, from: string, to: string): Link {
    return {
        id,
        from,
        to,
        bandwidth: 100,
        currentLoad: 0,
        latency: 1,
        blocked: false,
        encrypted: false
    };
}

export function createInitialWorldState(seed: number = Date.now()): WorldState {
    return {
        time: 0,
        phase: 'idle',
        nodes: new Map(),
        links: new Map(),
        packets: [],
        attacks: [],
        defenses: [],
        lesson: null,
        logs: [],
        metrics: {
            networkHealth: 100,
            threatLevel: 0,
            packetRate: 0,
            compromisedNodes: 0,
            activeConnections: 0,
            packetsInFlight: 0
        },
        seed
    };
}
