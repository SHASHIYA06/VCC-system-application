import { Bell, UserCircle } from 'lucide-react';
import GlobalSearch from '../search/GlobalSearch';

export default function TopNav() {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center max-w-lg">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />
          
          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5"
              id="user-menu-button"
            >
              <span className="sr-only">Open user menu</span>
              <UserCircle className="h-8 w-8 text-slate-400 bg-slate-50 rounded-full" />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-slate-900" aria-hidden="true">
                  Engineer Profile
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
