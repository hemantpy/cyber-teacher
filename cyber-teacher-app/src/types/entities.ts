// Entity type definitions for the 2D cybersecurity simulator

export type EntityType =
  | "PC"
  | "Router"
  | "Firewall"
  | "ISP"
  | "DNS"
  | "Server"
  | "Attacker"
  | "Cloud";

export type EntityStatus =
  | "idle"
  | "active"
  | "under_attack"
  | "blocked"
  | "connecting"
  | "disconnected"
  | "overloaded"
  | "compromised"
  | "processing";

export interface Position {
  x: number;
  y: number;
}

export interface EntityMetadata {
  ip?: string;
  ports?: number[];
  protocol?: string;
  risk?: number;
  label?: string;
  hostname?: string;
}

export interface NetworkEntity {
  id: string;
  type: EntityType;
  position: Position;
  status: EntityStatus;
  metadata: EntityMetadata;
  health?: number; // 0-100
}

// Visual configuration for each entity type
export const ENTITY_VISUALS: Record<EntityType, {
  shape: 'rectangle' | 'circle' | 'hexagon' | 'triangle' | 'shield' | 'cloud' | 'stack';
  color: string;
  icon: string;
  size: { width: number; height: number };
}> = {
  PC: {
    shape: 'rectangle',
    color: '#3B82F6', // blue
    icon: 'PC',
    size: { width: 60, height: 50 }
  },
  Router: {
    shape: 'rectangle',
    color: '#8B5CF6', // purple
    icon: 'RTR',
    size: { width: 70, height: 40 }
  },
  Firewall: {
    shape: 'shield',
    color: '#F59E0B', // amber
    icon: 'FW',
    size: { width: 50, height: 60 }
  },
  ISP: {
    shape: 'circle',
    color: '#6366F1', // indigo
    icon: 'ISP',
    size: { width: 60, height: 60 }
  },
  DNS: {
    shape: 'hexagon',
    color: '#A855F7', // purple
    icon: 'DNS',
    size: { width: 55, height: 55 }
  },
  Server: {
    shape: 'stack',
    color: '#10B981', // emerald
    icon: 'SRV',
    size: { width: 50, height: 65 }
  },
  Attacker: {
    shape: 'triangle',
    color: '#EF4444', // red
    icon: 'ATK',
    size: { width: 50, height: 50 }
  },
  Cloud: {
    shape: 'cloud',
    color: '#0EA5E9', // sky
    icon: 'CLD',
    size: { width: 80, height: 50 }
  }
};
