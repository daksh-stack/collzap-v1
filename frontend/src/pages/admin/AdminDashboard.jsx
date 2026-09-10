import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

// Every tile maps to a real AdminStatsResponse field.
const TILES = [
  { key: 'totalUsers', label: 'Users', link: '/admin/users' },
  { key: 'verifiedUsers', label: 'Verified', link: '/admin/users' },
  { key: 'pendingVerifications', label: 'Pending review', link: '/admin/verifications', alert: true },
  { key: 'activeMatchGroups', label: 'Active groups', link: '/admin/matches' },
  { key: 'waitingMatchGroups', label: 'Waiting groups', link: '/admin/queue' },
  { key: 'totalMessages', label: 'Messages', link: null },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, fetchStats, loading } = useAdminStore();

  useEffect(() => {
    fetchStats().catch(console.error);
  }, []);

  return (
    <div>
      <AdminPageHeader title="Overview" />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
        {TILES.map((tile) => {
          const value = stats?.[tile.key] ?? 0;
          const isLink = !!tile.link;
          const Wrapper = isLink ? 'button' : 'div';

          return (
            <Wrapper
              key={tile.key}
              {...(isLink
                ? {
                    onClick: () => navigate(tile.link),
                    className:
                      'bg-surface px-4 py-5 text-left transition-colors sm:px-5 sm:py-6 hover:bg-ink/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500',
                  }
                : { className: 'bg-surface px-4 py-5 text-left sm:px-5 sm:py-6' })}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-mute">
                {tile.label}
              </p>
              {loading && !stats ? (
                <div className="mt-2 h-8 w-16 animate-pulse rounded-sm bg-line" />
              ) : (
                <p
                  className={`mt-2 font-display text-3xl font-bold tabular-nums tracking-tight ${
                    tile.alert && value > 0 ? 'text-accent-700' : 'text-ink'
                  }`}
                >
                  {value}
                </p>
              )}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
