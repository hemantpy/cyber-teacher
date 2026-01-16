// Lesson 2: DDoS Attack & Defense
// Demonstrates a DDoS attack scenario and defense mechanisms

import { Lesson } from '@/types/lessons';

export const ddosAttackLesson: Lesson = {
    id: 'lesson-02-ddos-attack',
    title: 'DDoS Attack & Defense',
    description: 'Learn how DDoS attacks overwhelm servers and how to defend against them',
    category: 'attack',
    difficulty: 'intermediate',
    estimatedTime: 4,

    initialEntities: [
        {
            id: 'server',
            type: 'Server',
            position: { x: 0, y: 0 },
            initialStatus: 'active',
            metadata: {
                label: 'Web Server',
                ip: '93.184.216.34',
                hostname: 'example.com'
            }
        },
        {
            id: 'firewall',
            type: 'Firewall',
            position: { x: -150, y: 0 },
            initialStatus: 'active',
            metadata: {
                label: 'Firewall',
                ip: '10.0.0.1'
            }
        },
        {
            id: 'router',
            type: 'Router',
            position: { x: -300, y: 0 },
            initialStatus: 'active',
            metadata: {
                label: 'Edge Router',
                ip: '203.0.113.1'
            }
        }
    ],

    initialConnections: [
        {
            id: 'conn-router-firewall',
            sourceId: 'router',
            targetId: 'firewall',
            style: 'solid'
        },
        {
            id: 'conn-firewall-server',
            sourceId: 'firewall',
            targetId: 'server',
            style: 'solid'
        }
    ],

    steps: [
        // Step 1: Normal Operation
        {
            id: 'step-1-normal',
            name: 'Normal Operation',
            duration: 4000,
            spawn: [
                {
                    id: 'user1',
                    type: 'PC',
                    position: { x: -450, y: -80 },
                    initialStatus: 'active',
                    metadata: { label: 'User 1', ip: '192.168.1.10' }
                },
                {
                    id: 'user2',
                    type: 'PC',
                    position: { x: -450, y: 80 },
                    initialStatus: 'active',
                    metadata: { label: 'User 2', ip: '192.168.1.11' }
                }
            ],
            connections: [
                { id: 'conn-user1-router', sourceId: 'user1', targetId: 'router', style: 'solid' },
                { id: 'conn-user2-router', sourceId: 'user2', targetId: 'router', style: 'solid' }
            ],
            packets: [
                { protocol: 'HTTPS', connectionId: 'conn-user1-router', count: 2, direction: 'forward' },
                { protocol: 'HTTPS', connectionId: 'conn-user2-router', count: 2, direction: 'forward' }
            ],
            ui: {
                title: 'Normal Traffic Flow',
                subtitle: 'Server handling legitimate requests',
                details: [
                    'Web server is operational',
                    'Firewall monitoring traffic',
                    'Users browsing normally',
                    'Response time: 50ms'
                ],
                highlight: ['server'],
                aiExplanation: 'This is normal operation - the server handles requests from legitimate users with no issues. The firewall inspects each packet but allows valid traffic through.'
            },
            onComplete: 'auto'
        },

        // Step 2: Attackers Appear
        {
            id: 'step-2-attackers',
            name: 'Attackers Emerge',
            duration: 3000,
            spawn: [
                {
                    id: 'attacker1',
                    type: 'Attacker',
                    position: { x: -500, y: -200 },
                    initialStatus: 'active',
                    metadata: { label: 'Botnet Node 1', ip: '45.33.32.1' }
                },
                {
                    id: 'attacker2',
                    type: 'Attacker',
                    position: { x: -500, y: 0 },
                    initialStatus: 'active',
                    metadata: { label: 'Botnet Node 2', ip: '45.33.32.2' }
                },
                {
                    id: 'attacker3',
                    type: 'Attacker',
                    position: { x: -500, y: 200 },
                    initialStatus: 'active',
                    metadata: { label: 'Botnet Node 3', ip: '45.33.32.3' }
                }
            ],
            ui: {
                title: '⚠ Threat Detected',
                subtitle: 'Botnet nodes coming online',
                details: [
                    'Multiple suspicious IPs detected',
                    'Coordinated activity observed',
                    'Traffic pattern anomaly',
                    'Preparing for attack'
                ],
                highlight: ['attacker1', 'attacker2', 'attacker3'],
                aiExplanation: 'A DDoS attack uses many compromised computers (a "botnet") to flood a target with traffic. Each individual request may look legitimate, but the volume overwhelms the server.'
            },
            onComplete: 'auto'
        },

        // Step 3: Attack Begins
        {
            id: 'step-3-attack',
            name: 'DDoS Attack',
            duration: 5000,
            connections: [
                { id: 'conn-att1-router', sourceId: 'attacker1', targetId: 'router', style: 'pulsing' },
                { id: 'conn-att2-router', sourceId: 'attacker2', targetId: 'router', style: 'pulsing' },
                { id: 'conn-att3-router', sourceId: 'attacker3', targetId: 'router', style: 'pulsing' }
            ],
            updateConnections: [
                { id: 'conn-router-firewall', style: 'pulsing' }
            ],
            updateEntities: [
                { id: 'server', status: 'under_attack' },
                { id: 'router', status: 'under_attack' }
            ],
            packets: [
                { protocol: 'ATTACK', connectionId: 'conn-att1-router', count: 8, interval: 150, direction: 'forward' },
                { protocol: 'ATTACK', connectionId: 'conn-att2-router', count: 8, interval: 150, direction: 'forward' },
                { protocol: 'ATTACK', connectionId: 'conn-att3-router', count: 8, interval: 150, direction: 'forward' }
            ],
            ui: {
                title: '� DDoS ATTACK IN PROGRESS',
                subtitle: 'Server being flooded with requests',
                details: [
                    'Traffic spike: 10,000% above normal',
                    'Server response time: 5000ms+',
                    'Connection queue full',
                    'Legitimate users cannot connect'
                ],
                highlight: ['server', 'attacker1', 'attacker2', 'attacker3'],
                aiExplanation: 'The attack floods the server with fake requests. Each "packet" you see represents thousands of malicious requests. The server cannot distinguish good from bad traffic and becomes overwhelmed.'
            },
            onComplete: 'auto'
        },

        // Step 4: Enable Defense
        {
            id: 'step-4-defense',
            name: 'Activating Defenses',
            duration: 4000,
            updateEntities: [
                { id: 'firewall', status: 'active' }
            ],
            updateConnections: [
                { id: 'conn-att1-router', style: 'dotted' },
                { id: 'conn-att2-router', style: 'dotted' },
                { id: 'conn-att3-router', style: 'dotted' },
                { id: 'conn-router-firewall', style: 'solid' },
                { id: 'conn-firewall-server', style: 'encrypted' }
            ],
            ui: {
                title: ' Defenses Activated',
                subtitle: 'Rate limiting and IP blocking enabled',
                details: [
                    'WAF rules updated',
                    'Rate limiting: 100 req/sec per IP',
                    'Blocking IPs: 45.33.32.0/24',
                    'Traffic scrubbing enabled'
                ],
                highlight: ['firewall'],
                aiExplanation: 'Defense mechanisms include: rate limiting (capping requests per IP), IP blocking (blacklisting known attackers), and traffic scrubbing (filtering malicious packets before they reach the server).'
            },
            onComplete: 'auto'
        },

        // Step 5: Attack Blocked
        {
            id: 'step-5-blocked',
            name: 'Attack Mitigated',
            duration: 4000,
            updateEntities: [
                { id: 'server', status: 'active' },
                { id: 'router', status: 'active' },
                { id: 'attacker1', status: 'blocked' },
                { id: 'attacker2', status: 'blocked' },
                { id: 'attacker3', status: 'blocked' }
            ],
            removeConnections: ['conn-att1-router', 'conn-att2-router', 'conn-att3-router'],
            packets: [
                { protocol: 'HTTPS', connectionId: 'conn-user1-router', count: 2, direction: 'forward' },
                { protocol: 'HTTPS', connectionId: 'conn-user2-router', count: 2, direction: 'forward' }
            ],
            ui: {
                title: ' Attack Mitigated',
                subtitle: 'Normal operations restored',
                details: [
                    'Malicious IPs blocked',
                    'Attack traffic dropped at edge',
                    'Server load: Normal',
                    'Response time: 45ms'
                ],
                highlight: ['server', 'firewall'],
                aiExplanation: 'The attack is now blocked at the network edge. The firewall drops packets from known bad IPs before they can reach the server. Legitimate users can access the service again.'
            },
            onComplete: 'click'
        }
    ]
};
