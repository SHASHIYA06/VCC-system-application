import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SYSTEMS_STATIC = [
  { id: 'sys-tcms', code: 'TCMS', name: 'Train Control & Monitoring System', category: 'CONTROL', description: 'Central train control and monitoring', icon_name: 'cpu', sort_order: 1, color_hex: '#3B82F6' },
  { id: 'sys-cctv', code: 'CCTV', name: 'Closed Circuit Television', category: 'AUDIO_VIDEO', description: 'Interior and exterior surveillance cameras', icon_name: 'video', sort_order: 2, color_hex: '#8B5CF6' },
  { id: 'sys-door', code: 'DOOR', name: 'Door Control System', category: 'MECHANICAL', description: 'Passenger and emergency door control', icon_name: 'door-open', sort_order: 3, color_hex: '#10B981' },
  { id: 'sys-aau', code: 'AAU', name: 'Passenger Address & Alarm', category: 'COMMUNICATION', description: 'PA system and emergency alarm units', icon_name: 'volume-2', sort_order: 4, color_hex: '#F59E0B' },
  { id: 'sys-pis', code: 'PIS', name: 'Passenger Information System', category: 'DISPLAY', description: 'TFT displays and passenger information', icon_name: 'monitor', sort_order: 5, color_hex: '#06B6D4' },
  { id: 'sys-vac', code: 'VAC', name: 'Ventilation & Air Conditioning', category: 'HVAC', description: 'Climate control system', icon_name: 'wind', sort_order: 6, color_hex: '#14B8A6' },
  { id: 'sys-becu', code: 'BECU', name: 'Brake Electronic Control Unit', category: 'BRAKE', description: 'Electronic brake control system', icon_name: 'disc-3', sort_order: 7, color_hex: '#EF4444' },
  { id: 'sys-edb', code: 'EDB', name: 'Electrical Distribution Box', category: 'POWER', description: 'Power distribution and protection', icon_name: 'zap', sort_order: 8, color_hex: '#F97316' },
  { id: 'sys-lteb', code: 'LTEB', name: 'Low Tension Equipment Box', category: 'POWER', description: 'Low voltage power distribution', icon_name: 'battery', sort_order: 9, color_hex: '#84CC16' },
  { id: 'sys-ltjb', code: 'LTJB', name: 'Low Tension Junction Box', category: 'POWER', description: 'Low voltage junction and distribution', icon_name: 'box', sort_order: 10, color_hex: '#A3E635' },
  { id: 'sys-lighting', code: 'LIGHTING', name: 'Interior Lighting System', category: 'ELECTRICAL', description: 'Saloon and interior lighting', icon_name: 'lightbulb', sort_order: 11, color_hex: '#FBBF24' },
  { id: 'sys-comm', code: 'COMM', name: 'Communication System', category: 'NETWORK', description: 'TCMS communication nodes and switches', icon_name: 'network', sort_order: 12, color_hex: '#6366F1' },
  { id: 'sys-display', code: 'DISPLAY', name: 'Display System', category: 'DISPLAY', description: 'TFT and message display units', icon_name: 'screen', sort_order: 13, color_hex: '#EC4899' },
  { id: 'sys-brake', code: 'BRAKE', name: 'Brake System', category: 'BRAKE', description: 'Brake system monitoring and control', icon_name: 'alert-circle', sort_order: 14, color_hex: '#DC2626' },
  { id: 'sys-fam', code: 'FAM', name: 'Fire Alarm Module', category: 'SAFETY', description: 'Fire detection and alarm system', icon_name: 'flame', sort_order: 15, color_hex: '#B91C1C' },
  { id: 'sys-tms', code: 'TMS', name: 'Train Management System', category: 'CONTROL', description: 'Train management and monitoring', icon_name: 'layers', sort_order: 16, color_hex: '#0EA5E9' },
];

export async function GET() {
  try {
    const dbSystems = await prisma.system.findMany({ orderBy: { name: 'asc' } });
    const systems = dbSystems.map((s, i) => {
      const static_ = SYSTEMS_STATIC.find(x => x.code === s.code || x.name === s.name);
      return {
        id: s.id,
        code: s.code || s.name,
        name: s.name,
        category: static_?.category || 'ELECTRICAL',
        description: s.description || static_?.description || '',
        icon_name: static_?.icon_name || 'cpu',
        sort_order: static_?.sort_order || i + 1,
        color_hex: static_?.color_hex || '#6B7280',
      };
    });
    return NextResponse.json({ systems, count: systems.length });
  } catch {
    return NextResponse.json({ systems: SYSTEMS_STATIC, count: SYSTEMS_STATIC.length });
  }
}