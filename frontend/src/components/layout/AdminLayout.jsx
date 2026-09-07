import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';

const navigation = [
  { name: 'Overview', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Verifications', href: '/admin/verifications' },
  { name: 'Matches', href: '/admin/matches' },
  { name: 'Queue', href: '/admin/queue' },
  { name: 'Reports', href: '/admin/reports' },
  { name: 'Feedback', href: '/admin/feedback' },
  { name: 'Colleges', href: '/admin/colleges' },
  { name: 'Questions', href: '/admin/questions' },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const NavLinks = ({ onNavigate }) => (
    <nav className="flex-1 px-3" aria-label="Admin">
      <ul>
        {navigation.map((item) => {
          const isActive = item.href === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.href);
          return (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative block rounded px-3 py-2 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                  isActive
                    ? 'bg-ink/[0.05] font-semibold text-ink'
                    : 'text-mute hover:bg-ink/[0.03] hover:text-ink'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-sm bg-accent-500" />
                )}
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Mobile */}
      {mobileOpen && (
        <div className="relative z-40 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-0 z-40 flex">
            <div className="relative flex w-full max-w-[16rem] flex-1 flex-col border-r border-line bg-paper pt-5 pb-4">
              <div className="flex items-center justify-between px-5">
                <span className="font-display text-base font-semibold tracking-tight text-ink">
                  CollZap
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="rounded p-1 text-mute hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 h-0 flex-1 overflow-y-auto">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop rail */}
      <div className="hidden border-r border-line bg-paper md:fixed md:inset-y-0 md:flex md:w-52 md:flex-col">
        <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
          <div className="flex items-baseline justify-between px-5">
            <span className="font-display text-base font-semibold tracking-tight text-ink">
              CollZap
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-mute">Ops</span>
          </div>
          <div className="mt-7 flex flex-1 flex-col">
            <NavLinks />
          </div>

          <div className="mt-6 border-t border-line px-5 pt-4">
            {/* Admin JWTs are not refreshable; the interceptor logs out on 401. */}
            <p className="font-mono text-[9px] uppercase leading-relaxed tracking-widest text-mute">
              Operator session · 2 hours
            </p>
            {user?.name && (
              <p className="mt-1.5 truncate text-xs text-ink">{user.name}</p>
            )}
            <button
              onClick={handleLogout}
              className="mt-2 text-xs text-mute underline decoration-line underline-offset-4 transition-colors hover:text-ink rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:pl-52">
        <div className="sticky top-0 z-10 border-b border-line bg-paper px-2 py-2 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded text-mute hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
