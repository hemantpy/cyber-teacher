// Sound Engine - Manages all audio for the simulation
// Uses Web Audio API for better performance and control

type SoundCategory = 'sfx' | 'music' | 'ambience' | 'voice';

interface SoundConfig {
    volume: number;
    enabled: boolean;
}

type SoundSettings = Record<SoundCategory, SoundConfig>;

// Sound definitions
const SOUNDS = {
    // UI Sounds
    click: { src: '/sounds/click.mp3', category: 'sfx' as SoundCategory },
    hover: { src: '/sounds/hover.mp3', category: 'sfx' as SoundCategory },
    success: { src: '/sounds/success.mp3', category: 'sfx' as SoundCategory },
    error: { src: '/sounds/error.mp3', category: 'sfx' as SoundCategory },
    notification: { src: '/sounds/notification.mp3', category: 'sfx' as SoundCategory },

    // Simulation Sounds
    boot: { src: '/sounds/boot.mp3', category: 'sfx' as SoundCategory },
    connect: { src: '/sounds/connect.mp3', category: 'sfx' as SoundCategory },
    disconnect: { src: '/sounds/disconnect.mp3', category: 'sfx' as SoundCategory },
    packet: { src: '/sounds/packet.mp3', category: 'sfx' as SoundCategory },

    // Attack Sounds
    attack: { src: '/sounds/attack.mp3', category: 'sfx' as SoundCategory },
    ddos: { src: '/sounds/ddos.mp3', category: 'sfx' as SoundCategory },
    malware: { src: '/sounds/malware.mp3', category: 'sfx' as SoundCategory },
    breach: { src: '/sounds/breach.mp3', category: 'sfx' as SoundCategory },

    // Defense Sounds
    shield: { src: '/sounds/shield.mp3', category: 'sfx' as SoundCategory },
    block: { src: '/sounds/block.mp3', category: 'sfx' as SoundCategory },
    heal: { src: '/sounds/heal.mp3', category: 'sfx' as SoundCategory },

    // Ambience
    networkHum: { src: '/sounds/network-hum.mp3', category: 'ambience' as SoundCategory },
    dataFlow: { src: '/sounds/data-flow.mp3', category: 'ambience' as SoundCategory },

    // Music
    menuTheme: { src: '/sounds/menu-theme.mp3', category: 'music' as SoundCategory },
    battleTheme: { src: '/sounds/battle-theme.mp3', category: 'music' as SoundCategory },

    // Victory/Defeat
    victory: { src: '/sounds/victory.mp3', category: 'sfx' as SoundCategory },
    defeat: { src: '/sounds/defeat.mp3', category: 'sfx' as SoundCategory },
} as const;

type SoundName = keyof typeof SOUNDS;

class SoundManager {
    private static instance: SoundManager;
    private audioContext: AudioContext | null = null;
    private audioBuffers: Map<SoundName, AudioBuffer> = new Map();
    private activeNodes: Map<string, AudioBufferSourceNode> = new Map();
    private gainNodes: Map<SoundCategory, GainNode> = new Map();
    private masterGain: GainNode | null = null;

    private settings: SoundSettings = {
        sfx: { volume: 0.7, enabled: true },
        music: { volume: 0.3, enabled: true },
        ambience: { volume: 0.2, enabled: true },
        voice: { volume: 0.8, enabled: true },
    };

    private initialized = false;
    private loadingPromises: Map<SoundName, Promise<void>> = new Map();

