import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { useCollegeStore } from '../../store/useCollegeStore';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

const EMPTY_FORM = { name: '', emailDomain: '', city: '' };

export default function AdminCollegesPage() {
  const { colleges, fetchColleges, loading: fetchLoading } = useCollegeStore();
  const { createCollege, updateCollege, deleteCollege, loading: mutating } = useAdminStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchColleges().catch(console.error);
  }, []);

  const handleOpenModal = (college = null) => {
    if (college) {
      setEditingCollege(college);
      setFormData({ name: college.name, emailDomain: college.emailDomain, city: college.city || '' });
    } else {
      setEditingCollege(null);
      setFormData(EMPTY_FORM);
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.emailDomain.trim()) {
      toast.error('Name and email domain are required');
      return;
    }

    try {
      // city is optional on the backend; send it only when filled.
      if (editingCollege) {
        await updateCollege(
          editingCollege.id,
          formData.name.trim(),
          formData.emailDomain.trim(),
          formData.city.trim() || null
        );
        toast.success('College updated');
      } else {
        await createCollege(
          formData.name.trim(),
          formData.emailDomain.trim(),
          formData.city.trim() || null
        );
        toast.success('College added');
      }
      setModalOpen(false);
      setEditingCollege(null);
      setFormData(EMPTY_FORM);
      fetchColleges();
    } catch (error) {
      toast.error(error.message || 'Could not save that');
    }
  };

  const handleDelete = async (college) => {
    if (!window.confirm(`Delete ${college.name}? This only works if nobody has enrolled there yet.`)) return;
    try {
      await deleteCollege(college.id);
      toast.success('College deleted');
      fetchColleges();
    } catch (error) {
      toast.error(error.message || 'Could not delete that');
    }
  };

  const rows = colleges || [];

  return (
    <div>
      <AdminPageHeader title="Colleges" count={rows.length}>
        <Button size="sm" onClick={() => handleOpenModal()}>Add college</Button>
      </AdminPageHeader>

      {fetchLoading && rows.length === 0 ? (
        <div className="flex justify-center py-20 text-accent-500"><Spinner size="lg" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No colleges yet" description="Add one so its students can sign up." />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-line sm:block">
            <table className="w-full min-w-[40rem] divide-y divide-line text-sm">
              <thead className="bg-ink/[0.02]">
                <tr>
                  {['College', 'Email domain', 'City', ''].map((h, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="px-4 py-2.5 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-mute"
                    >
                      {h || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {rows.map((college) => (
                  <tr key={college.id} className="group">
                    <td className="px-4 py-3 font-medium text-ink">{college.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mute">{college.emailDomain}</td>
                    <td className="px-4 py-3 text-mute">{college.city || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${college.name}`}
                          onClick={() => handleOpenModal(college)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${college.name}`}
                          onClick={() => handleDelete(college)}
                          className="text-bad hover:bg-bad/[0.07] hover:text-bad"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface sm:hidden">
            {rows.map((college) => (
              <li key={college.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-ink">{college.name}</p>
                  <p className="mt-0.5 break-all font-mono text-xs text-mute">{college.emailDomain}</p>
                  {college.city && <p className="mt-0.5 text-xs text-mute">{college.city}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${college.name}`}
                    onClick={() => handleOpenModal(college)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${college.name}`}
                    onClick={() => handleDelete(college)}
                    className="text-bad hover:bg-bad/[0.07] hover:text-bad"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingCollege ? 'Edit college' : 'Add a college'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="College name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email domain"
            placeholder="cdgi.edu.in"
            value={formData.emailDomain}
            onChange={(e) => setFormData({ ...formData, emailDomain: e.target.value })}
            required
          />
          <Input
            label="City (optional)"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={mutating}>{editingCollege ? 'Save' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
