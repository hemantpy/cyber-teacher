/**
 * Input Validation Schemas
 * Zod schemas for all simulation actions - strict validation
 */

// Simple validation without Zod dependency (can be replaced with Zod if added to project)

/**
 * Allowed attack types (enum)
 */
export const ATTACK_TYPES = [
    'DDOS',
    'SQL_INJECTION',
    'MALWARE',
    'MITM',
    'PHISHING',
    'BRUTEFORCE',
    'XSS',
    'RANSOMWARE'
] as const;

export type AttackType = typeof ATTACK_TYPES[number];

/**
 * Allowed defense types (enum)
 */
export const DEFENSE_TYPES = [
    'FIREWALL',
    'WAF',
    'RATE_LIMIT',
    'IP_BLOCK',
    'QUARANTINE',
    'BACKUP_RESTORE',
    'IDS',
    'ENCRYPTION'
] as const;

export type DefenseType = typeof DEFENSE_TYPES[number];

/**
 * Allowed simulation actions (enum)
 */
export const SIMULATION_ACTIONS = [
    // Attack actions
    'ATTACK_DDOS',
    'ATTACK_SQL_INJECTION',
    'ATTACK_MALWARE',
    'ATTACK_MITM',
    'ATTACK_PHISHING',
    'ATTACK_BRUTEFORCE',
    'ATTACK_XSS',
    'ATTACK_RANSOMWARE',

    // Defense actions
    'DEFENSE_FIREWALL',
    'DEFENSE_WAF',
    'DEFENSE_RATE_LIMIT',
    'DEFENSE_IP_BLOCK',
    'DEFENSE_QUARANTINE',
    'DEFENSE_BACKUP_RESTORE',
    'DEFENSE_IDS',
    'DEFENSE_ENCRYPTION',

    // Network actions
    'NODE_ADD',
    'NODE_REMOVE',
    'NODE_UPDATE',
    'LINK_ADD',
    'LINK_REMOVE',

    // Packet actions
    'PACKET_SPAWN',
    'PACKET_CLEAR',

    // Simulation control
    'SIM_START',
    'SIM_PAUSE',
    'SIM_RESET',
    'SIM_STEP'
] as const;

export type SimulationAction = typeof SIMULATION_ACTIONS[number];

/**
 * Allowed node types (enum)
 */
export const NODE_TYPES = [
    'PC',
    'Router',
    'Firewall',
    'ISP',
    'DNS',
    'Server',
    'Attacker',
    'Cloud'
] as const;

export type NodeType = typeof NODE_TYPES[number];

/**
 * Allowed protocol types (enum)
 */
export const PROTOCOL_TYPES = [
    'HTTP',
    'HTTPS',
    'DNS',
    'DHCP',
    'TCP',
    'UDP',
    'ICMP',
    'ARP',
    'FTP',
    'SSH',
    'SMTP',
    'MALICIOUS'
] as const;

export type ProtocolType = typeof PROTOCOL_TYPES[number];

/**
 * Simulation action payload interface
 */
export interface SimulationActionPayload {
    action: SimulationAction;
    target?: string;
    source?: string;
    intensity?: number;
    nodeType?: NodeType;
    protocol?: ProtocolType;
    position?: { x: number; y: number };
    config?: Record<string, unknown>;
}

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
    sanitized?: SimulationActionPayload;
}

/**
 * Validate simulation action payload
 * Strict validation - rejects unknown fields
 */
