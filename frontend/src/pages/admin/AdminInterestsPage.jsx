import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Select from '../../components/ui/Select';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';
import toast from 'react-hot-toast';

const CATEGORY_LABELS = { LONG_TERM: 'Long-Term', SHORT_TERM: 'Short-Term' };

export default function AdminInterestsPage() {
  const { interests, fetchInterests, createInterest, updateInterest, deleteInterest, loading } = useAdminStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'LONG_TERM' });

  const [interestToDelete, setInterestToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingInterest, setDeletingInterest] = useState(false);

  useEffect(() => {
    fetchInterests().catch(console.error);
  }, []);

  const handleOpenModal = (interest = null) => {
    if (interest) {
      setEditingInterest(interest);
      setFormData({ name: interest.name, category: interest.category });
    } else {
      setEditingInterest(null);
      setFormData({ name: '', category: 'LONG_TERM' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error('Name is required');

    try {
      if (editingInterest) {
        await updateInterest(editingInterest.id, formData.name.trim());
        toast.success('Interest updated');
      } else {
        await createInterest(formData.name.trim(), formData.category);
        toast.success('Interest added');
      }
      setIsModalOpen(false);
      fetchInterests();
    } catch (error) {
      toast.error(error.message || 'Failed to save interest');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') return;
    setDeletingInterest(true);
    try {
      await deleteInterest(interestToDelete.id);
      toast.success('Interest deleted');
      setInterestToDelete(null);
      setDeleteConfirmText('');
      fetchInterests();
    } catch (error) {
      toast.error(error.message || 'Failed to delete interest');
    } finally {
      setDeletingInterest(false);
    }
  };

  const rows = interests || [];

  return (
    <div>
      <AdminPageHeader title="Interests" count={rows.length}>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
      </AdminPageHeader>

      {/* Two short fields and a pair of actions — a list holds that at any
          width, where three table columns forced the name to wrap to a ribbon
          and pushed the actions off a phone screen. */}
      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-surface text-sm">
        {loading && rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-accent-500"><Spinner /></div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-mute">No interests found.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((interest) => (
              <li
                key={interest.id}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-ink/[0.02]"
              >
                <div className="min-w-0">
                  <span className="inline-flex items-center rounded-md bg-ink/[0.04] px-2 py-1 text-xs font-medium text-ink ring-1 ring-inset ring-ink/10">
                    {CATEGORY_LABELS[interest.category] || interest.category}
                  </span>
                  <p className="mt-1.5 break-words font-medium text-ink">{interest.name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${interest.name}`}
                    onClick={() => handleOpenModal(interest)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${interest.name}`}
                    onClick={() => { setInterestToDelete(interest); setDeleteConfirmText(''); }}
                    className="text-bad hover:bg-bad/[0.07] hover:text-bad"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInterest ? 'Edit Interest' : 'New Interest'} size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">Category</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              disabled={!!editingInterest}
            >
              <option value="LONG_TERM">Long-Term</option>
              <option value="SHORT_TERM">Short-Term</option>
            </Select>
            {editingInterest && (
              <p className="text-[10px] text-mute mt-1">Category can't be changed after creation.</p>
            )}
          </div>

          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            autoFocus
          />

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={loading}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!interestToDelete}
        onClose={() => { if (!deletingInterest) { setInterestToDelete(null); setDeleteConfirmText(''); } }}
        title="Delete Interest"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-bad/30 bg-bad/[0.06] p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-bad" />
            <p className="text-xs leading-relaxed text-ink/80">
              This permanently deletes <span className="font-semibold text-ink">"{interestToDelete?.name}"</span> and
              every question in its bank. It's blocked if the interest still has any match groups, test attempts, or
              user selections — resolve those first.
            </p>
          </div>

          <Input
            label={'Type "DELETE" to confirm'}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => { setInterestToDelete(null); setDeleteConfirmText(''); }}
              disabled={deletingInterest}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deletingInterest}
              disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
