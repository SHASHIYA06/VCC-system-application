import Link from 'next/link';
import { 
  LayoutDashboard, 
  Files, 
  Map, 
  Cpu, 
  Cable, 
  Search, 
  BookOpen,
  Train,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Master Register', href: '/drawings', icon: Files },
  { name: 'System Explorer', href: '/systems', icon: Map },
  { name: 'Equipment Library', href: '/equipment', icon: Cpu },
  { name: 'Connectors & Pins', href: '/connectors', icon: Cable },
  { name: 'Wire Intelligence', href: '/wires', icon: Search },
  { name: 'Trainlines', href: '/trainlines', icon: Train },
  { name: 'TCMS Points', href: '/tcms', icon: Cpu },
  { name: 'Learning Mode', href: '/learning', icon: BookOpen },
  { name: 'Admin', href: '/admin', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 shrink-0 items-center px-6 bg-slate-950 border-b border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-white">
          KMRCL VCC <span className="text-blue-400">Explorer</span>
        </h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
