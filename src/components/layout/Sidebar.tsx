'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  Layers, 
  Cpu, 
  Cable, 
  FileText, 
  Settings, 
  Network, 
  Brain, 
  BookOpen, 
  Wrench,
  Car,
  Train,
  Box,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationGroups = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Drawing Search', href: '/drawings', icon: Search },
    ]
  },
  {
    name: 'System Components',
    items: [
      { name: 'Systems', href: '/systems', icon: Layers },
      { name: 'Equipment', href: '/equipment', icon: Box },
      { name: 'Wire Harness', href: '/wires', icon: Cable },
      { name: 'Connectors', href: '/connectors', icon: Cpu },
      { name: 'Trainlines', href: '/trainlines', icon: Train },
      { name: 'Cars', href: '/cars', icon: Car },
    ]
  },
  {
    name: 'Intelligence & Analysis',
    items: [
      { name: 'Intelligence & AI', href: '/ai-assistant', icon: Brain },
      { name: 'GSD Pi', href: '/gsd', icon: Network },
      { name: 'Troubleshooting', href: '/troubleshooting', icon: Wrench },
    ]
  },
  {
    name: 'Documentation',
    items: [
      { name: 'VCC Description', href: '/vcc-reference', icon: BookOpen },
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'Reports', href: '/reports', icon: FileText },
    ]
  },
  {
    name: 'Management',
    items: [
      { name: 'Admin', href: '/admin', icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800/80 backdrop-blur-md z-40 transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Train className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                VCC <span className="text-cyan-400">Explorer</span>
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-md shadow-cyan-500/20 mx-auto">
              <Train className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {navigationGroups.map((group) => (
            <div key={group.name}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {group.name}
                  </span>
                </div>
              )}
              {collapsed && (
                <div className="border-t border-slate-800 my-2"></div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || 
                                   (item.href !== '/' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        isActive
                          ? "text-white bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-l-2 border-cyan-400"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                      )} />
                      {!collapsed && <span>{item.name}</span>}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-slate-800 z-50">
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

        {/* Collapse Toggle Button */}
        <div className="p-2 border-t border-slate-800/80">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-all"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer to prevent content from going under sidebar */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )} />
    </>
  );
}
