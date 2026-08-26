import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Home, MessageSquare, Users, User, Bell, Settings, X } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Matches', href: '/matches', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();

  const NavLinks = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            <item.icon
              className={cn(
                isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500',
                'mr-3 flex-shrink-0 h-6 w-6'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="relative z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-0 z-40 flex">
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-shrink-0 items-center px-4">
                <span className="text-2xl font-bold text-brand-600">CollZap</span>
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <NavLinks />
              </div>
            </div>
            <div className="w-14 flex-shrink-0" aria-hidden="true">{/* Dummy element to force sidebar to shrink to fit close icon */}</div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-grow flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <span className="text-2xl font-bold text-brand-600">CollZap</span>
          </div>
          <div className="mt-5 flex flex-1 flex-col">
            <NavLinks />
          </div>
        </div>
      </div>
    </>
  );
}
