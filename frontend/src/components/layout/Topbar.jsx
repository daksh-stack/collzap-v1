import { Menu, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function Topbar({ setMobileOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { profile } = useUserStore();
  const { unreadCount } = useNotificationStore();

  const handleLogout = async () => {
    // logout() also disconnects the socket, dropping the notification queue.
    await logout();
    navigate('/login', { replace: true });
  };

  const userMenuItems = [
    { label: 'Your profile', onClick: () => navigate('/profile') },
    { label: 'Give feedback', onClick: () => navigate('/feedback') },
    { label: 'Settings', onClick: () => navigate('/settings') },
    { label: 'Sign out', onClick: handleLogout, danger: true },
  ];

  const firstName = profile?.name?.split(' ')[0];

  return (
    <header className="sticky top-0 z-10 flex h-14 flex-shrink-0 items-center border-b border-line bg-paper">
      <button
        type="button"
        aria-label="Open menu"
        className="border-r border-line px-4 py-4 text-mute hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center justify-between px-5">
        <p className="truncate text-sm text-mute">
          {firstName ? <>Hey, <span className="text-ink">{firstName}</span></> : null}
        </p>

        <div className="flex items-center gap-4">
          <Link
            to="/notifications"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className="relative rounded p-1.5 text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <Bell className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 block h-1.5 w-1.5 rounded-full bg-accent-500 ring-2 ring-paper" />
            )}
          </Link>

          <Dropdown
            trigger={
              <span className="block rounded" aria-label="Account menu">
                <Avatar name={profile?.name} src={profile?.profilePhotoUrl} size="sm" />
              </span>
            }
            items={userMenuItems}
          />
        </div>
      </div>
    </header>
  );
}
