import { 
  Swords, 
  Sparkles, 
  Star, 
  Skull,
  Users, 
  Flag, 
  BookOpen, 
  MapPin, 
  Zap,
  type LucideIcon
} from 'lucide-react';

export type EventType = 
  | 'battle'
  | 'discovery'
  | 'birth'
  | 'death'
  | 'meeting'
  | 'political'
  | 'cultural'
  | 'location'
  | 'other';

export interface EventTypeConfig {
  icon: string; // Icon name (e.g., 'Swords')
  iconComponent: LucideIcon; // Actual icon component for rendering
  color: string;
  label: string;
  description: string;
}

export const EVENT_TYPE_CONFIGS: Record<EventType, EventTypeConfig> = {
  battle: {
    icon: 'Swords',
    iconComponent: Swords,
    color: '#ef4444', // red-500
    label: 'Battle',
    description: 'Military conflicts and combat',
  },
  discovery: {
    icon: 'Sparkles',
    iconComponent: Sparkles,
    color: '#8b5cf6', // violet-500
    label: 'Discovery',
    description: 'New findings and revelations',
  },
  birth: {
    icon: 'Star',
    iconComponent: Star,
    color: '#3b82f6', // blue-500
    label: 'Birth',
    description: 'Character births and beginnings',
  },
  death: {
    icon: 'Skull',
    iconComponent: Skull,
    color: '#6b7280', // gray-500
    label: 'Death',
    description: 'Character deaths and endings',
  },
  meeting: {
    icon: 'Users',
    iconComponent: Users,
    color: '#10b981', // emerald-500
    label: 'Meeting',
    description: 'Important gatherings and encounters',
  },
  political: {
    icon: 'Flag',
    iconComponent: Flag,
    color: '#f59e0b', // amber-500
    label: 'Political',
    description: 'Political events and decisions',
  },
  cultural: {
    icon: 'BookOpen',
    iconComponent: BookOpen,
    color: '#ec4899', // pink-500
    label: 'Cultural',
    description: 'Cultural events and traditions',
  },
  location: {
    icon: 'MapPin',
    iconComponent: MapPin,
    color: '#14b8a6', // teal-500
    label: 'Location',
    description: 'Location-based events',
  },
  other: {
    icon: 'Zap',
    iconComponent: Zap,
    color: '#a855f7', // purple-500
    label: 'Other',
    description: 'Miscellaneous events',
  },
};

export function getEventTypeConfig(eventType: string | null): EventTypeConfig {
  if (!eventType || !(eventType in EVENT_TYPE_CONFIGS)) {
    return EVENT_TYPE_CONFIGS.other;
  }
  return EVENT_TYPE_CONFIGS[eventType as EventType];
}

export function getEventTypeIcon(eventType: string | null): LucideIcon {
  return getEventTypeConfig(eventType).iconComponent;
}

export function getEventTypeIconName(eventType: string | null): string {
  return getEventTypeConfig(eventType).icon;
}

export function getEventTypeColor(eventType: string | null): string {
  return getEventTypeConfig(eventType).color;
}

export const EVENT_TYPES = Object.keys(EVENT_TYPE_CONFIGS) as EventType[];
