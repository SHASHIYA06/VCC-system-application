import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex overflow-hidden w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 animated-bg">
          {children}
        </main>
      </div>
    </div>
  );
}