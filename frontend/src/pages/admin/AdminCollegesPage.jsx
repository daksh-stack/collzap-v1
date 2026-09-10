import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { useCollegeStore } from '../../store/useCollegeStore';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

export default function AdminCollegesPage() {
  const { colleges, fetchColleges, loading: fetchLoading } = useCollegeStore();
  const { createCollege, loading: createLoading } = useAdminStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', emailDomain: '', city: '' });

  useEffect(() => {
    fetchColleges().catch(console.error);
  }, []);

  const handleAddCollege = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.emailDomain.trim()) {
      toast.error('Name and email domain are required');
      return;
    }

    try {
      // city is optional on the backend; send it only when filled.
      await createCollege(
        formData.name.trim(),
        formData.emailDomain.trim(),
        formData.city.trim() || null
      );
      toast.success('College added');
      setModalOpen(false);
      setFormData({ name: '', emailDomain: '', city: '' });
      fetchColleges();
    } catch (error) {
      toast.error(error.message || 'Could not add that');
    }
  };

  const rows = colleges || [];

  return (
    <div>
      <AdminPageHeader title="Colleges" count={rows.length}>
        <Button size="sm" onClick={() => setModalOpen(true)}>Add college</Button>
      </AdminPageHeader>

      {fetchLoading && rows.length === 0 ? (
        <div className="flex justify-center py-20 text-accent-500"><Spinner size="lg" /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No colleges yet" description="Add one so its students can sign up." />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-line sm:block">
            <table className="min-w-[36rem] divide-y divide-line text-sm">
              <thead className="bg-ink/[0.02]">
                <tr>
                  {['College', 'Email domain', 'City'].map((h) => (
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
                {rows.map((college) => (
                  <tr key={college.id}>
                    <td className="px-4 py-3 font-medium text-ink">{college.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mute">{college.emailDomain}</td>
                    <td className="px-4 py-3 text-mute">{college.city || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface sm:hidden">
            {rows.map((college) => (
              <li key={college.id} className="px-4 py-3">
                <p className="break-words text-sm font-medium text-ink">{college.name}</p>
                <p className="mt-0.5 break-all font-mono text-xs text-mute">{college.emailDomain}</p>
                {college.city && <p className="mt-0.5 text-xs text-mute">{college.city}</p>}
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a college">
        <form onSubmit={handleAddCollege} className="space-y-4">
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
            <Button type="submit" loading={createLoading}>Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
