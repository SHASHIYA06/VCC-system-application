import { supabase, hasValidSupabaseConfig } from './supabase';
import { System, Drawing } from '@/types';

// Mock Data
const MOCK_SYSTEMS: System[] = [
  { id: '1', code: 'TRL', name: 'Trainlines', description: 'Train Lines Control & Signal', status: 'active', icon: 'Train' },
  { id: '2', code: 'BRAKE', name: 'Brake System', description: 'Brake Loop and BCU', status: 'active', icon: 'ShieldCheck' },
];

export async function getSystems(): Promise<System[]> {
  if (!hasValidSupabaseConfig) return MOCK_SYSTEMS;
  const { data, error } = await supabase.from('systems').select('*').order('code');
  if (error) {
    console.error('getSystems error:', error);
    return MOCK_SYSTEMS;
  }
  return data || [];
}

export async function getSystemByCode(code: string): Promise<System | null> {
  if (!hasValidSupabaseConfig) return MOCK_SYSTEMS.find(s => s.code === code) || null;
  const { data, error } = await supabase.from('systems').select('*').eq('code', code).single();
  if (error) {
    console.error('getSystemByCode error:', error);
    return null;
  }
  return data;
}

export async function getDrawings(): Promise<Drawing[]> {
  if (!hasValidSupabaseConfig) return [
    { id: '1', drawing_no: '942-58103', title: 'Train Lines Control', system_code: 'TRL', status: 'active', current_revision: 'A' }
  ];
  const { data, error } = await supabase.from('drawings').select('id, drawing_no, title, current_revision, status, systems(code)').order('drawing_no');
  if (error) return [];
  return data.map((d: any) => ({ 
    ...d, 
    system_code: (Array.isArray(d.systems) && d.systems.length > 0) ? d.systems[0].code : (d.systems as any)?.code || 'GEN'
  }));
}
