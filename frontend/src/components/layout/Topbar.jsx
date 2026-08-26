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
    await logout();
    navigate('/login');
  };

  const userMenuItems = [
    { label: 'Your Profile', onClick: () => navigate('/profile') },
    { label: 'Settings', onClick: () => navigate('/settings') },
    { label: 'Sign out', onClick: handleLogout, danger: true },
  ];

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1">
          {/* Add search here if needed later */}
        </div>
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <Link
            to="/notifications"
            className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>

          <Dropdown
            trigger={<Avatar name={profile?.name} src={profile?.profilePhotoUrl} size="sm" />}
            items={userMenuItems}
          />
        </div>
      </div>
    </div>
  );
}
