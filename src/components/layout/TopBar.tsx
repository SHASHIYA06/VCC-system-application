'use client';

import { useState } from 'react';
import { Bell, Search, Command, MessageSquare, Sparkles, Zap } from 'lucide-react';
import GlobalSearch from '../search/GlobalSearch';

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-glass-border glass-card-premium backdrop-blur-4xl shadow-premium">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          
          {/* Left Section - Enhanced Title */}
          <div className="flex-1 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-accent-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neon font-mono uppercase tracking-wider">
                  VCC System
                </h2>
                <p className="text-xs text-white/60 font-medium">
                  Quantum Railway Control Interface
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Enhanced Search (Always Visible) */}
          <div className="flex-1 max-w-2xl mx-4">
            <GlobalSearch />
          </div>

          {/* Right Section - Enhanced */}
          <div className="flex items-center gap-4">
            
            {/* AI Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl glass-card-premium border border-glass-border">
              <Zap className="w-4 h-4 text-accent-400 animate-pulse" />
              <span className="text-xs text-white/80 font-bold font-mono">AI ACTIVE</span>
            </div>

            {/* Enhanced Notification Buttons */}
            <button className="relative p-3 text-white/60 hover:text-white glass-card-medium hover:glass-card-premium rounded-2xl transition-all hover:shadow-glow-sm group">
              <span className="sr-only">Messages</span>
              <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse shadow-glow-sm"></span>
            </button>
            
            <button className="relative p-3 text-white/60 hover:text-white glass-card-medium hover:glass-card-premium rounded-2xl transition-all hover:shadow-glow-sm group">
              <span className="sr-only">Notifications</span>
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-glow-sm"></span>
            </button>

            {/* Enhanced User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-glass-border">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-white font-mono leading-tight">Alex Carter</div>
                <div className="text-xs text-accent-400 leading-tight font-medium">System Administrator</div>
              </div>
              <div className="relative group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center text-white text-sm font-bold shadow-glow-lg border-2 border-white/20 hover:scale-105 transition-all">
                  AC
                </div>
                {/* Enhanced Status Indicator */}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-glass-border bg-green-500 shadow-glow-sm">
                  <span className="absolute inset-0 w-full h-full rounded-full bg-green-400 animate-ping opacity-75"></span>
                </span>
                
                {/* Holographic accent */}
                <div className="absolute -inset-1 bg-gradient-accent rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"></div>
    </header>
  );
}
