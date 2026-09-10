import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useNotificationStore } from '../../store/useNotificationStore';
import { cn } from '../../lib/utils';

function relativeTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60) return 'now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  if (secs < 172800) return 'yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications, pagination, fetchNotifications, markRead, markAllRead, loading,
  } = useNotificationStore();
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchNotifications(page).catch(console.error);
  }, [page]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch {
      toast.error('Could not mark those read');
    }
  };

  const handleClick = async (notification) => {
    if (!notification.read) {
      markRead(notification.id).catch(() => {});
    }

    // Route off the payload the backend actually sends.
    const payload = notification.payload || {};
    if (payload.chatRoomId) {
      navigate(`/chat/${payload.chatRoomId}`);
    } else if (payload.matchGroupId) {
      navigate(`/matches/${payload.matchGroupId}`);
    } else if (notification.type === 'VERIFICATION_APPROVED') {
      navigate('/profile');
    } else if (notification.type === 'VERIFICATION_REJECTED') {
      navigate('/onboarding');
    }
  };

  const list = notifications || [];
  const hasUnread = list.some((n) => !n.read);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink">
            Notices
          </h1>
          <p className="mt-3 text-sm text-mute">Matches, messages and verification news.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={!hasUnread || loading}
          className="shrink-0"
        >
          Mark all read
        </Button>
      </header>

      {loading && list.length === 0 ? (
        <ul className="divide-y divide-line border-y border-line">
          {[1, 2, 3].map((i) => (
            <li key={i} className="animate-pulse py-5">
              <div className="h-3 w-1/3 rounded-sm bg-line" />
              <div className="mt-2 h-3 w-2/3 rounded-sm bg-line/60" />
            </li>
          ))}
        </ul>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing on the board"
          description="Matches and messages show up here."
        />
      ) : (
        <>
          <ul className="divide-y divide-line border-y border-line">
            {list.map((notification) => (
              <li key={notification.id}>
                <button
                  onClick={() => handleClick(notification)}
                  className="flex w-full items-start gap-4 py-5 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <span
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                      notification.read ? 'bg-transparent' : 'grad-brand'
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm', notification.read ? 'text-ink/80' : 'font-semibold text-ink')}>
                      {notification.title}
                    </span>
                    {notification.body && (
                      <span className="mt-1 block text-sm leading-relaxed text-mute">
                        {notification.body}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[10px] text-mute tnum">
                    {relativeTime(notification.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {pagination?.totalPages > 1 && (
            <Pagination
              page={pagination.page ?? page}
              totalPages={pagination.totalPages}
              onPageChange={(next) => setPage(next)}
            />
          )}
        </>
      )}
    </div>
  );
}
