'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, Layers, Cpu, Cable, FileText, Settings,
  Network, Brain, BookOpen, Wrench, Train, Box, MapPin,
  ChevronLeft, ChevronRight, Zap, X, Workflow, ShieldCheck, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  countKey?: string;
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
      { name: 'Twin Explorer', href: '/twin', icon: Workflow, accent: 'text-cyan-400' },
      { name: 'Train Explorer', href: '/cars', icon: Train, accent: 'text-blue-400' },
      { name: 'Systems', href: '/systems', icon: Layers, accent: 'text-purple-400', countKey: 'systems' },
      { name: 'Equipment', href: '/equipment', icon: Box, accent: 'text-orange-400', countKey: 'devices' },
      { name: 'Connectors', href: '/connectors', icon: Cpu, accent: 'text-pink-400', countKey: 'connectors' },
      { name: 'Wire Harness', href: '/wires', icon: Cable, accent: 'text-green-400', countKey: 'wires' },
      { name: 'Pin Diagrams', href: '/pins', icon: MapPin, accent: 'text-amber-400', countKey: 'pins' },
      { name: 'Trainlines', href: '/trainlines', icon: Zap, accent: 'text-yellow-400', countKey: 'trainlines' },
    ],
  },
  {
    name: 'Documentation',
    items: [
      { name: 'Drawing Search', href: '/drawings', icon: Search, accent: 'text-blue-400', countKey: 'drawings' },
      { name: 'VCC Reference', href: '/vcc-reference', icon: BookOpen, accent: 'text-teal-400' },
      { name: 'Encyclopedia', href: '/encyclopedia', icon: Cpu, accent: 'text-amber-400' },
      { name: 'Documents', href: '/documents', icon: FileText, accent: 'text-sky-400' },
      { name: 'Reports', href: '/reports', icon: FileText, accent: 'text-sky-400' },
    ],
  },
  {
    name: 'Intelligence',
    items: [
      { name: 'GSD Topology', href: '/gsd/explore', icon: Network, accent: 'text-emerald-400' },
      { name: 'GSD Graph', href: '/gsd', icon: Network, accent: 'text-teal-400' },
      { name: 'AI Assistant', href: '/ai-assistant', icon: Brain, accent: 'text-violet-400' },
      { name: 'Validation Center', href: '/validation', icon: ShieldCheck, accent: 'text-emerald-400' },
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

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [dbOnline, setDbOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.overview) return;
        setCounts({
          systems: d.overview.systems ?? 0,
          devices: d.overview.equipment ?? 0,
          connectors: d.overview.connectors ?? 0,
          wires: d.overview.wires ?? 0,
          pins: d.overview.pins ?? 0,
          drawings: d.overview.drawings ?? 0,
          trainlines: d.overview.trainLines ?? 0,
        });
        setDbOnline(true);
      })
      .catch(() => !cancelled && setDbOnline(false));
    return () => { cancelled = true; };
  }, []);

  const isItemActive = (href: string) =>
    pathname === href ||
    (href !== '/' && href !== '/dashboard' && pathname?.startsWith(href));

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
          'transition-[width] duration-200 ease-out',
          collapsed ? 'w-[60px]' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-800/60 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Train className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
                VCC<span className="text-cyan-400 ml-0.5">Explorer</span>
              </span>
            )}
          </Link>
        </div>

        {/* Quick filter */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter..."
                aria-label="Filter navigation"
                className="w-full h-8 pl-8 pr-7 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  aria-label="Clear filter"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-4 sidebar-scroll">
          {groups.map((group) => (
            <div key={group.name}>
              {!collapsed ? (
                <p className="px-3 mb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                  {group.name}
                </p>
              ) : (
                <div className="mx-2 border-t border-slate-800/50 my-2" />
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
                        'group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium cursor-pointer',
                        'transition-colors duration-150',
                        collapsed && 'justify-center',
                        active
                          ? 'bg-cyan-500/10 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]',
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-cyan-400" />
                      )}

                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          active ? item.accent : 'text-slate-500 group-hover:text-slate-300',
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}

                      {!collapsed && item.countKey && counts[item.countKey] > 0 && (
                        <span
                          className={cn(
                            'ml-auto text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded transition-colors',
                            active
                              ? 'bg-cyan-400/15 text-cyan-300'
                              : 'text-slate-500 group-hover:text-slate-400',
                          )}
                        >
                          {formatCount(counts[item.countKey])}
                        </span>
                      )}

                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-800 text-white text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 shadow-lg border border-slate-700/60">
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

        {/* Footer */}
        <div className="border-t border-slate-800/60 p-2 shrink-0 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-500">
              <span className="relative flex h-2 w-2">
                <span
                  className={cn(
                    'absolute inline-flex h-full w-full rounded-full opacity-60',
                    dbOnline ? 'bg-emerald-400 animate-ping' : 'bg-red-400',
                  )}
                />
                <span
                  className={cn(
                    'relative inline-flex h-2 w-2 rounded-full',
                    dbOnline ? 'bg-emerald-400' : 'bg-red-400',
                  )}
                />
              </span>
              <span>{dbOnline ? 'Connected' : 'Offline'}</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-colors cursor-pointer"
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

      <div
        suppressHydrationWarning
        className={cn('shrink-0 transition-[width] duration-200 ease-out', collapsed ? 'w-[60px]' : 'w-60')}
      />
    </>
  );
}
