'use client';

// Cyber-styled icon components using Lucide React
// All icons have consistent styling with optional glow effects

import {
    Monitor,
    Router,
    Shield,
    ShieldCheck,
    ShieldAlert,
    ShieldOff,
    Globe,
    Server,
    Cloud,
    Skull,
    Zap,
    Database,
    Bug,
    Fish,
    Eye,
    Flame,
    Ban,
    Timer,
    Search,
    Lock,
    Terminal,
    Swords,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Play,
    Pause,
    RotateCcw,
    Settings,
    Info,
    HelpCircle,
    Home,
    BookOpen,
    Map,
    FlaskConical,
    Cpu,
    Network,
    Wifi,
    WifiOff,
    type LucideIcon,
} from 'lucide-react';
import { CSSProperties, forwardRef } from 'react';

// Icon size presets
export const ICON_SIZES = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

type IconSize = keyof typeof ICON_SIZES | number;

interface CyberIconProps {
    icon: LucideIcon;
    size?: IconSize;
    color?: string;
    glow?: boolean;
    glowColor?: string;
    glowIntensity?: number;
    className?: string;
    style?: CSSProperties;
    animate?: 'pulse' | 'spin' | 'bounce' | 'none';
}

// Base cyber icon wrapper with glow support
export const CyberIcon = forwardRef<SVGSVGElement, CyberIconProps>(({
    icon: Icon,
    size = 'md',
    color = 'currentColor',
    glow = false,
    glowColor,
    glowIntensity = 10,
    className = '',
    style = {},
    animate = 'none',
}, ref) => {
    const pixelSize = typeof size === 'number' ? size : ICON_SIZES[size];
    const effectiveGlowColor = glowColor || color;

    const animationClass = {
        pulse: 'animate-pulse',
        spin: 'animate-spin',
        bounce: 'animate-bounce',
        none: '',
    }[animate];

    const glowStyle: CSSProperties = glow ? {
        filter: `drop-shadow(0 0 ${glowIntensity}px ${effectiveGlowColor})`,
    } : {};

    return (
        <Icon
            ref={ref}
            size={pixelSize}
            color={color}
            className={`${animationClass} ${className}`}
            style={{ ...glowStyle, ...style }}
            strokeWidth={1.5}
        />
    );
});

CyberIcon.displayName = 'CyberIcon';

// Preset icon components for common use cases
// Entity Icons
export const PCIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Monitor} color="#3B82F6" {...props} />
));
PCIcon.displayName = 'PCIcon';

export const RouterIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Router} color="#8B5CF6" {...props} />
));
RouterIcon.displayName = 'RouterIcon';

export const FirewallIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Shield} color="#F59E0B" {...props} />
));
FirewallIcon.displayName = 'FirewallIcon';

export const ISPIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Globe} color="#6366F1" {...props} />
));
ISPIcon.displayName = 'ISPIcon';

export const DNSIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Network} color="#A855F7" {...props} />
));
DNSIcon.displayName = 'DNSIcon';

export const ServerIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Server} color="#10B981" {...props} />
));
ServerIcon.displayName = 'ServerIcon';

export const AttackerIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Skull} color="#EF4444" {...props} />
));
AttackerIcon.displayName = 'AttackerIcon';

export const CloudIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Cloud} color="#0EA5E9" {...props} />
));
CloudIcon.displayName = 'CloudIcon';

// Attack Icons
export const DDoSIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Zap} color="#EF4444" {...props} />
));
DDoSIcon.displayName = 'DDoSIcon';

export const SQLInjectionIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Database} color="#F97316" {...props} />
));
SQLInjectionIcon.displayName = 'SQLInjectionIcon';

export const MalwareIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Bug} color="#DC2626" {...props} />
));
MalwareIcon.displayName = 'MalwareIcon';

export const PhishingIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Fish} color="#FBBF24" {...props} />
));
PhishingIcon.displayName = 'PhishingIcon';

