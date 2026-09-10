import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../lib/motion';
import { useNotificationStore } from '../../store/useNotificationStore';
import Logo from '../brand/Logo';

// A notice list, not an icon rail. Each line reads as a pinned slip.
const navigation = [
  { name: 'Desk', href: '/home', note: 'where you left off' },
  { name: 'Matches', href: '/matches', note: 'people, queued and found' },
  { name: 'Chat', href: '/chat', note: 'open threads' },
  { name: 'Profile', href: '/profile', note: 'what others see' },
  { name: 'Notifications', href: '/notifications', note: null },
  { name: 'Settings', href: '/settings', note: null },
];

/*
 * The rail is dark navy in BOTH themes — it is the brand's own ground, and a
 * dark rail against a light content well is what lets the gradient indicator
 * carry. So its colours are literals, not tokens.
 */
const RAIL = 'bg-[#0C1A31]';
const RAIL_TEXT = 'text-[#E8F0FE]';
const RAIL_MUTE = 'text-[#9FB3D0]';
const RAIL_LINE = 'border-[#1E3355]';

function NavList({ onNavigate }) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const { unreadCount } = useNotificationStore();

  return (
    <nav className="flex-1 px-3 py-2" aria-label="Main">
      <ul className="space-y-0.5">
        {navigation.map((item) => {
          const isActive = (item.href === '/home' || item.href === '/profile')
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);

          return (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative block rounded py-2.5 pl-4 pr-3 transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400',
                  isActive ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                )}
              >
                {isActive && (
                  // 2px gradient rule, sliding between items — not a filled pill.
                  <motion.span
                    layoutId="sidebar-active"
                    transition={transition(snappy, reduced)}
                    className="grad-brand absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                  />
                )}
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn(
                    'text-sm',
                    isActive ? cn('font-semibold', RAIL_TEXT) : cn(RAIL_MUTE, 'group-hover:text-[#E8F0FE]')
                  )}>
                    {item.name}
                  </span>
                  {item.href === '/notifications' && unreadCount > 0 && (
                    <span className="grad-brand rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white tnum">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
                {item.note && (
                  <span className="mt-0.5 block text-[11px] leading-tight text-[#7C93B5]">
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
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-[6px]" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-0 z-40 flex">
            <div className={cn('relative flex w-full max-w-[17rem] flex-1 flex-col border-r pb-4 pt-5', RAIL, RAIL_LINE)}>
              <div className="flex items-center justify-between px-5">
                <Logo className={cn('h-7', RAIL_TEXT)} />
                <button
                  type="button"
                  aria-label="Close menu"
                  className={cn('rounded p-1 hover:text-[#E8F0FE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400', RAIL_MUTE)}
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
      <div className={cn('hidden border-r md:fixed md:inset-y-0 md:flex md:w-56 md:flex-col', RAIL, RAIL_LINE)}>
        <div className="flex flex-grow flex-col overflow-y-auto pb-4 pt-6">
          <div className="px-6">
            <Link
              to="/home"
              aria-label="CollZap home"
              className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              <Logo className={cn('h-7', RAIL_TEXT)} />
            </Link>
          </div>
          <div className="mt-8 flex flex-1 flex-col">
            <NavList />
          </div>
          <p className="flex items-center gap-2 px-6 font-mono text-[10px] uppercase tracking-widest text-[#7C93B5]">
            <span className="grad-brand h-1 w-1 rounded-full" />
            Your college only
          </p>
        </div>
      </div>
    </>
  );
}
