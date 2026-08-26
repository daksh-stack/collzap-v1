import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useAdminStore } from '../../store/useAdminStore';
import TextArea from '../../components/ui/TextArea';
import Modal from '../../components/ui/Modal';

export default function AdminVerificationsPage() {
  const { pendingVerifications, fetchPendingVerifications, reviewDocument, loading } = useAdminStore();
  
  const [reviewModal, setReviewModal] = useState({ open: false, doc: null, approve: true });
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchPendingVerifications().catch(console.error);
  }, []);

  const handleOpenReview = (doc, approve) => {
    setReviewModal({ open: true, doc, approve });
    setNote('');
  };

  const handleSubmitReview = async () => {
    if (!reviewModal.approve && !note.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await reviewDocument(reviewModal.doc.id, reviewModal.approve, note);
      toast.success(`Document ${reviewModal.approve ? 'approved' : 'rejected'}`);
      setReviewModal({ open: false, doc: null, approve: true });
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Verifications</h1>
        <p className="mt-1 text-sm text-gray-500">Review student ID cards and fee slips.</p>
      </div>

      {loading && !pendingVerifications ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : pendingVerifications?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <EmptyState
            icon={CheckCircle}
            title="All caught up!"
            description="There are no pending documents to review right now."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingVerifications?.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm mr-2">
                    {doc.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{doc.userName}</p>
                    <p className="text-xs text-gray-500">{new Date(doc.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge>{doc.documentType}</Badge>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden relative group border border-gray-200">
                  <img 
                    src={doc.documentUrl} 
                    alt="Document preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'; }}
                  />
                  {/* Click to view full size overlay could go here */}
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleOpenReview(doc, false)}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleOpenReview(doc, true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal open={reviewModal.open} onClose={() => setReviewModal({ open: false, doc: null, approve: true })} title={reviewModal.approve ? "Approve Document" : "Reject Document"}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {reviewModal.approve 
              ? `You are about to approve the verification for ${reviewModal.doc?.userName}. They will be granted full access.` 
              : `You are about to reject the verification for ${reviewModal.doc?.userName}. They will be asked to re-upload.`}
          </p>
          
          <TextArea
            label={reviewModal.approve ? "Approval Note (Optional)" : "Rejection Reason (Required)"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={reviewModal.approve ? "Looks good." : "Document is blurry..."}
            required={!reviewModal.approve}
            rows={3}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setReviewModal({ open: false, doc: null, approve: true })}>Cancel</Button>
            <Button 
              onClick={handleSubmitReview} 
              loading={loading}
              className={reviewModal.approve ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              disabled={!reviewModal.approve && !note.trim()}
            >
              Confirm {reviewModal.approve ? "Approval" : "Rejection"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}