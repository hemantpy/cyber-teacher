// Lesson 1: Network Boot Sequence
// Teaches the complete process of a PC connecting to the network

import { Lesson } from '@/types/lessons';

export const networkBootLesson: Lesson = {
    id: 'lesson-01-network-boot',
    title: 'Network Boot Sequence',
    description: 'Learn how a computer connects to a network from power-on to secure connection',
    category: 'networking',
    difficulty: 'beginner',
    estimatedTime: 5,

    initialEntities: [
        {
            id: 'router',
            type: 'Router',
            position: { x: 100, y: 0 },
            initialStatus: 'active',
            metadata: {
                label: 'Home Router',
                ip: '192.168.1.1',
                hostname: 'router.local'
            }
        }
    ],

    initialConnections: [],

    steps: [
        // Step 1: Boot
        {
            id: 'step-1-boot',
            name: 'Boot',
            duration: 3000,
            spawn: [
                {
                    id: 'pc',
                    type: 'PC',
                    position: { x: -120, y: 0 },
                    initialStatus: 'connecting',
                    metadata: {
                        label: 'Your PC',
                        hostname: 'my-computer'
                    }
                }
            ],
            ui: {
                title: 'Computer Boot',
                subtitle: 'Initializing network interface',
                details: [
                    'PC powers on',
                    'Network Interface Card (NIC) initializes',
                    'No IP address assigned yet',
                    'Status: Awaiting network configuration'
                ],
                highlight: ['pc'],
                aiExplanation: 'When your computer starts, the network card wakes up but has no idea where it is on the network. It needs to get an IP address first!'
            },
            onComplete: 'auto'
        },

        // Step 2: Link Detection
        {
            id: 'step-2-link',
            name: 'Link Detection',
            duration: 2000,
            connections: [
                {
                    id: 'conn-pc-router',
                    sourceId: 'pc',
                    targetId: 'router',
                    style: 'dotted'
                }
            ],
            ui: {
                title: 'Link Detection',
                subtitle: 'Physical connection established',
                details: [
                    'Ethernet cable detected',
                    'Link speed negotiated: 1 Gbps',
                    'Full duplex mode enabled',
                    'Ready for data transmission'
                ],
                highlight: ['pc', 'router'],
                aiExplanation: 'The NIC detects that a cable is plugged in and negotiates the best possible speed with the router. This happens at the physical layer.'
            },
            onComplete: 'auto'
        },

        // Step 3: DHCP Discovery
        {
            id: 'step-3-dhcp',
            name: 'DHCP Discovery',
            duration: 4000,
            packets: [
                {
                    protocol: 'DHCP',
                    connectionId: 'conn-pc-router',
                    count: 3,
                    direction: 'forward'
                }
            ],
            updateEntities: [
                {
                    id: 'pc',
                    status: 'active'
                }
            ],
            ui: {
                title: 'DHCP Discovery',
                subtitle: 'Requesting IP address',
                details: [
                    'PC broadcasts: "DHCP Discover"',
                    'Message: "Is there a DHCP server out there?"',
                    'Broadcast address: 255.255.255.255',
                    'Source: 0.0.0.0 (no IP yet)'
                ],
                highlight: ['pc'],
                aiExplanation: 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses. The PC shouts to everyone on the network asking for configuration.'
            },
            onComplete: 'auto'
        },

        // Step 4: DHCP Reply
        {
            id: 'step-4-dhcp-reply',
            name: 'DHCP Reply',
            duration: 3000,
            packets: [
                {
                    protocol: 'DHCP',
                    connectionId: 'conn-pc-router',
                    count: 2,
                    direction: 'reverse'
                }
            ],
            updateConnections: [
                {
                    id: 'conn-pc-router',
                    style: 'solid'
                }
            ],
            updateEntities: [
                {
                    id: 'pc',
                    metadata: { ip: '192.168.1.100' }
                }
            ],
            ui: {
                title: 'DHCP Offer & Acknowledge',
                subtitle: 'IP address assigned',
                details: [
                    'Router responds: "DHCP Offer"',
                    'Assigned IP: 192.168.1.100',
                    'Subnet Mask: 255.255.255.0',
                    'Default Gateway: 192.168.1.1',
                    'DNS Server: 8.8.8.8'
                ],
                highlight: ['router', 'pc'],
                aiExplanation: 'The router offers an IP address. The PC accepts it, and now has a unique identity on the local network!'
            },
            onComplete: 'auto'
        },

        // Step 5: ARP Mapping
        {
            id: 'step-5-arp',
            name: 'ARP Mapping',
            duration: 3000,
            packets: [
                {
                    protocol: 'ARP',
                    connectionId: 'conn-pc-router',
                    count: 2,
                    direction: 'forward'
                },
                {
                    protocol: 'ARP',
                    connectionId: 'conn-pc-router',
                    count: 2,
                    interval: 500,
                    direction: 'reverse'
                }
            ],
            ui: {
                title: 'ARP Resolution',
                subtitle: 'Learning MAC addresses',
                details: [
                    'PC asks: "Who has 192.168.1.1?"',
                    'Router replies with MAC address',
                    'ARP table updated',
                    'Now PC knows router\'s hardware address'
                ],
                highlight: ['pc', 'router'],
                aiExplanation: 'ARP (Address Resolution Protocol) maps IP addresses to physical MAC addresses. It\'s like asking "Who lives at this address?"'
            },
            onComplete: 'auto'
        },

        // Step 6: DNS Query
        {
            id: 'step-6-dns',
            name: 'DNS Query',
            duration: 4000,
            spawn: [
                {
                    id: 'dns',
                    type: 'DNS',
                    position: { x: 200, y: -120 },
                    initialStatus: 'active',
                    metadata: {
                        label: 'DNS Server',
                        ip: '8.8.8.8',
                        hostname: 'dns.google'
                    }
                }
            ],
            connections: [
                {
                    id: 'conn-router-dns',
                    sourceId: 'router',
                    targetId: 'dns',
                    style: 'solid'
                }
            ],
            packets: [
                {
                    protocol: 'DNS',
                    connectionId: 'conn-pc-router',
                    count: 1,
                    direction: 'forward'
                },
                {
                    protocol: 'DNS',
                    connectionId: 'conn-router-dns',
                    count: 1,
                    direction: 'forward'
                }
            ],
            ui: {
                title: 'DNS Resolution',
                subtitle: 'Translating domain names',
                details: [
                    'PC wants to visit "example.com"',
                    'Query: "What IP is example.com?"',
                    'Request sent to DNS server 8.8.8.8',
                    'UDP port 53 used'
                ],
                highlight: ['dns'],
                aiExplanation: 'DNS (Domain Name System) is like the internet\'s phonebook. It translates human-friendly names like "google.com" to IP addresses computers understand.'
            },
            onComplete: 'auto'
        },

        // Step 7: Routing via ISP
        {
            id: 'step-7-routing',
            name: 'Multi-hop Routing',
            duration: 4000,
            spawn: [
                {
                    id: 'isp',
                    type: 'ISP',
                    position: { x: 280, y: 80 },
                    initialStatus: 'active',
                    metadata: {
                        label: 'ISP Gateway',
                        ip: '203.0.113.1',
                        hostname: 'isp.net'
                    }
                },
                {
                    id: 'server',
                    type: 'Server',
                    position: { x: 420, y: 0 },
                    initialStatus: 'idle',
                    metadata: {
                        label: 'Web Server',
                        ip: '93.184.216.34',
                        hostname: 'example.com'
                    }
                }
            ],
            connections: [
                {
                    id: 'conn-router-isp',
                    sourceId: 'router',
                    targetId: 'isp',
                    style: 'solid'
                },
                {
                    id: 'conn-isp-server',
                    sourceId: 'isp',
                    targetId: 'server',
                    style: 'solid'
                }
            ],
            packets: [
                {
                    protocol: 'TCP',
                    connectionId: 'conn-pc-router',
                    count: 2,
                    direction: 'forward'
                },
                {
                    protocol: 'TCP',
                    connectionId: 'conn-router-isp',
                    count: 2,
                    direction: 'forward'
                },
                {
                    protocol: 'TCP',
                    connectionId: 'conn-isp-server',
                    count: 2,
                    direction: 'forward'
                }
            ],
            updateEntities: [
                {
                    id: 'server',
                    status: 'active'
                }
            ],
            ui: {
                title: 'Multi-hop Routing',
                subtitle: 'Packets travel across the internet',
                details: [
                    'Packet leaves your network',
                    'Hop 1: Home Router → ISP',
                    'Hop 2: ISP → Internet backbone',
                    'Hop 3: Backbone → Destination server',
                    'Each router makes forwarding decisions'
                ],
                highlight: ['isp', 'server'],
                aiExplanation: 'Packets don\'t travel directly - they hop between routers. Each router looks at the destination and decides the best next hop. Like passing a letter between post offices!'
            },
            onComplete: 'auto'
        },

        // Step 8: TLS Handshake
        {
            id: 'step-8-tls',
            name: 'TLS Handshake',
            duration: 4000,
            packets: [
                {
                    protocol: 'HTTPS',
                    connectionId: 'conn-pc-router',
                    count: 3,
                    direction: 'forward'
                },
                {
                    protocol: 'HTTPS',
                    connectionId: 'conn-router-isp',
                    count: 3,
                    direction: 'forward'
                },
                {
                    protocol: 'HTTPS',
                    connectionId: 'conn-isp-server',
                    count: 3,
                    direction: 'forward'
                }
            ],
            updateConnections: [
                {
                    id: 'conn-pc-router',
                    style: 'encrypted'
                },
                {
                    id: 'conn-router-isp',
                    style: 'encrypted'
                },
                {
                    id: 'conn-isp-server',
                    style: 'encrypted'
                }
            ],
            ui: {
                title: 'TLS Encryption',
                subtitle: 'Establishing secure connection',
                details: [
                    'Client Hello: Propose cipher suites',
                    'Server Hello: Choose cipher + send certificate',
                    'Key Exchange: Generate session keys',
                    'Finished: Encrypted tunnel ready',
                    '🔒 Connection is now secure!'
                ],
                highlight: ['pc', 'server'],
                aiExplanation: 'TLS (Transport Layer Security) creates an encrypted tunnel. Even if someone intercepts the traffic, they can\'t read it without the secret keys!'
            },
            onComplete: 'auto'
        },

        // Step 9: Connected
        {
            id: 'step-9-connected',
            name: 'Connected',
            duration: 2000,
            ui: {
                title: '✅ Connection Complete!',
                subtitle: 'Secure communication established',
                details: [
                    'All protocols negotiated successfully',
                    'IP: 192.168.1.100',
                    'Gateway: 192.168.1.1',
                    'DNS: 8.8.8.8',
                    'Secure HTTPS connection to example.com',
                    'Network Health: 100%'
                ],
                highlight: ['pc', 'server'],
                aiExplanation: 'Congratulations! You\'ve just witnessed the complete journey from power-on to secure web browsing. This whole process typically takes less than a second!'
            },
            onComplete: 'click'
        }
    ],

    quiz: {
        id: 'quiz-01',
        title: 'Network Boot Quiz',
        questions: [
            {
                id: 'q1',
                question: 'What protocol assigns IP addresses automatically?',
                options: ['DNS', 'DHCP', 'ARP', 'HTTP'],
                correctIndex: 1,
                explanation: 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses to devices on a network.'
            },
            {
                id: 'q2',
                question: 'What does ARP do?',
                options: ['Secures the connection', 'Resolves domain names', 'Maps IP addresses to MAC addresses', 'Routes packets'],
                correctIndex: 2,
                explanation: 'ARP (Address Resolution Protocol) maps logical IP addresses to physical MAC addresses so devices can communicate on a local network.'
            },
            {
                id: 'q3',
                question: 'Which protocol is used for secure web browsing?',
                options: ['HTTP', 'FTP', 'HTTPS', 'Telnet'],
                correctIndex: 2,
                explanation: 'HTTPS (HTTP Secure) uses TLS encryption to secure communications between your browser and the web server.'
            }
        ]
    }
};
