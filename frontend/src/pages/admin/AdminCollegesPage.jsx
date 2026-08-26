import { useState, useEffect } from 'react';
import { Loader2, Plus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useCollegeStore } from '../../store/useCollegeStore';
import { useAdminStore } from '../../store/useAdminStore';

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
    if (!formData.name || !formData.emailDomain || !formData.city) {
      toast.error('All fields are required');
      return;
    }
    
    try {
      await createCollege(formData.name, formData.emailDomain, formData.city);
      toast.success('College added successfully');
      setModalOpen(false);
      setFormData({ name: '', emailDomain: '', city: '' });
      fetchColleges(); // refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to add college');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colleges</h1>
          <p className="mt-1 text-sm text-gray-500">Manage supported colleges and email domains.</p>
        </div>
        <div>
          <Button onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add College
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Domain</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetchLoading && !colleges ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : colleges?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <EmptyState icon={Building2} title="No colleges" description="Add your first supported college." />
                  </td>
                </tr>
              ) : (
                colleges?.map((college) => (
                  <tr key={college.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{college.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{college.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{college.emailDomain}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{college.city}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New College">
        <form onSubmit={handleAddCollege} className="space-y-4">
          <Input
            label="College Name"
            placeholder="e.g. Harvard University"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input
            label="Email Domain"
            placeholder="e.g. harvard.edu"
            value={formData.emailDomain}
            onChange={(e) => setFormData({...formData, emailDomain: e.target.value})}
            required
          />
          <Input
            label="City"
            placeholder="e.g. Cambridge, MA"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createLoading}>Add College</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}