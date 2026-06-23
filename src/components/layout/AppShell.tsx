'use client';

import dynamic from 'next/dynamic';
import TopBar from './TopBar';

// Import Sidebar dynamically with SSR disabled to prevent hydration mismatches
const Sidebar = dynamic(() => import('./Sidebar'), {
  ssr: false,
  loading: () => (
    <div className="w-60 bg-slate-900/50 border-r border-slate-800/50" />
  ),
});

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full text-slate-100 bg-transparent relative z-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
