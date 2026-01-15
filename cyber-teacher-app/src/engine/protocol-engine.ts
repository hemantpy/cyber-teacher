// Protocol Engine - Handles DHCP, ARP, DNS, TCP, TLS simulation logic
// Pure functions that process packets and update world state

import {
    WorldState,
    Packet,
    PacketProtocol,
    Node,
    EventLog
} from './world-state';

// Deterministic ID generator
function generateId(prefix: string, seed: number, counter: number): string {
    return `${prefix}-${seed}-${counter}`;
}

// ===== DHCP PROTOCOL =====
export function handleDHCPDiscover(world: WorldState, packet: Packet): WorldState {
    const sourceNode = world.nodes.get(packet.source);
    const destNode = world.nodes.get(packet.destination);

    if (!sourceNode || !destNode || destNode.type !== 'router') {
        return world;
    }

    // Router responds with DHCP_OFFER
    const offerPacket: Packet = {
        id: generateId('dhcp-offer', world.seed, world.time),
        protocol: 'DHCP_OFFER',
        source: packet.destination,
        destination: packet.source,
        path: [packet.destination, packet.source],
        currentHopIndex: 0,
        payload: {
            offeredIP: `192.168.1.${10 + world.nodes.size}`,
            gateway: '192.168.1.1',
            dns: '8.8.8.8',
            leaseTime: 86400
        },
        malicious: false,
        encrypted: false,
        createdAt: world.time,
        ttl: 10
    };

    const newPackets = [...world.packets, offerPacket];
    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `DHCP: Router offering IP ${offerPacket.payload.offeredIP} to ${sourceNode.label}`,
        nodeIds: [packet.source, packet.destination]
    };

    return {
        ...world,
        packets: newPackets,
        logs: [...world.logs, log]
    };
}

export function handleDHCPOffer(world: WorldState, packet: Packet): WorldState {
    const destNode = world.nodes.get(packet.destination);
    if (!destNode) return world;

    // Client sends DHCP_REQUEST
    const requestPacket: Packet = {
        id: generateId('dhcp-request', world.seed, world.time),
        protocol: 'DHCP_REQUEST',
        source: packet.destination,
        destination: packet.source,
        path: [packet.destination, packet.source],
        currentHopIndex: 0,
        payload: {
            requestedIP: packet.payload.offeredIP
        },
        malicious: false,
        encrypted: false,
        createdAt: world.time,
        ttl: 10
    };

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `DHCP: ${destNode.label} requesting IP ${packet.payload.offeredIP}`,
        nodeIds: [packet.destination, packet.source]
    };

    return {
        ...world,
        packets: [...world.packets, requestPacket],
        logs: [...world.logs, log]
    };
}

export function handleDHCPRequest(world: WorldState, packet: Packet): WorldState {
    // Router sends DHCP_ACK
    const ackPacket: Packet = {
        id: generateId('dhcp-ack', world.seed, world.time),
        protocol: 'DHCP_ACK',
        source: packet.destination,
        destination: packet.source,
        path: [packet.destination, packet.source],
        currentHopIndex: 0,
        payload: {
            assignedIP: packet.payload.requestedIP,
            gateway: '192.168.1.1',
            dns: '8.8.8.8'
        },
        malicious: false,
        encrypted: false,
        createdAt: world.time,
        ttl: 10
    };

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `DHCP: Router confirming IP assignment`,
        nodeIds: [packet.destination, packet.source]
    };

    return {
        ...world,
        packets: [...world.packets, ackPacket],
        logs: [...world.logs, log]
    };
}

export function handleDHCPAck(world: WorldState, packet: Packet): WorldState {
    const destNode = world.nodes.get(packet.destination);
    if (!destNode) return world;

    // Update node with assigned IP
    const updatedNode: Node = {
        ...destNode,
        ip: packet.payload.assignedIP as string,
        gateway: packet.payload.gateway as string,
        dnsServer: packet.payload.dns as string,
        status: 'idle'
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(destNode.id, updatedNode);

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `DHCP: ${destNode.label} received IP ${updatedNode.ip}`,
        nodeIds: [packet.destination]
    };

    return {
        ...world,
        nodes: newNodes,
        logs: [...world.logs, log]
    };
}

// ===== ARP PROTOCOL =====
export function handleARPRequest(world: WorldState, packet: Packet): WorldState {
    const destNode = world.nodes.get(packet.destination);
    if (!destNode || !destNode.mac) return world;

    // Reply with MAC address
    const replyPacket: Packet = {
        id: generateId('arp-reply', world.seed, world.time),
        protocol: 'ARP_REPLY',
        source: packet.destination,
        destination: packet.source,
        path: [packet.destination, packet.source],
        currentHopIndex: 0,
        payload: {
            ip: destNode.ip,
            mac: destNode.mac
        },
        malicious: false,
        encrypted: false,
        createdAt: world.time,
        ttl: 5
    };

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `ARP: ${destNode.label} replying with MAC ${destNode.mac}`,
        nodeIds: [packet.destination, packet.source]
    };

    return {
        ...world,
        packets: [...world.packets, replyPacket],
        logs: [...world.logs, log]
    };
}

export function handleARPReply(world: WorldState, packet: Packet): WorldState {
    const destNode = world.nodes.get(packet.destination);
    if (!destNode) return world;

    // Update ARP table
    const newArpTable = new Map(destNode.arpTable);
    newArpTable.set(packet.payload.ip as string, packet.payload.mac as string);

    const updatedNode: Node = {
        ...destNode,
        arpTable: newArpTable
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(destNode.id, updatedNode);

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `ARP: ${destNode.label} cached MAC for ${packet.payload.ip}`,
        nodeIds: [packet.destination]
    };

    return {
        ...world,
        nodes: newNodes,
        logs: [...world.logs, log]
    };
}

