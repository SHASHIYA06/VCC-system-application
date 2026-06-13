import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-slate-950 text-slate-100">
      {/* Left Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area - flush with sidebar, no gaps */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-slate-950">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content - full width, responsive padding */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto bg-slate-950">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}