    private constructor() {
        // Load settings from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('soundSettings');
            if (saved) {
                try {
                    this.settings = { ...this.settings, ...JSON.parse(saved) };
                } catch (e) {
                    console.warn('Failed to parse sound settings:', e);
                }
            }
        }
    }

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    // Initialize audio context (must be called after user interaction)
    async initialize(): Promise<void> {
        if (this.initialized || typeof window === 'undefined') return;

        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);

            // Create category gain nodes
            const categories: SoundCategory[] = ['sfx', 'music', 'ambience', 'voice'];
            categories.forEach((category) => {
                const gainNode = this.audioContext!.createGain();
                gainNode.gain.value = this.settings[category].volume;
                gainNode.connect(this.masterGain!);
                this.gainNodes.set(category, gainNode);
            });

            this.initialized = true;
            console.log('[AUDIO] Sound Engine initialized');
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
        }
    }

    // Pre-load a sound
    async preload(name: SoundName): Promise<void> {
        if (!this.audioContext || this.audioBuffers.has(name)) return;

        // Check if already loading
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        const loadPromise = (async () => {
            try {
                const sound = SOUNDS[name];
                const response = await fetch(sound.src);
                if (!response.ok) {
                    // Sound file doesn't exist, that's okay - we'll generate synthetic sounds
                    console.debug(`Sound file not found: ${sound.src}, using synthesized fallback`);
                    return;
                }
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
                this.audioBuffers.set(name, audioBuffer);
            } catch (error) {
                // Silently fail - sounds are optional
                console.debug(`Could not load sound: ${name}`);
            }
        })();

        this.loadingPromises.set(name, loadPromise);
        return loadPromise;
    }

    // Play a sound
    play(name: SoundName, options: { loop?: boolean; volume?: number } = {}): string | null {
        if (!this.initialized || !this.audioContext) {
            // Try to initialize on first play
            this.initialize();
            return null;
        }

        const sound = SOUNDS[name];
        const settings = this.settings[sound.category];

        if (!settings.enabled) return null;

        // Use synthesized sound if no audio buffer
        if (!this.audioBuffers.has(name)) {
            return this.playSynthesized(name, options);
        }

        const buffer = this.audioBuffers.get(name)!;
        const gainNode = this.gainNodes.get(sound.category);

        if (!gainNode) return null;

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = options.loop || false;

        // Create individual gain for this sound
        const soundGain = this.audioContext.createGain();
        soundGain.gain.value = options.volume ?? 1;
        source.connect(soundGain);
        soundGain.connect(gainNode);

        source.start(0);

        const id = `${name}-${Date.now()}`;
        this.activeNodes.set(id, source);

        source.onended = () => {
            this.activeNodes.delete(id);
        };

        return id;
    }

    // Play synthesized sound (fallback when files not available)
    private playSynthesized(name: SoundName, options: { volume?: number } = {}): string | null {
        if (!this.audioContext || !this.masterGain) return null;

        const sound = SOUNDS[name];
        const settings = this.settings[sound.category];
        if (!settings.enabled) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const categoryGain = this.gainNodes.get(sound.category);

        if (!categoryGain) return null;

        // Configure based on sound type
        const configs: Record<string, { freq: number; duration: number; type: OscillatorType }> = {
            click: { freq: 800, duration: 0.05, type: 'sine' },
            hover: { freq: 600, duration: 0.03, type: 'sine' },
            success: { freq: 880, duration: 0.15, type: 'sine' },
            error: { freq: 220, duration: 0.2, type: 'square' },
            notification: { freq: 660, duration: 0.1, type: 'triangle' },
            boot: { freq: 440, duration: 0.3, type: 'sine' },
            connect: { freq: 523, duration: 0.2, type: 'triangle' },
            disconnect: { freq: 330, duration: 0.15, type: 'sawtooth' },
            packet: { freq: 1200, duration: 0.02, type: 'sine' },
            attack: { freq: 150, duration: 0.3, type: 'sawtooth' },
            ddos: { freq: 100, duration: 0.5, type: 'square' },
            malware: { freq: 180, duration: 0.4, type: 'sawtooth' },
            breach: { freq: 200, duration: 0.6, type: 'square' },
            shield: { freq: 700, duration: 0.2, type: 'triangle' },
            block: { freq: 400, duration: 0.1, type: 'square' },
            heal: { freq: 600, duration: 0.25, type: 'sine' },
            victory: { freq: 880, duration: 0.5, type: 'sine' },
            defeat: { freq: 220, duration: 0.8, type: 'sawtooth' },
        };

        const config = configs[name] || { freq: 440, duration: 0.1, type: 'sine' as OscillatorType };

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.freq, this.audioContext.currentTime);

        // Envelope
        const volume = (options.volume ?? 0.3) * settings.volume;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + config.duration);

        oscillator.connect(gainNode);
        gainNode.connect(categoryGain);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration + 0.1);

        return `synth-${name}-${Date.now()}`;
    }

    // Stop a specific sound
    stop(id: string): void {
        const node = this.activeNodes.get(id);
        if (node) {
            try {
                node.stop();
            } catch (e) {
                // Already stopped
            }
            this.activeNodes.delete(id);
        }
    }

    // Stop all sounds in a category
    stopCategory(category: SoundCategory): void {
        this.activeNodes.forEach((node, id) => {
            const soundName = id.split('-')[0] as SoundName;
            if (SOUNDS[soundName]?.category === category) {
                this.stop(id);
            }
        });
    }

    // Stop all sounds
    stopAll(): void {
        this.activeNodes.forEach((_, id) => this.stop(id));
    }

    // Set volume for a category
    setVolume(category: SoundCategory, volume: number): void {
        this.settings[category].volume = Math.max(0, Math.min(1, volume));
        const gainNode = this.gainNodes.get(category);
        if (gainNode) {
            gainNode.gain.value = this.settings[category].volume;
        }
        this.saveSettings();
    }

    // Enable/disable a category
    setEnabled(category: SoundCategory, enabled: boolean): void {
        this.settings[category].enabled = enabled;
        if (!enabled) {
            this.stopCategory(category);
        }
        this.saveSettings();
    }

    // Get current settings
    getSettings(): SoundSettings {
        return { ...this.settings };
    }

    // Save settings to localStorage
    private saveSettings(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('soundSettings', JSON.stringify(this.settings));
        }
    }

    // Convenience methods for common sound sequences
    playBootSequence(): void {
        this.play('boot');
        setTimeout(() => this.play('connect'), 500);
    }

    playConnectionSequence(): void {
        this.play('connect');
        setTimeout(() => this.play('success'), 300);
    }

    playAttackSequence(type: 'ddos' | 'sql' | 'malware' | 'phishing' | 'mitm' = 'ddos'): void {
        this.play('attack');
        setTimeout(() => {
            if (type === 'ddos') this.play('ddos');
            else if (type === 'malware') this.play('malware');
            else this.play('breach');
        }, 200);
    }

    playDefenseSequence(): void {
        this.play('shield');
        setTimeout(() => this.play('block'), 150);
    }

    playVictory(): void {
        this.play('victory');
        this.play('success');
    }

    playDefeat(): void {
        this.play('defeat');
        this.play('error');
    }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

// Export types
export type { SoundCategory, SoundSettings, SoundName };
