'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Search, Layers, Cpu, Cable, FileText, Settings, 
  Network, Brain, BookOpen, Wrench, Car, Train, Box, MapPin,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationGroups = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-cyan-400' },
      { name: 'Drawing Search', href: '/drawings', icon: Search, color: 'text-blue-400' },
    ]
  },
  {
    name: 'System Components',
    items: [
      { name: 'Systems', href: '/systems', icon: Layers, color: 'text-purple-400' },
      { name: 'Equipment', href: '/equipment', icon: Box, color: 'text-orange-400' },
      { name: 'Wire Harness', href: '/wires', icon: Cable, color: 'text-green-400' },
      { name: 'Connectors', href: '/connectors', icon: Cpu, color: 'text-pink-400' },
      { name: 'Pin Diagrams', href: '/pins', icon: MapPin, color: 'text-amber-400' },
      { name: 'Trainlines', href: '/trainlines', icon: Zap, color: 'text-yellow-400' },
      { name: 'Cars', href: '/cars', icon: Car, color: 'text-indigo-400' },
    ]
  },
  {
    name: 'Intelligence',
    items: [
      { name: 'AI Assistant', href: '/ai-assistant', icon: Brain, color: 'text-violet-400' },
      { name: 'GSD Topology', href: '/gsd', icon: Network, color: 'text-emerald-400' },
      { name: 'Troubleshooting', href: '/troubleshooting', icon: Wrench, color: 'text-red-400' },
    ]
  },
  {
    name: 'Documentation',
    items: [
      { name: 'VCC Reference', href: '/vcc-reference', icon: BookOpen, color: 'text-teal-400' },
      { name: 'Documents', href: '/documents', icon: FileText, color: 'text-slate-400' },
      { name: 'Reports', href: '/reports', icon: FileText, color: 'text-sky-400' },
    ]
  },
  {
    name: 'Admin',
    items: [
      { name: 'Settings', href: '/admin', icon: Settings, color: 'text-slate-400' },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300",
          "glass-card-premium !rounded-none !rounded-r-3xl border-r border-glass-border shadow-premium",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Train className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-white tracking-tight">
                VCC<span className="text-cyan-400 ml-0.5">Explorer</span>
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navigationGroups.map((group) => (
            <div key={group.name}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {group.name}
                </p>
              )}
              {collapsed && <div className="mx-3 border-t border-slate-800/40 my-2" />}
              
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && item.href !== '/dashboard' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-3 rounded-xl text-[13px] font-bold cursor-pointer transition-all duration-300 group relative font-mono tracking-wide uppercase",
                        isActive 
                          ? "bg-gradient-accent text-white shadow-glow-sm border border-white/20 scale-105 z-10" 
                          : "text-white/60 hover:text-white hover:bg-white/10 hover:shadow-inner-glow hover:scale-102"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-150",
                        isActive ? item.color : "text-slate-500 group-hover:text-slate-300"
                      )} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                      
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-2/3 rounded-r-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      )}
                      
                      {/* Collapsed tooltip */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg border border-slate-700/50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse button */}
        <div className="p-2 border-t border-slate-800/50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer */}
      <div className={cn(
        "shrink-0 transition-all duration-300",
        collapsed ? "w-[68px]" : "w-60"
      )} />
    </>
  );
}
