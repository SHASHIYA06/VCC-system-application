import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-slate-950 text-slate-100">
      {/* Left Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar (User profile, notifications, search) */}
        <TopBar />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 animated-bg overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}