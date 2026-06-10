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
    name: 'Traction Control System',
    displayName: 'TRAC',
    icon: 'Zap',
    color: '#FF6B6B',
    bgColor: '#FF6B6B15',
    category: 'Primary',
    isActive: true,
    order: 1,
    description: 'Main traction and motor control system'
  },
  {
    id: 'tpis',
    code: 'TPIS',
    name: 'Train Protection & Warning System',
    displayName: 'TPIS',
    icon: 'AlertTriangle',
    color: '#FFA500',
    bgColor: '#FFA50015',
    category: 'Safety',
    isActive: true,
    order: 2,
    description: 'Safety and collision avoidance system'
  },
  {
    id: 'bes',
    code: 'BES',
    name: 'Braking System',
    displayName: 'BES',
    icon: 'Square',
    color: '#4ECDC4',
    bgColor: '#4ECDC415',
    category: 'Primary',
    isActive: true,
    order: 3,
    description: 'Air brake and regenerative braking control'
  },
  {
    id: 'ats',
    code: 'ATS',
    name: 'Automatic Train Stop',
    displayName: 'ATS',
    icon: 'Activity',
    color: '#45B7D1',
    bgColor: '#45B7D115',
    category: 'Safety',
    isActive: true,
    order: 4,
    description: 'Automatic train protection system'
  },
  {
    id: 'dcs',
    code: 'DCS',
    name: 'Door Control System',
    displayName: 'DCS',
    icon: 'BookOpen',
    color: '#96CEB4',
    bgColor: '#96CEB415',
    category: 'Secondary',
    isActive: true,
    order: 5,
    description: 'Door operation and safety monitoring'
  },
  {
    id: 'lcs',
    code: 'LCS',
    name: 'Lighting System',
    displayName: 'LCS',
    icon: 'Lightbulb',
    color: '#F0AD4E',
    bgColor: '#F0AD4E15',
    category: 'Secondary',
    isActive: true,
    order: 6,
    description: 'Interior and exterior lighting control'
  },
  {
    id: 'tcm',
    code: 'TCM',
    name: 'Timetable Control Module',
    displayName: 'TCM',
    icon: 'Clock',
    color: '#9B59B6',
    bgColor: '#9B59B615',
    category: 'Secondary',
    isActive: true,
    order: 7,
    description: 'Schedule and timing management'
  },
  {
    id: 'emu',
    code: 'EMU',
    name: 'Energy Management Unit',
    displayName: 'EMU',
    icon: 'Battery',
    color: '#3498DB',
    bgColor: '#3498DB15',
    category: 'Auxiliary',
    isActive: true,
    order: 8,
    description: 'Power generation and management'
  },
  {
    id: 'dmu',
    code: 'DMU',
    name: 'Diesel Multiple Unit',
    displayName: 'DMU',
    icon: 'Fuel',
    color: '#E67E22',
    bgColor: '#E67E2215',
    category: 'Auxiliary',
    isActive: true,
    order: 9,
    description: 'Diesel engine control system'
  },
  {
    id: 'cctv',
    code: 'CCTV',
    name: 'CCTV & Monitoring',
    displayName: 'CCTV',
    icon: 'Camera',
    color: '#2ECC71',
    bgColor: '#2ECC7115',
    category: 'Secondary',
    isActive: true,
    order: 10,
    description: 'Security and surveillance system'
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
