'use client';

import { Bell, UserCircle, Search, Command } from 'lucide-react';
import GlobalSearch from '../search/GlobalSearch';

export default function TopNav() {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl px-6">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center max-w-xl">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search wires, trainlines, drawings, equipment..."
              className="glass-input pl-12 pr-20 py-3 text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-300 transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button>
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-700" />
          
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <span className="sr-only">Open user menu</span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-white" />
              </div>
              <span className="hidden lg:flex lg:items-center ml-3">
                <span className="text-sm font-medium text-slate-300">
                  Engineer
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}