import TopNav from './TopNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-950 text-slate-100 overflow-x-hidden">
      <TopNav />
      <main className="flex-1 p-4 lg:p-8 animated-bg overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}