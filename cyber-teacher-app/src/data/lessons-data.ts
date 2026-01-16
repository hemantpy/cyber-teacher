// Lesson data for the lessons page - 7 core lessons matching the reference
export interface LessonCard {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    description: string;
    duration: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
    status: 'available' | 'coming_soon' | 'locked';
    icon: string;
}

export const lessonsData: LessonCard[] = [
    {
        id: 'lesson-01',
        number: 1,
        title: 'The Awakening',
        subtitle: 'Boot Chamber',
        description: 'Begin your journey as a cyber defender. Learn the fundamentals of your workstation and how computers initialize their network interface.',
        duration: 5,
        difficulty: 'beginner',
        topics: ['Computer Basics', 'NIC Initialization', 'Boot Process'],
        status: 'available',
        icon: ''
    },
    {
        id: 'lesson-02',
        number: 2,
        title: 'First Contact',
        subtitle: 'Connecting to the World',
        description: 'Your isolated workstation connects to the vast global network. Understand the infrastructure that powers the internet.',
        duration: 8,
        difficulty: 'beginner',
        topics: ['DHCP', 'IP Address', 'Gateway'],
        status: 'available',
        icon: ''
    },
    {
        id: 'lesson-03',
        number: 3,
        title: 'DDoS — Flood the Gates',
        subtitle: 'Traffic Defense',
        description: 'Experience your first attack as a massive DDoS swarm floods your network. Learn to identify, analyze, and mitigate distributed denial of service attacks.',
        duration: 12,
        difficulty: 'intermediate',
        topics: ['DDoS Attack', 'Rate Limiting', 'Traffic Analysis'],
        status: 'available',
        icon: ''
    },
    {
        id: 'lesson-04',
        number: 4,
        title: 'Undercover Threat',
        subtitle: 'The Trojan Horse',
        description: 'A seemingly innocent file hides a deadly secret. Learn to identify and neutralize Trojan horses before they strike.',
        duration: 10,
        difficulty: 'intermediate',
        topics: ['Trojans', 'Malware Detection', 'Quarantine'],
        status: 'available',
        icon: '�'
    },
    {
        id: 'lesson-05',
        number: 5,
        title: 'Injection',
        subtitle: 'The SQL Serpent',
        description: 'Malicious queries slither through input fields to poison your database. Master input validation and parameterized queries.',
        duration: 12,
        difficulty: 'intermediate',
        topics: ['SQL Injection', 'Input Validation', 'Database Security'],
        status: 'available',
        icon: ''
    },
    {
        id: 'lesson-06',
        number: 6,
        title: 'Man in the Middle',
        subtitle: 'The Shadow Between',
        description: 'An invisible adversary intercepts your communications. Learn the importance of encryption and secure connections.',
        duration: 15,
        difficulty: 'advanced',
        topics: ['MitM Attack', 'Encryption', 'HTTPS', 'Certificates'],
        status: 'available',
        icon: ''
    },
    {
        id: 'lesson-07',
        number: 7,
        title: 'Final Assault',
        subtitle: 'Total War',
        description: 'Everything you\'ve learned is put to the ultimate test. Face a coordinated attack using every technique against your network.',
        duration: 20,
        difficulty: 'advanced',
        topics: ['Combined Attacks', 'Defense Strategy', 'Incident Response'],
        status: 'available',
        icon: ''
    }
];

// Chapter data for campaign map
export interface Chapter {
    id: number;
    title: string;
    theme: string;
    lessons: string[];
    unlockCondition: string | null;
}

export const chaptersData: Chapter[] = [
    {
        id: 1,
        title: 'Boot Chamber',
        theme: 'The Awakening',
        lessons: ['lesson-01'],
        unlockCondition: null
    },
    {
        id: 2,
        title: 'First Contact',
        theme: 'Network Discovery',
        lessons: ['lesson-02'],
        unlockCondition: 'lesson-01'
    },
    {
        id: 3,
        title: 'Under Siege',
        theme: 'DDoS Defense',
        lessons: ['lesson-03'],
        unlockCondition: 'lesson-02'
    },
    {
        id: 4,
        title: 'Hidden Dangers',
        theme: 'Malware Threats',
        lessons: ['lesson-04', 'lesson-05'],
        unlockCondition: 'lesson-03'
    },
    {
        id: 5,
        title: 'Trust No One',
        theme: 'Network Security',
        lessons: ['lesson-06'],
        unlockCondition: 'lesson-05'
    },
    {
        id: 6,
        title: 'Final Stand',
        theme: 'Complete Defense',
        lessons: ['lesson-07'],
        unlockCondition: 'lesson-06'
    }
];