export const MITMIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Eye} color="#F472B6" {...props} />
));
MITMIcon.displayName = 'MITMIcon';

// Defense Icons
export const DefenseFirewallIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Flame} color="#22C55E" {...props} />
));
DefenseFirewallIcon.displayName = 'DefenseFirewallIcon';

export const BlockIPIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Ban} color="#EF4444" {...props} />
));
BlockIPIcon.displayName = 'BlockIPIcon';

export const RateLimitIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Timer} color="#F59E0B" {...props} />
));
RateLimitIcon.displayName = 'RateLimitIcon';

export const DNSFilterIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Search} color="#3B82F6" {...props} />
));
DNSFilterIcon.displayName = 'DNSFilterIcon';

export const QuarantineIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Lock} color="#8B5CF6" {...props} />
));
QuarantineIcon.displayName = 'QuarantineIcon';

// Status Icons
export const TerminalIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Terminal} {...props} />
));
TerminalIcon.displayName = 'TerminalIcon';

export const AttackSwordsIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Swords} color="#EF4444" {...props} />
));
AttackSwordsIcon.displayName = 'AttackSwordsIcon';

export const DefenseShieldIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={ShieldCheck} color="#22C55E" {...props} />
));
DefenseShieldIcon.displayName = 'DefenseShieldIcon';

export const HealthIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Activity} {...props} />
));
HealthIcon.displayName = 'HealthIcon';

export const WarningIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={AlertTriangle} color="#F59E0B" {...props} />
));
WarningIcon.displayName = 'WarningIcon';

export const SuccessIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={CheckCircle} color="#22C55E" {...props} />
));
SuccessIcon.displayName = 'SuccessIcon';

export const ErrorIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={XCircle} color="#EF4444" {...props} />
));
ErrorIcon.displayName = 'ErrorIcon';

// Control Icons
export const PlayIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Play} {...props} />
));
PlayIcon.displayName = 'PlayIcon';

export const PauseIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Pause} {...props} />
));
PauseIcon.displayName = 'PauseIcon';

export const ResetIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={RotateCcw} {...props} />
));
ResetIcon.displayName = 'ResetIcon';

export const SettingsIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Settings} {...props} />
));
SettingsIcon.displayName = 'SettingsIcon';

// Navigation Icons
export const HomeIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Home} {...props} />
));
HomeIcon.displayName = 'HomeIcon';

export const LessonsIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={BookOpen} {...props} />
));
LessonsIcon.displayName = 'LessonsIcon';

export const CampaignIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Map} {...props} />
));
CampaignIcon.displayName = 'CampaignIcon';

export const SandboxIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={FlaskConical} {...props} />
));
SandboxIcon.displayName = 'SandboxIcon';

export const InfoIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Info} {...props} />
));
InfoIcon.displayName = 'InfoIcon';

export const HelpIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={HelpCircle} {...props} />
));
HelpIcon.displayName = 'HelpIcon';

export const CpuIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Cpu} {...props} />
));
CpuIcon.displayName = 'CpuIcon';

export const NetworkIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Network} {...props} />
));
NetworkIcon.displayName = 'NetworkIcon';

export const WifiIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={Wifi} {...props} />
));
WifiIcon.displayName = 'WifiIcon';

export const WifiOffIcon = forwardRef<SVGSVGElement, Omit<CyberIconProps, 'icon'>>((props, ref) => (
    <CyberIcon ref={ref} icon={WifiOff} {...props} />
));
WifiOffIcon.displayName = 'WifiOffIcon';

// Entity type to icon mapping
export const ENTITY_ICONS: Record<string, LucideIcon> = {
    PC: Monitor,
    Router: Router,
    Firewall: Shield,
    ISP: Globe,
    DNS: Network,
    Server: Server,
    Attacker: Skull,
    Cloud: Cloud,
};

// Get icon component for entity type
export function getEntityIcon(entityType: string): LucideIcon {
    return ENTITY_ICONS[entityType] || Monitor;
}
