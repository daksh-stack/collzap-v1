import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import TextArea from '../../components/ui/TextArea';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

export default function AdminVerificationsPage() {
  const { verifications, fetchPendingVerifications, reviewDocument, loading } = useAdminStore();
  const [page, setPage] = useState(0);
  const [reviewModal, setReviewModal] = useState({ open: false, doc: null, approve: true });
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchPendingVerifications(page).catch(console.error);
  }, [page]);

  const openReview = (doc, approve) => {
    setReviewModal({ open: true, doc, approve });
    setNote('');
  };

  const closeReview = () => setReviewModal({ open: false, doc: null, approve: true });

  const handleSubmitReview = async () => {
    if (!reviewModal.approve && !note.trim()) {
      toast.error('A rejection needs a reason');
      return;
    }
    try {
      await reviewDocument(reviewModal.doc.documentId, reviewModal.approve, note || null);
      toast.success(reviewModal.approve ? 'Approved' : 'Rejected');
      closeReview();
      fetchPendingVerifications(page);
    } catch (error) {
      toast.error(error.message || 'Could not submit that');
    }
  };

  const rows = verifications?.content || [];

  return (
    <div>
      <AdminPageHeader title="Verifications" count={verifications?.totalElements} />

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-20 text-accent-500"><Spinner size="lg" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="Nothing waiting" description="Every submitted document has been reviewed." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-[#FBF8F2]">
          {rows.map((doc) => (
            <li key={doc.documentId} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <p className="truncate text-sm font-medium text-ink">{doc.userName}</p>
                  <Badge variant="secondary">{doc.documentType}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-mute">
                  {doc.email}{doc.collegeName ? ` · ${doc.collegeName}` : ''}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mute tnum">
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '—'}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {doc.documentUrl && (
                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-accent-700 underline decoration-accent-300 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    Open document
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
                <Button variant="ghost" size="sm" className="text-bad hover:bg-bad/[0.07]" onClick={() => openReview(doc, false)}>
                  Reject
                </Button>
                <Button size="sm" onClick={() => openReview(doc, true)}>Approve</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {verifications?.totalPages > 1 && (
        <Pagination
          page={verifications.page ?? page}
          totalPages={verifications.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-[#FBF8F2]"
        />
      )}

      <Modal
        open={reviewModal.open}
        onClose={closeReview}
        title={reviewModal.approve ? 'Approve document' : 'Reject document'}
      >
        <p className="text-sm leading-relaxed text-mute">
          {reviewModal.approve
            ? `${reviewModal.doc?.userName} gets full access, matching included.`
            : `${reviewModal.doc?.userName} is asked to send another one. They see this note.`}
        </p>

        <div className="mt-5">
          <TextArea
            label={reviewModal.approve ? 'Note (optional)' : 'Reason (required)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={reviewModal.approve ? 'Looks fine.' : 'The photo is too blurry to read the name.'}
            rows={3}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
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
      </Modal>
    </div>
  );
}
