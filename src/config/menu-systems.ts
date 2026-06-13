/**
 * VCC System Menu Configuration
 * Centralized configuration for all systems displayed in menu and dashboard
 */

export interface MenuSystemConfig {
  id: string;
  code: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  bgColor?: string;
  category: 'Primary' | 'Safety' | 'Secondary' | 'Auxiliary';
  isActive: boolean;
  order: number;
  route?: string;
  description?: string;
}

export const MENU_SYSTEMS_CONFIG: MenuSystemConfig[] = [
  {
    id: 'trac',
    code: 'TRAC',
    name: 'Traction Control',
    displayName: 'TRAC',
    icon: 'Zap',
    color: '#FF6B6B',
    bgColor: '#FF6B6B15',
    category: 'Primary',
    isActive: true,
    order: 1,
    description: 'Traction system with VVVF and 750V DC power'
  },
  {
    id: 'brake',
    code: 'BRAKE',
    name: 'Brake System',
    displayName: 'BRAKE',
    icon: 'Shield',
    color: '#EF4444',
    bgColor: '#EF444415',
    category: 'Primary',
    isActive: true,
    order: 2,
    description: 'Electro-pneumatic braking with BCU/BECU'
  },
  {
    id: 'door',
    code: 'DOOR',
    name: 'Door System',
    displayName: 'DOOR',
    icon: 'DoorOpen',
    color: '#F59E0B',
    bgColor: '#F59E0B15',
    category: 'Safety',
    isActive: true,
    order: 3,
    description: 'Door control with DCU and proving loops'
  },
  {
    id: 'aps',
    code: 'APS',
    name: 'Auxiliary Power',
    displayName: 'APS',
    icon: 'Battery',
    color: '#10B981',
    bgColor: '#10B98115',
    category: 'Primary',
    isActive: true,
    order: 4,
    description: 'SIV, battery, shore supply 415V/110V'
  },
  {
    id: 'vac',
    code: 'VAC',
    name: 'HVAC System',
    displayName: 'VAC',
    icon: 'Wind',
    color: '#06B6D4',
    bgColor: '#06B6D415',
    category: 'Secondary',
    isActive: true,
    order: 5,
    description: 'Cab and saloon air conditioning'
  },
  {
    id: 'tms',
    code: 'TMS',
    name: 'TCMS',
    displayName: 'TMS',
    icon: 'Cpu',
    color: '#8B5CF6',
    bgColor: '#8B5CF615',
    category: 'Primary',
    isActive: true,
    order: 6,
    description: 'Train Control Management System with RIO'
  },
  {
    id: 'comms',
    code: 'COMMS',
    name: 'Communications',
    displayName: 'COMMS',
    icon: 'Radio',
    color: '#EC4899',
    bgColor: '#EC489915',
    category: 'Secondary',
    isActive: true,
    order: 7,
    description: 'PIS, PA, CCTV, Radio, ATP interface'
  },
  {
    id: 'hv',
    code: 'HV',
    name: 'High Tension',
    displayName: 'HV',
    icon: 'Zap',
    color: '#DC2626',
    bgColor: '#DC262615',
    category: 'Safety',
    isActive: true,
    order: 8,
    description: '750V DC main power via HSCB'
  },
  {
    id: 'light',
    code: 'LIGHT',
    name: 'Interior Lighting',
    displayName: 'LIGHT',
    icon: 'Lightbulb',
    color: '#FBBF24',
    bgColor: '#FBBF2415',
    category: 'Secondary',
    isActive: true,
    order: 9,
    description: 'Head/tail lights, saloon, emergency'
  },
  {
    id: 'cab',
    code: 'CAB',
    name: 'Controlling Cab',
    displayName: 'CAB',
    icon: 'Monitor',
    color: '#6366F1',
    bgColor: '#6366F115',
    category: 'Primary',
    isActive: true,
    order: 10,
    description: 'Cab controls, driver interface, VDU'
  },
  {
    id: 'trl',
    code: 'TRL',
    name: 'Trainlines',
    displayName: 'TRL',
    icon: 'Cable',
    color: '#3B82F6',
    bgColor: '#3B82F615',
    category: 'Auxiliary',
    isActive: true,
    order: 11,
    description: 'Train control, TLSC, HCR/TCR relays'
  },
  {
    id: 'coupl',
    code: 'COUPL',
    name: 'Coupler Control',
    displayName: 'COUPL',
    icon: 'Link',
    color: '#A855F7',
    bgColor: '#A855F715',
    category: 'Auxiliary',
    isActive: true,
    order: 12,
    description: 'Coupling and uncoupling control'
  }
];

export const SYSTEM_CATEGORIES = {
  'Primary': { label: 'Primary Systems', color: '#FF6B6B' },
  'Safety': { label: 'Safety Systems', color: '#FFA500' },
  'Secondary': { label: 'Secondary Systems', color: '#96CEB4' },
  'Auxiliary': { label: 'Auxiliary Systems', color: '#3498DB' }
};

/**
 * Get system config by code
 */
export function getSystemConfig(code: string): MenuSystemConfig | undefined {
  return MENU_SYSTEMS_CONFIG.find(sys => sys.code === code);
}

/**
 * Get all active systems
 */
export function getActiveSystems(): MenuSystemConfig[] {
  return MENU_SYSTEMS_CONFIG.filter(sys => sys.isActive).sort((a, b) => a.order - b.order);
}

/**
 * Get systems by category
 */
export function getSystemsByCategory(category: string): MenuSystemConfig[] {
  return MENU_SYSTEMS_CONFIG.filter(sys => sys.category === category && sys.isActive);
}

/**
 * Get icon component name
 */
export function getIconName(code: string): string {
  const sys = getSystemConfig(code);
  return sys?.icon || 'Zap';
}

/**
 * Get color for system
 */
export function getSystemColor(code: string): string {
  const sys = getSystemConfig(code);
  return sys?.color || '#6B7280';
}

/**
 * Get background color for system
 */
export function getSystemBgColor(code: string): string {
  const sys = getSystemConfig(code);
  return sys?.bgColor || '#6B728015';
}
