import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-slate-950 text-slate-100">
      {/* Left Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area - no extra padding/gap needed since Sidebar includes spacer */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content - removed excessive padding */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}