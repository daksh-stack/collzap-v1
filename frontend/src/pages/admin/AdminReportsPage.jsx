import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

export default function AdminReportsPage() {
  const { reports, fetchReports, loading } = useAdminStore();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchReports(page).catch(console.error);
  }, [page]);

  const rows = reports?.content || [];

  return (
    <div>
      <AdminPageHeader title="Reports" count={reports?.totalElements} />

      <p className="mb-6 border-l-2 border-line pl-4 text-xs leading-relaxed text-mute">
        Read only. There is no resolve or ban endpoint — act on these out of band.
      </p>

      <div className="hidden overflow-x-auto rounded-lg border border-line md:block">
        <table className="min-w-[44rem] divide-y divide-line text-sm">
          <thead className="bg-ink/[0.02]">
            <tr>
              {['Reported', 'Reporter', 'Reason', 'When'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-mute"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {loading && rows.length === 0 ? (
              <tr><td colSpan="4" className="px-4 py-12 text-center text-accent-500"><Spinner /></td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-10">
                  <EmptyState title="No reports" description="Nobody has reported anybody." />
                </td>
              </tr>
            ) : (
              rows.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => setSelected(report)}
                  className="cursor-pointer transition-colors hover:bg-ink/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{report.reportedName}</div>
                    <div className="font-mono text-[10px] text-mute">{report.reportedId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{report.reporterName}</div>
                    <div className="font-mono text-[10px] text-mute">{report.reporterId}</div>
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <div className="line-clamp-2 text-ink">{report.reason}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-mute tnum">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface md:hidden">
        {loading && rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-accent-500"><Spinner /></div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10">
            <EmptyState title="No reports" description="Nobody has reported anybody." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((report) => (
              <li key={report.id}>
                <button
                  type="button"
                  onClick={() => setSelected(report)}
                  className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-ink/[0.02] focus-visible:outline-none focus-visible:bg-ink/[0.04]"
                >
                  {/* Spans, not paragraphs: a <button> may only contain
                      phrasing content. */}
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-ink">{report.reportedName}</span>
                    <span className="shrink-0 text-[11px] text-mute tnum">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-widest text-mute">
                    by {report.reporterName}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-sm text-ink">{report.reason}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reports?.totalPages > 1 && (
        <Pagination
          page={reports.page ?? page}
          totalPages={reports.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-surface"
        />
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Report" size="lg">
        {selected && (
          <div className="space-y-6">
            <p className="whitespace-pre-wrap border-l-2 border-bad pl-4 text-sm leading-relaxed text-ink">
              {selected.reason}
            </p>

            <dl className="grid gap-px overflow-hidden rounded border border-line bg-line text-sm sm:grid-cols-2">
              <div className="bg-surface px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Reported</dt>
                <dd className="mt-1 text-ink">{selected.reportedName}</dd>
                <dd className="mt-0.5 break-all font-mono text-[10px] text-mute">{selected.reportedId}</dd>
              </div>
              <div className="bg-surface px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Reporter</dt>
                <dd className="mt-1 text-ink">{selected.reporterName}</dd>
                <dd className="mt-0.5 break-all font-mono text-[10px] text-mute">{selected.reporterId}</dd>
              </div>
            </dl>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
