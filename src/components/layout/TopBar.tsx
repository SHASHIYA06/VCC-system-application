'use client';

import { useState } from 'react';
import { Bell, Search, Command, MessageSquare } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Page Title or Breadcrumbs (can be dynamic later) */}
          <div className="flex-1">
            <h2 className="text-sm font-medium text-slate-400">
              Welcome to VCC System
            </h2>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden lg:block w-64">
              <input
                type="text"
                placeholder="Quick search... (Ctrl+K)"
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-inner cursor-pointer hover:scale-105 transition-transform">
                  AC
                </div>
                {/* Status Dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-950 bg-green-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
