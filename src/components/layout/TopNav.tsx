'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Command, MessageSquare, Train, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TopNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Drawing Search', href: '/drawings' },
    { name: 'Systems', href: '/systems' },
    { name: 'Equipment', href: '/equipment' },
    { name: 'Wire Harness', href: '/wires' },
    { name: 'Reports', href: '/reports' },
    { name: 'Admin', href: '/admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Train className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
              VCC <span className="text-cyan-400">Explorer</span>
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent",
                    isActive
                      ? "text-white bg-slate-800/80 border-b-cyan-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Quick Search - Desktop */}
            <div className="relative hidden lg:block w-48 xl:w-64">
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg bg-slate-900/60 border border-slate-850 focus:border-cyan-500 text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-500 font-mono">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </div>
            </div>

            {/* Notification and Message Icons */}
            <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-lg transition-all relative">
              <span className="sr-only">Messages</span>
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            </button>
            
            <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-lg transition-all relative">
              <span className="sr-only">Notifications</span>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white leading-tight">Alex Carter</div>
                <div className="text-[10px] text-slate-400 leading-tight">Admin</div>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                  AC
                </div>
                {/* Status Dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-950 bg-green-500 animate-pulse"></span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-base font-medium transition-all",
                  isActive
                    ? "text-white bg-slate-800"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}