// ===== DNS PROTOCOL =====
export function handleDNSQuery(world: WorldState, packet: Packet): WorldState {
    const dnsNode = world.nodes.get(packet.destination);
    if (!dnsNode || dnsNode.type !== 'dns') return world;

    const hostname = packet.payload.hostname as string;

    // Simulate DNS resolution
    const resolvedIP = `93.184.216.${34 + hostname.length % 10}`;

    const responsePacket: Packet = {
        id: generateId('dns-response', world.seed, world.time),
        protocol: 'DNS_RESPONSE',
        source: packet.destination,
        destination: packet.source,
        path: [packet.destination, packet.source],
        currentHopIndex: 0,
        payload: {
            hostname,
            resolvedIP,
            ttl: 3600
        },
        malicious: false,
        encrypted: false,
        createdAt: world.time,
        ttl: 10
    };

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `DNS: Resolved ${hostname} → ${resolvedIP}`,
        nodeIds: [packet.destination, packet.source]
    };

    return {
        ...world,
        packets: [...world.packets, responsePacket],
        logs: [...world.logs, log]
    };
}

export function handleDNSResponse(world: WorldState, packet: Packet): WorldState {
    const destNode = world.nodes.get(packet.destination);
    if (!destNode) return world;

    // Cache DNS result
    const newDnsCache = new Map(destNode.dnsCache);
    newDnsCache.set(packet.payload.hostname as string, packet.payload.resolvedIP as string);

    const updatedNode: Node = {
        ...destNode,
        dnsCache: newDnsCache
    };

    const newNodes = new Map(world.nodes);
    newNodes.set(destNode.id, updatedNode);

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `DNS: ${destNode.label} cached ${packet.payload.hostname}`,
        nodeIds: [packet.destination]
    };

    return {
        ...world,
        nodes: newNodes,
        logs: [...world.logs, log]
    };
}

// ===== TCP PROTOCOL =====
export function handleTCPSyn(world: WorldState, packet: Packet): WorldState {
    const destNode = world.nodes.get(packet.destination);
    if (!destNode) return world;

    // Check if connection is blocked by firewall
    if (destNode.security.firewallEnabled && packet.malicious) {
        const log: EventLog = {
            id: generateId('log', world.seed, world.time),
            time: world.time,
            type: 'defense',
            message: `Firewall: Blocked malicious SYN from ${packet.source}`,
            nodeIds: [packet.destination]
        };
        return { ...world, logs: [...world.logs, log] };
    }

    const synAckPacket: Packet = {
        id: generateId('tcp-synack', world.seed, world.time),
        protocol: 'TCP_SYN_ACK',
        source: packet.destination,
        destination: packet.source,
        path: [packet.destination, packet.source],
        currentHopIndex: 0,
        payload: {
            seq: Math.floor(world.seed % 65535),
            ack: (packet.payload.seq as number || 0) + 1
        },
        malicious: false,
        encrypted: false,
        createdAt: world.time,
        ttl: 10
    };

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `TCP: ${destNode.label} sending SYN-ACK`,
        nodeIds: [packet.destination, packet.source]
    };

    return {
        ...world,
        packets: [...world.packets, synAckPacket],
        logs: [...world.logs, log]
    };
}

export function handleTCPSynAck(world: WorldState, packet: Packet): WorldState {
    const destNode = world.nodes.get(packet.destination);
    if (!destNode) return world;

    const ackPacket: Packet = {
        id: generateId('tcp-ack', world.seed, world.time),
        protocol: 'TCP_ACK',
        source: packet.destination,
        destination: packet.source,
        path: [packet.destination, packet.source],
        currentHopIndex: 0,
        payload: {
            seq: (packet.payload.ack as number || 0),
            ack: (packet.payload.seq as number || 0) + 1
        },
        malicious: false,
        encrypted: false,
        createdAt: world.time,
        ttl: 10
    };

    const log: EventLog = {
        id: generateId('log', world.seed, world.time),
        time: world.time,
        type: 'protocol',
        message: `TCP: Connection established with ${packet.source}`,
        nodeIds: [packet.destination, packet.source]
    };

    return {
        ...world,
        packets: [...world.packets, ackPacket],
        logs: [...world.logs, log]
    };
}

// ===== PACKET ROUTER =====
export function processPacketProtocol(world: WorldState, packet: Packet): WorldState {
    switch (packet.protocol) {
        case 'DHCP_DISCOVER':
            return handleDHCPDiscover(world, packet);
        case 'DHCP_OFFER':
            return handleDHCPOffer(world, packet);
        case 'DHCP_REQUEST':
            return handleDHCPRequest(world, packet);
        case 'DHCP_ACK':
            return handleDHCPAck(world, packet);
        case 'ARP_REQUEST':
            return handleARPRequest(world, packet);
        case 'ARP_REPLY':
            return handleARPReply(world, packet);
        case 'DNS_QUERY':
            return handleDNSQuery(world, packet);
        case 'DNS_RESPONSE':
            return handleDNSResponse(world, packet);
        case 'TCP_SYN':
            return handleTCPSyn(world, packet);
        case 'TCP_SYN_ACK':
            return handleTCPSynAck(world, packet);
        default:
            return world;
    }
}
