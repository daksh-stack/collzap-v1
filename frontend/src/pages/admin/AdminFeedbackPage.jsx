import { useState, useEffect } from 'react';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

export default function AdminFeedbackPage() {
  const { interestFeedback, fetchInterestFeedback, loading } = useAdminStore();
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchInterestFeedback(page).catch(console.error);
  }, [page]);

  const rows = interestFeedback?.content || [];

  return (
    <div>
      <AdminPageHeader title="Interest suggestions" count={interestFeedback?.totalElements} />

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-20 text-accent-500"><Spinner size="lg" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="Nothing suggested" description="Nobody has asked for a new topic." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-[#FBF8F2]">
          {rows.map((item) => (
            <li key={item.id} className="p-5">
              <div className="flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{item.userName}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-mute tnum">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                  </p>
                </div>
                <Badge variant="secondary">{item.projectType}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-wrap border-l-2 border-line pl-4 text-sm leading-relaxed text-ink">
                {item.suggestion || item.suggestionText}
              </p>
            </li>
          ))}
        </ul>
      )}

      {interestFeedback?.totalPages > 1 && (
        <Pagination
          page={interestFeedback.page ?? page}
          totalPages={interestFeedback.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-[#FBF8F2]"
        />
      )}
    </div>
  );
}
