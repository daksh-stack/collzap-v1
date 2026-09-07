import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../lib/motion';
import { useNotificationStore } from '../../store/useNotificationStore';

// A notice list, not an icon rail. Each line reads as a pinned slip.
const navigation = [
  { name: 'Desk', href: '/', note: 'where you left off' },
  { name: 'Matches', href: '/matches', note: 'people, queued and found' },
  { name: 'Chat', href: '/chat', note: 'open threads' },
  { name: 'Profile', href: '/profile', note: 'what others see' },
  { name: 'Feedback', href: '/feedback', note: 'ideas & suggestions' },
  { name: 'Notifications', href: '/notifications', note: null },
  { name: 'Settings', href: '/settings', note: null },
];

function NavList({ onNavigate }) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { unreadCount } = useNotificationStore();

  return (
    <nav className="flex-1 px-3 py-2" aria-label="Main">
      <ul className="space-y-0.5">
        {navigation.map((item) => {
          const isActive = (item.href === '/' || item.href === '/profile')
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);

          return (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative block rounded py-2.5 pl-4 pr-3 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                  isActive ? 'bg-ink/[0.035]' : 'hover:bg-ink/[0.025]'
                )}
              >
                {isActive && (
                  // 2px accent rule, sliding between items — not a filled pill.
                  <motion.span
                    layoutId="sidebar-active"
                    transition={transition(snappy, reduced)}
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-sm bg-accent-500"
                  />
                )}
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn(
                    'text-sm',
                    isActive ? 'font-semibold text-ink' : 'text-mute group-hover:text-ink'
                  )}>
                    {item.name}
                  </span>
                  {item.href === '/notifications' && unreadCount > 0 && (
                    <span className="font-mono text-[10px] text-accent-700 tnum">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
                {item.note && (
                  <span className="mt-0.5 block text-[11px] leading-tight text-mute/70">
                    {item.note}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile */}
      {mobileOpen && (
        <div className="relative z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-ink/35 backdrop-blur-[6px]" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-0 z-40 flex">
            <div className="relative flex w-full max-w-[17rem] flex-1 flex-col border-r border-line bg-paper pt-5 pb-4">
              <div className="flex items-center justify-between px-5">
                <span className="font-display text-lg font-semibold tracking-tightest text-ink">
                  CollZap
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="rounded p-1 text-mute hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 h-0 flex-1 overflow-y-auto">
                <NavList onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-56 md:flex-col border-r border-line bg-paper">
        <div className="flex flex-grow flex-col overflow-y-auto pb-4 pt-6">
          <div className="px-6">
            <Link
              to="/"
              className="font-display text-lg font-semibold tracking-tightest text-ink rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              CollZap
            </Link>
          </div>
          <div className="mt-8 flex flex-1 flex-col">
            <NavList />
          </div>
          <p className="px-6 font-mono text-[10px] uppercase tracking-widest text-mute/60">
            Your college only
          </p>
        </div>
      </div>
    </>
  );
}
