// Gemini AI Service - Provides intelligent learning assistance
// Uses Google's Generative AI (Gemini) for explanations and coaching

interface GeminiConfig {
    apiKey: string | null;
    model: string;
    maxTokens: number;
    temperature: number;
}

interface AIResponse {
    success: boolean;
    content: string;
    error?: string;
}

// Offline fallback responses for when API is unavailable
const OFFLINE_RESPONSES = {
    boot: `When your computer starts up, several important things happen:
    
1. **Power-On Self-Test (POST)**: The computer checks its hardware
2. **BIOS/UEFI Initialization**: Basic system setup loads
3. **Network Interface Card (NIC)**: Your network adapter initializes
4. **Driver Loading**: Network drivers are loaded into memory
5. **Stack Initialization**: The TCP/IP network stack starts

At this point, your computer is ready to communicate over the network, but it doesn't have an IP address yet. That's where DHCP comes in!`,

    dhcp: `**DHCP (Dynamic Host Configuration Protocol)** automatically assigns IP addresses:

1. **DHCP Discover**: Your PC broadcasts "I need an IP address!"
2. **DHCP Offer**: The router responds with an available IP
3. **DHCP Request**: Your PC accepts the offer
4. **DHCP Acknowledge**: The router confirms the assignment

This process happens in milliseconds and gives your computer:
- An IP address (e.g., 192.168.1.100)
- Subnet mask (e.g., 255.255.255.0)
- Default gateway (router's address)
- DNS server addresses`,

    ddos: `**DDoS (Distributed Denial of Service)** attacks overwhelm a target with traffic:

[ATTACK] **How it works:**
- Attackers control thousands of compromised computers (botnet)
- All devices send requests simultaneously to the target
- The target's resources are exhausted
- Legitimate users can't access the service

[DEFENSE] **Defense strategies:**
- **Rate Limiting**: Restrict requests per IP
- **Traffic Analysis**: Identify unusual patterns
- **CDN/WAF**: Distribute and filter traffic
- **Blackholing**: Drop all traffic temporarily`,

    sqlInjection: `**SQL Injection** attacks exploit vulnerable database queries:

[ATTACK] **How it works:**
- Attacker enters malicious SQL code in input fields
- Vulnerable applications don't sanitize input properly
- The database executes the malicious query
- Attacker gains unauthorized access or data

[DEFENSE] **Prevention:**
- **Parameterized Queries**: Never concatenate user input
- **Input Validation**: Sanitize all user input
- **WAF**: Web Application Firewall filters malicious requests
- **Least Privilege**: Limit database permissions`,

    trojan: `**Trojan Horse** malware disguises itself as legitimate software:

[ATTACK] **How it works:**
- Appears as useful software (game, tool, etc.)
- User installs it thinking it's safe
- Hidden malicious code activates
- Opens backdoors for attackers

[DEFENSE] **Protection:**
- Download only from trusted sources
- Use antivirus software
- Keep systems updated
- Be suspicious of unsolicited files`,

    mitm: `**Man-in-the-Middle (MitM)** attacks intercept communications:

[ATTACK] **How it works:**
- Attacker positions between victim and server
- All traffic passes through the attacker
- They can read, modify, or inject data
- Victims are unaware of the interception

[DEFENSE] **Prevention:**
- **HTTPS**: Encrypted connections
- **Certificate Verification**: Check site certificates
- **VPN**: Secure tunneling
- **Avoid Public WiFi**: Or use VPN when necessary`,

    general: `Cybersecurity is about protecting systems, networks, and data from digital attacks.

Key concepts:
[C] **Confidentiality**: Only authorized users access data
[I] **Integrity**: Data isn't altered without authorization  
[A] **Availability**: Systems are accessible when needed

Remember: Security is a process, not a product. Stay vigilant, keep learning, and practice defense in depth!`,
};

class GeminiService {
    private static instance: GeminiService;

    // AI feature is disabled for now - offline fallbacks work without API
    private disabled: boolean = true;

    private config: GeminiConfig = {
        apiKey: null,
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
    };

    private constructor() {
        // AI feature disabled - do not load API key
        // When re-enabled, uncomment the following:
        // if (typeof window !== 'undefined' && !this.disabled) {
        //     const saved = localStorage.getItem('geminiApiKey');
        //     if (saved) {
        //         this.config.apiKey = saved;
        //     }
        // }
    }


