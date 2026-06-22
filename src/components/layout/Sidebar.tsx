'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, Layers, Cpu, Cable, FileText, Settings,
  Network, Brain, BookOpen, Wrench, Train, Box, MapPin,
  ChevronLeft, ChevronRight, Zap, X, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Tailwind text color used for the icon when active/hovered */
  accent: string;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, accent: 'text-cyan-400' },
    ],
  },
  {
    name: 'Digital Twin',
    items: [
      { name: 'Train Explorer', href: '/cars', icon: Train, accent: 'text-blue-400' },
      { name: 'Systems', href: '/systems', icon: Layers, accent: 'text-purple-400' },
      { name: 'Equipment', href: '/equipment', icon: Box, accent: 'text-orange-400' },
      { name: 'Connectors', href: '/connectors', icon: Cpu, accent: 'text-pink-400' },
      { name: 'Wire Harness', href: '/wires', icon: Cable, accent: 'text-green-400' },
      { name: 'Pin Diagrams', href: '/pins', icon: MapPin, accent: 'text-amber-400' },
      { name: 'Trainlines', href: '/trainlines', icon: Zap, accent: 'text-yellow-400' },
    ],
  },
  {
    name: 'Documentation',
    items: [
      { name: 'Drawing Search', href: '/drawings', icon: Search, accent: 'text-blue-400' },
      { name: 'VCC Reference', href: '/vcc-reference', icon: BookOpen, accent: 'text-teal-400' },
      { name: 'Reports', href: '/reports', icon: FileText, accent: 'text-sky-400' },
    ],
  },
  {
    name: 'Intelligence',
    items: [
      { name: 'GSD Pi Topology', href: '/gsd', icon: Network, accent: 'text-emerald-400' },
      { name: 'AI Assistant', href: '/ai-assistant', icon: Brain, accent: 'text-violet-400' },
      { name: 'Troubleshooting', href: '/troubleshooting', icon: Wrench, accent: 'text-red-400' },
    ],
  },
  {
    name: 'Admin',
    items: [
      { name: 'Settings', href: '/admin', icon: Settings, accent: 'text-slate-400' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('');

  const isItemActive = (href: string) =>
    pathname === href ||
    (href !== '/' && href !== '/dashboard' && pathname?.startsWith(href));

  // Filter nav items by the quick-search box (only when expanded).
  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return navigationGroups;
    return navigationGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.name.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [filter]);

  return (
    <>
      <aside
        suppressHydrationWarning
        aria-label="Primary navigation"
        className={cn(
          'fixed left-0 top-0 h-screen z-40 flex flex-col',
          'bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/60',
          'shadow-[8px_0_30px_-12px_rgba(0,0,0,0.7)]',
          'transition-[width] duration-300 ease-out',
          collapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3.5 border-b border-slate-800/60 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0 transition-shadow duration-200 group-hover:shadow-cyan-400/50">
              <Train className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
                VCC<span className="text-cyan-400 ml-0.5">Explorer</span>
              </span>
            )}
          </Link>
        </div>

        {/* Quick filter (expanded only) */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter menu..."
                aria-label="Filter navigation"
                className="w-full h-9 pl-8 pr-7 rounded-lg bg-slate-900/70 border border-slate-800 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-cyan-500/60 focus:bg-slate-900"
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  aria-label="Clear filter"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4 sidebar-scroll">
          {groups.map((group) => (
            <div key={group.name}>
              {!collapsed ? (
                <p className="px-3 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em]">
                  {group.name}
                </p>
              ) : (
                <div className="mx-3 border-t border-slate-800/50 my-2" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isItemActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer',
                        'transition-colors duration-200',
                        collapsed && 'justify-center',
                        active
                          ? 'bg-cyan-500/10 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]',
                      )}
                    >
                      {/* Active indicator bar (no layout shift) */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                      )}

                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
                          active ? item.accent : 'text-slate-500 group-hover:text-slate-200',
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}

                      {/* Collapsed tooltip */}
                      {collapsed && (
                        <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-slate-800 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 z-50 shadow-lg border border-slate-700/60">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="px-3 py-4 text-xs text-slate-500 text-center">No matches</p>
          )}
        </nav>

        {/* Footer: status + collapse */}
        <div className="border-t border-slate-800/60 p-2 shrink-0 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span>Database connected</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
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

      {/* Spacer keeps content clear of the fixed sidebar */}
      <div
        suppressHydrationWarning
        className={cn('shrink-0 transition-[width] duration-300 ease-out', collapsed ? 'w-[68px]' : 'w-64')}
      />
    </>
  );
}
