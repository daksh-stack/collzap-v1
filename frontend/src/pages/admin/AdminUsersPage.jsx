import { useState, useEffect } from 'react';
import { Search, Loader2, MoreVertical, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import { useAdminStore } from '../../store/useAdminStore';

export default function AdminUsersPage() {
  const { users, fetchUsers, loading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Actually, wait, useAdminStore.fetchUsers might take filters, or we do it client side.
  // We'll do simple client side filtering for now based on the list.
  useEffect(() => {
    fetchUsers().catch(console.error);
  }, []);

  const filteredUsers = users?.content?.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'ACTIVE') matchesTab = user.status === 'ACTIVE';
    if (activeTab === 'DELETED') matchesTab = user.status === 'DELETED' || user.status === 'BANNED';
    
    return matchesSearch && matchesTab;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all registered users on the platform.</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name or email..."
            icon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 border-b border-gray-200">
          <Tabs 
            tabs={[
              { key: 'ALL', label: 'All Users' },
              { key: 'ACTIVE', label: 'Active' },
              { key: 'DELETED', label: 'Deleted / Banned' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !users ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src={user.profilePhotoUrl || `https://ui-avatars.com/api/?name=${user.name}`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.collegeName}<br/>
                      <span className="text-xs text-gray-400">Year {user.yearOfStudy}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.verified ? 'success' : 'warning'} className="mr-2">
                        {user.verified ? 'Verified' : 'Pending'}
                      </Badge>
                      {user.status === 'BANNED' && <Badge variant="destructive">Banned</Badge>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <img className="h-16 w-16 rounded-full" src={selectedUser.profilePhotoUrl || `https://ui-avatars.com/api/?name=${selectedUser.name}`} alt="" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                <p className="text-gray-500">{selectedUser.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={selectedUser.verified ? 'success' : 'warning'}>
                    {selectedUser.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant="secondary">{selectedUser.status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">College</p>
                <p className="font-medium text-gray-900">{selectedUser.collegeName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">City</p>
                <p className="font-medium text-gray-900">{selectedUser.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Year of Study</p>
                <p className="font-medium text-gray-900">{selectedUser.yearOfStudy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Joined</p>
                <p className="font-medium text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200">
                <ShieldAlert className="w-4 h-4 mr-2" /> Ban User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}