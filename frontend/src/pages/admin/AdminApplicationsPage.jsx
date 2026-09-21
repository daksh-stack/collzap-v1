import { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import TextArea from '../../components/ui/TextArea';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Tabs from '../../components/ui/Tabs';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

const STATUS_VARIANT = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

export default function AdminApplicationsPage() {
  const { collegeApplications, fetchCollegeApplications, reviewCollegeApplication, loading } = useAdminStore();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [reviewModal, setReviewModal] = useState({ open: false, app: null, approve: true });
  const [note, setNote] = useState('');

  useEffect(() => {
    const status = activeTab === 'ALL' ? null : activeTab;
    fetchCollegeApplications(status, page).catch(console.error);
  }, [activeTab, page]);

  const changeTab = (key) => { setPage(0); setActiveTab(key); };

  const openReview = (app, approve) => {
    setReviewModal({ open: true, app, approve });
    setNote('');
  };
  const closeReview = () => setReviewModal({ open: false, app: null, approve: true });

  const handleSubmitReview = async () => {
    if (!reviewModal.approve && !note.trim()) {
      toast.error('A rejection needs a reason');
      return;
    }
    try {
      await reviewCollegeApplication(reviewModal.app.id, reviewModal.approve, note || null);
      toast.success(reviewModal.approve ? 'Approved' : 'Rejected');
      closeReview();
      fetchCollegeApplications(activeTab === 'ALL' ? null : activeTab, page);
    } catch (error) {
      toast.error(error.message || 'Could not submit that');
    }
  };

  const rows = collegeApplications?.content || [];

  return (
    <div>
      <AdminPageHeader title="Student Applications" count={collegeApplications?.totalElements} />

      <p className="mb-6 border-l-2 border-line pl-4 text-xs leading-relaxed text-mute">
        "Bring CollZap to my college" submissions from students at colleges we haven't onboarded yet.
        Approving only records a decision — it doesn't create the college or a user account.
        Do that yourself once you've followed up.
      </p>

      <Tabs tabs={TABS} active={activeTab} onChange={changeTab} className="mb-6" />

      <div className="hidden overflow-x-auto rounded-lg border border-line md:block">
        <table className="w-full min-w-[52rem] divide-y divide-line text-sm">
          <thead className="bg-ink/[0.02]">
            <tr>
              {['Applicant', 'College', 'Status', 'Submitted', ''].map((h) => (
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
              <tr><td colSpan="5" className="px-4 py-12 text-center text-accent-500"><Spinner /></td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-10">
                  <EmptyState title="Nothing here" description="No applications in this view." />
                </td>
              </tr>
            ) : (
              rows.map((app) => (
                <tr key={app.id} className="transition-colors hover:bg-ink/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{app.fullName}</div>
                    <div className="text-xs text-mute">{app.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{app.collegeName}</div>
                    {app.collegeCity && <div className="text-xs text-mute">{app.collegeCity}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[app.status] || 'default'}>{app.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-mute tnum">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {app.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-bad hover:bg-bad/[0.07]" onClick={() => openReview(app, false)}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => openReview(app, true)}>Approve</Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openReview(app, app.status === 'APPROVED')}
                        className="text-xs text-mute underline decoration-line underline-offset-4 hover:text-ink"
                      >
                        View
                      </button>
                    )}
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
            <EmptyState title="Nothing here" description="No applications in this view." />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => openReview(app, app.status !== 'REJECTED')}
                  className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-ink/[0.02] focus-visible:outline-none focus-visible:bg-ink/[0.04]"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-ink">{app.fullName}</span>
                    <Badge variant={STATUS_VARIANT[app.status] || 'default'}>{app.status}</Badge>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-mute">{app.collegeName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {collegeApplications?.totalPages > 1 && (
        <Pagination
          page={collegeApplications.page ?? page}
          totalPages={collegeApplications.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-surface"
        />
      )}

      <Modal
        open={reviewModal.open}
        onClose={closeReview}
        title={reviewModal.app?.status === 'PENDING' ? (reviewModal.approve ? 'Approve application' : 'Reject application') : 'Application'}
        size="lg"
      >
        {reviewModal.app && (
          <div className="space-y-6">
            <dl className="grid gap-px overflow-hidden rounded border border-line bg-line text-sm sm:grid-cols-2">
              <div className="bg-surface px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Name</dt>
                <dd className="mt-1 text-ink">{reviewModal.app.fullName}</dd>
              </div>
              <div className="bg-surface px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Email</dt>
                <dd className="mt-1 break-all text-ink">{reviewModal.app.email}</dd>
              </div>
              <div className="bg-surface px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Contact</dt>
                <dd className="mt-1 text-ink">{reviewModal.app.contactNumber}</dd>
              </div>
              <div className="bg-surface px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Document</dt>
                <dd className="mt-1 text-ink">{reviewModal.app.documentType}</dd>
              </div>
              <div className="bg-surface px-4 py-3 sm:col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Claims college</dt>
                {reviewModal.app.collegeName ? (
                  <dd className="mt-1 font-medium text-accent-700">
                    {reviewModal.app.collegeName}
                    {reviewModal.app.collegeCity && <span className="text-mute"> · {reviewModal.app.collegeCity}</span>}
                  </dd>
                ) : (
                  <dd className="mt-1 flex items-center gap-1.5 font-medium text-bad">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    No college name given
                  </dd>
                )}
              </div>
            </dl>

            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-mute">
                Why they want CollZap at their college
              </p>
              <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink">
                {reviewModal.app.motivation}
              </p>
            </div>

            {reviewModal.app.documentUrl && (
              <a
                href={reviewModal.app.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent-700 underline decoration-accent-300 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                Open document
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}

            {reviewModal.app.status === 'PENDING' ? (
              <>
                <TextArea
                  label={reviewModal.approve ? 'Note (optional)' : 'Reason (required)'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={reviewModal.approve ? 'Looks good.' : 'Document is unreadable.'}
                  rows={3}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={closeReview}>Cancel</Button>
                  <Button
                    onClick={handleSubmitReview}
                    loading={loading}
                    variant={reviewModal.approve ? 'primary' : 'danger'}
                    disabled={!reviewModal.approve && !note.trim()}
                  >
                    {reviewModal.approve ? 'Approve' : 'Reject'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {reviewModal.app.reviewNote && (
                  <div>
                    <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-mute">Review note</p>
                    <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm leading-relaxed text-ink">
                      {reviewModal.app.reviewNote}
                    </p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="ghost" onClick={closeReview}>Close</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
