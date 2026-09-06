import { useEffect } from 'react';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

export default function AdminQueuePage() {
  const { queue, fetchQueue, loading } = useAdminStore();

  useEffect(() => {
    fetchQueue().catch(console.error);
  }, []);

  const queueList = Array.isArray(queue) ? queue : queue?.content || [];

  // Group by interest so an operator can see where the shortage is.
  const grouped = queueList.reduce((acc, item) => {
    const key = item.interestName || 'Unassigned';
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <AdminPageHeader title="Queue" count={queueList.length} />

      {loading && queueList.length === 0 ? (
        <div className="flex justify-center py-20 text-accent-500"><Spinner size="lg" /></div>
      ) : queueList.length === 0 ? (
        <EmptyState title="Queue is empty" description="Nothing is waiting for another person." />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([interestName, groups]) => (
            <section key={interestName}>
              <h2 className="mb-3 flex items-baseline justify-between border-b border-line pb-2">
                <span className="font-display text-base font-semibold tracking-tight text-ink">
                  {interestName}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-mute tnum">
                  {groups.length} waiting
                </span>
              </h2>

              <ul className="divide-y divide-line">
                {groups.map((group, idx) => (
                  <li
                    key={group.matchGroupId || idx}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">
                        {group.memberNames?.join(', ') || 'Waiting peer'}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-mute">
                        {group.connectionType} · {group.projectType}
                        {group.collegeName ? ` · ${group.collegeName}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <Badge variant="warning">{group.levelBand || 'UNRANKED'}</Badge>
                      <span className="text-xs text-mute tnum">
                        {group.waitingSince ? new Date(group.waitingSince).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