export function validateSimulationAction(payload: unknown): ValidationResult {
    // Must be an object
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { valid: false, error: 'Payload must be an object' };
    }

    const obj = payload as Record<string, unknown>;

    // Check for unknown fields (strict mode)
    const allowedFields = ['action', 'target', 'source', 'intensity', 'nodeType', 'protocol', 'position', 'config'];
    const unknownFields = Object.keys(obj).filter(key => !allowedFields.includes(key));

    if (unknownFields.length > 0) {
        return { valid: false, error: `Unknown fields not allowed: ${unknownFields.join(', ')}` };
    }

    // Validate action (required)
    if (!obj.action || typeof obj.action !== 'string') {
        return { valid: false, error: 'Action is required and must be a string' };
    }

    if (!SIMULATION_ACTIONS.includes(obj.action as SimulationAction)) {
        return { valid: false, error: `Invalid action. Allowed: ${SIMULATION_ACTIONS.join(', ')}` };
    }

    // Validate target (optional)
    if (obj.target !== undefined) {
        if (typeof obj.target !== 'string' || obj.target.length > 50) {
            return { valid: false, error: 'Target must be a string with max 50 characters' };
        }
        // Sanitize target - alphanumeric, underscore, hyphen only
        if (!/^[a-zA-Z0-9_-]+$/.test(obj.target)) {
            return { valid: false, error: 'Target contains invalid characters' };
        }
    }

    // Validate source (optional)
    if (obj.source !== undefined) {
        if (typeof obj.source !== 'string' || obj.source.length > 50) {
            return { valid: false, error: 'Source must be a string with max 50 characters' };
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(obj.source)) {
            return { valid: false, error: 'Source contains invalid characters' };
        }
    }

    // Validate intensity (optional)
    if (obj.intensity !== undefined) {
        if (typeof obj.intensity !== 'number' || obj.intensity < 1 || obj.intensity > 10) {
            return { valid: false, error: 'Intensity must be a number between 1 and 10' };
        }
    }

    // Validate nodeType (optional)
    if (obj.nodeType !== undefined) {
        if (!NODE_TYPES.includes(obj.nodeType as NodeType)) {
            return { valid: false, error: `Invalid nodeType. Allowed: ${NODE_TYPES.join(', ')}` };
        }
    }

    // Validate protocol (optional)
    if (obj.protocol !== undefined) {
        if (!PROTOCOL_TYPES.includes(obj.protocol as ProtocolType)) {
            return { valid: false, error: `Invalid protocol. Allowed: ${PROTOCOL_TYPES.join(', ')}` };
        }
    }

    // Validate position (optional)
    if (obj.position !== undefined) {
        if (typeof obj.position !== 'object' || obj.position === null) {
            return { valid: false, error: 'Position must be an object' };
        }
        const pos = obj.position as Record<string, unknown>;
        if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
            return { valid: false, error: 'Position must have numeric x and y properties' };
        }
        if (pos.x < -10000 || pos.x > 10000 || pos.y < -10000 || pos.y > 10000) {
            return { valid: false, error: 'Position coordinates must be between -10000 and 10000' };
        }
    }

    // Validate config (optional) - limited depth
    if (obj.config !== undefined) {
        if (typeof obj.config !== 'object' || obj.config === null || Array.isArray(obj.config)) {
            return { valid: false, error: 'Config must be an object' };
        }

        // Check config size (prevent large payloads)
        const configStr = JSON.stringify(obj.config);
        if (configStr.length > 1000) {
            return { valid: false, error: 'Config object is too large (max 1000 characters)' };
        }

        // Check for dangerous patterns
        if (configStr.includes('<script') || configStr.includes('javascript:') ||
            configStr.includes('eval(') || configStr.includes('Function(')) {
            return { valid: false, error: 'Config contains forbidden patterns' };
        }
    }

    // Build sanitized payload
    const sanitized: SimulationActionPayload = {
        action: obj.action as SimulationAction,
    };

    if (obj.target) sanitized.target = obj.target as string;
    if (obj.source) sanitized.source = obj.source as string;
    if (obj.intensity) sanitized.intensity = obj.intensity as number;
    if (obj.nodeType) sanitized.nodeType = obj.nodeType as NodeType;
    if (obj.protocol) sanitized.protocol = obj.protocol as ProtocolType;
    if (obj.position) sanitized.position = obj.position as { x: number; y: number };
    if (obj.config) sanitized.config = obj.config as Record<string, unknown>;

    return { valid: true, sanitized };
}

/**
 * Check if a string contains potentially dangerous content
 */
export function containsDangerousContent(str: string): boolean {
    const dangerous = [
        '<script',
        'javascript:',
        'vbscript:',
        'data:text/html',
        'eval(',
        'Function(',
        'setTimeout(',
        'setInterval(',
        'new Function',
        'onclick=',
        'onerror=',
        'onload=',
        'innerHTML',
        'outerHTML',
        'document.write',
        'document.cookie'
    ];

    const lower = str.toLowerCase();
    return dangerous.some(d => lower.includes(d.toLowerCase()));
}