    static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }

    // Set API key
    setApiKey(apiKey: string): void {
        this.config.apiKey = apiKey;
        if (typeof window !== 'undefined') {
            localStorage.setItem('geminiApiKey', apiKey);
        }
    }

    // Check if API key is configured
    hasApiKey(): boolean {
        return !!this.config.apiKey;
    }

    // Check if AI feature is disabled
    isDisabled(): boolean {
        return this.disabled;
    }


    // Clear API key
    clearApiKey(): void {
        this.config.apiKey = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('geminiApiKey');
        }
    }

    // Generate content using Gemini API
    private async callGeminiAPI(prompt: string): Promise<AIResponse> {
        if (!this.config.apiKey) {
            return {
                success: false,
                content: '',
                error: 'API key not configured',
            };
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                        generationConfig: {
                            maxOutputTokens: this.config.maxTokens,
                            temperature: this.config.temperature,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return {
                success: true,
                content,
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            return {
                success: false,
                content: '',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    // Get offline fallback response
    private getOfflineResponse(context: string): string {
        const lower = context.toLowerCase();

        if (lower.includes('boot') || lower.includes('start')) {
            return OFFLINE_RESPONSES.boot;
        }
        if (lower.includes('dhcp') || lower.includes('ip address')) {
            return OFFLINE_RESPONSES.dhcp;
        }
        if (lower.includes('ddos') || lower.includes('flood')) {
            return OFFLINE_RESPONSES.ddos;
        }
        if (lower.includes('sql') || lower.includes('injection')) {
            return OFFLINE_RESPONSES.sqlInjection;
        }
        if (lower.includes('trojan') || lower.includes('horse') || lower.includes('malware')) {
            return OFFLINE_RESPONSES.trojan;
        }
        if (lower.includes('mitm') || lower.includes('man in the middle') || lower.includes('intercept')) {
            return OFFLINE_RESPONSES.mitm;
        }

        return OFFLINE_RESPONSES.general;
    }

    // Generate narration for a scene
    async generateNarration(sceneDescription: string): Promise<string> {
        const prompt = `You are a cybersecurity educator narrating a network simulation. Generate a brief, engaging narration (2-3 sentences) for this scene:

Scene: ${sceneDescription}

Keep it educational but exciting. Use simple language that beginners can understand.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        return this.getOfflineResponse(sceneDescription);
    }

    // Get coaching tip for current context
    async getCoachingTip(context: string): Promise<string> {
        const prompt = `You are a friendly cybersecurity coach in an educational simulation. Given this context, provide ONE helpful tip or insight:

Context: ${context}

Keep it to 1-2 sentences. Be encouraging and practical.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        return `[TIP] ${this.getOfflineResponse(context).split('\n')[0]}`;
    }

    // Explain a node or system state
    async explainNodeState(nodeType: string, status: string, details?: string): Promise<string> {
        const prompt = `You are explaining network components in a cybersecurity simulator. Explain this node's current state:

Node Type: ${nodeType}
Status: ${status}
${details ? `Additional Details: ${details}` : ''}

Provide a clear, educational explanation in 2-4 sentences. Use simple language.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        return this.getOfflineResponse(nodeType);
    }

    // Generate a hint for the current step
    async generateHint(stepTitle: string, stepDescription: string): Promise<string> {
        const prompt = `You are helping a student learn cybersecurity in a simulation. They are on this step:

Step: ${stepTitle}
Description: ${stepDescription}

Give a helpful hint to guide them. Keep it to 1-2 sentences.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        return `[HINT] Focus on understanding how ${stepTitle.toLowerCase()} works. Watch the animation carefully!`;
    }

    // Summarize system logs
    async summarizeSystemLogs(logs: string[]): Promise<string> {
        if (logs.length === 0) {
            return 'No activity to summarize yet.';
        }

        const prompt = `You are analyzing network logs in a cybersecurity simulation. Summarize these recent events:

${logs.slice(-10).join('\n')}

Provide a brief summary (2-3 sentences) of what's happening. Highlight any security concerns.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        return `[SUMMARY] ${logs.length} events recorded. The network is ${logs.some((l) => l.includes('attack')) ? 'under attack! Deploy defenses.' : 'operating normally.'}`;
    }

    // Answer user question
    async answerQuestion(question: string): Promise<string> {
        const prompt = `You are a cybersecurity educator assistant in an interactive learning simulation. A student asks:

"${question}"

Provide a helpful, educational answer. Keep it concise (2-4 sentences) but accurate. If the question is off-topic, gently redirect to cybersecurity.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        return this.getOfflineResponse(question);
    }

    // Explain an attack type
    async explainAttack(attackType: string): Promise<string> {
        const prompt = `You are teaching about cyber attacks. Explain this attack type:

Attack: ${attackType}

Cover:
1. How it works (2 sentences)
2. Real-world impact (1 sentence)
3. Key defense (1 sentence)

Use simple language suitable for beginners.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        const lower = attackType.toLowerCase();
        if (lower.includes('ddos')) return OFFLINE_RESPONSES.ddos;
        if (lower.includes('sql')) return OFFLINE_RESPONSES.sqlInjection;
        if (lower.includes('trojan')) return OFFLINE_RESPONSES.trojan;
        if (lower.includes('mitm') || lower.includes('middle')) return OFFLINE_RESPONSES.mitm;

        return OFFLINE_RESPONSES.general;
    }

    // Suggest defense based on current state
    async suggestDefense(situation: string): Promise<string> {
        const prompt = `You are a cybersecurity defense advisor in a simulation. Given this situation:

"${situation}"

Recommend the best defense strategy in 2-3 sentences. Be specific and actionable.`;

        const response = await this.callGeminiAPI(prompt);
        if (response.success) {
            return response.content;
        }

        return `[DEFENSE] Recommended: Activate your WAF, enable rate limiting, and monitor traffic patterns. Quick action is key!`;
    }
}

// Export singleton instance
export const geminiService = GeminiService.getInstance();

// Export types
export type { AIResponse };
