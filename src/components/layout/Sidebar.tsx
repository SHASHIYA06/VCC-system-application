'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Files, 
  Map, 
  Cpu, 
  Cable, 
  Search, 
  BookOpen,
  Train,
  Settings,
  Car,
  Zap,
  Shield,
  DoorOpen,
  Wind,
  Radio,
  Battery,
  Activity,
  Wrench,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Systems', href: '/systems', icon: Map },
  { name: 'Cars', href: '/cars', icon: Car },
];

const systemNav = [
  { name: 'Trainlines', href: '/trainlines', icon: Train, color: 'cyan' },
  { name: 'Traction', href: '/systems/TRAC', icon: Zap, color: 'orange' },
  { name: 'Brake', href: '/systems/BRAKE', icon: Shield, color: 'red' },
  { name: 'Doors', href: '/systems/DOOR', icon: DoorOpen, color: 'amber' },
  { name: 'VAC/HVAC', href: '/systems/VAC', icon: Wind, color: 'emerald' },
  { name: 'TCMS', href: '/tcms', icon: Cpu, color: 'purple' },
  { name: 'Comms', href: '/systems/COMMS', icon: Radio, color: 'pink' },
  { name: 'APS', href: '/systems/APS', icon: Battery, color: 'green' },
];

const dataNav = [
  { name: 'Drawings', href: '/drawings', icon: Files },
  { name: 'Wires', href: '/wires', icon: Search },
  { name: 'Connectors', href: '/connectors', icon: Cable },
  { name: 'Equipment', href: '/equipment', icon: Cpu },
  { name: 'Pins', href: '/pins', icon: Cable },
  { name: 'VCC Reference', href: '/vcc-reference', icon: FileText },
];

const bottomNav = [
  { name: 'Learning', href: '/learning', icon: BookOpen },
  { name: 'Troubleshoot', href: '/troubleshooting', icon: Wrench },
  { name: 'Admin', href: '/admin', icon: Settings },
];

const colorClasses: Record<string, { bg: string; text: string }> = {
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400' },
};

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="flex h-full w-72 flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              VCC <span className="text-cyan-400">Explorer</span>
            </h1>
            <p className="text-xs text-slate-500">KMRCL RS3R</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-4">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 mb-1 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border-l-3 border-blue-500" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-cyan-400" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="px-3 mb-6">
          <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Core Systems
          </h3>
          <div className="space-y-1">
            {systemNav.map((item) => {
              const Icon = item.icon;
              const colors = colorClasses[item.color || 'cyan'];
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2.5 rounded-lg text-sm transition-all",
                    isActive 
                      ? "bg-slate-800/80 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg mr-3", colors.bg)}>
                    <Icon className={cn("h-4 w-4", colors.text)} />
                  </div>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="px-3 mb-6">
          <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Data Explorer
          </h3>
          <div className="space-y-1">
            {dataNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2.5 rounded-lg text-sm transition-all",
                    isActive 
                      ? "bg-slate-800/80 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  )}
                >
                  <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-cyan-400" : "text-slate-500")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="border-t border-slate-800/50 py-4 px-3">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2.5 rounded-lg text-sm transition-all",
                isActive 
                  ? "bg-slate-800/80 text-white" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              )}
            >
              <Icon className="mr-3 h-4 w-4 text-slate-500" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}