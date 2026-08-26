import { useState, useEffect } from 'react';
import { Search, Loader2, MoreVertical, ShieldAlert, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import { useAdminStore } from '../../store/useAdminStore';

export default function AdminUsersPage() {
  const { users, fetchUsers, fetchUser, loading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  useEffect(() => {
    fetchUsers().catch(console.error);
  }, []);

  const handleOpenUser = async (user) => {
    setSelectedUser(user);
    setLoadingUserDetail(true);
    try {
      const fullDetails = await fetchUser(user.id);
      if (fullDetails) {
        setSelectedUser(fullDetails);
      }
    } catch (error) {
      console.error('Failed to fetch full user details', error);
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const filteredUsers = users?.content?.filter(user => {
    const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const collegeMatch = user.collegeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = !searchTerm || nameMatch || emailMatch || collegeMatch;
    
    const accountStatus = user.accountStatus || 'ACTIVE';
    let matchesTab = true;
    if (activeTab === 'ACTIVE') matchesTab = accountStatus === 'ACTIVE';
    if (activeTab === 'DELETED') matchesTab = accountStatus === 'DELETED';
    
    return matchesSearch && matchesTab;
  }) || [];

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" className="mr-1">Verified</Badge>;
      case 'DOCUMENT_SUBMITTED':
        return <Badge variant="warning" className="mr-1">In Review</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="mr-1">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="mr-1">Unverified</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all registered users on the platform.</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name, email, college..."
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
              { key: 'ALL', label: `All Users (${users?.content?.length || 0})` },
              { key: 'ACTIVE', label: 'Active' },
              { key: 'DELETED', label: 'Deleted' },
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (!users?.content || users.content.length === 0) ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenUser(user)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-full object-cover bg-gray-100 border border-gray-200" 
                            src={user.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366f1&color=fff`} 
                            alt="" 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{user.collegeName || 'N/A'}</div>
                      {user.yearOfStudy && <span className="text-xs text-gray-400">Year {user.yearOfStudy}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVerificationBadge(user.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.accountStatus === 'ACTIVE' ? 'secondary' : 'destructive'}>
                        {user.accountStatus || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenUser(user); }}>
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
              <img 
                className="h-16 w-16 rounded-full object-cover bg-gray-100 border border-gray-200" 
                src={selectedUser.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || 'User')}&background=6366f1&color=fff`} 
                alt="" 
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                <p className="text-gray-500">{selectedUser.email}</p>
                <div className="mt-2 flex gap-2">
                  {getVerificationBadge(selectedUser.verificationStatus)}
                  <Badge variant={selectedUser.accountStatus === 'ACTIVE' ? 'secondary' : 'destructive'}>
                    {selectedUser.accountStatus || 'ACTIVE'}
                  </Badge>
                  {selectedUser.profileCompleted && (
                    <Badge variant="success">Profile 100%</Badge>
                  )}
                </div>
              </div>
            </div>

            {loadingUserDetail && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">College</p>
                <p className="font-semibold text-gray-900">{selectedUser.collegeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">City</p>
                <p className="font-semibold text-gray-900">{selectedUser.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Year of Study</p>
                <p className="font-semibold text-gray-900">{selectedUser.yearOfStudy ? `Year ${selectedUser.yearOfStudy}` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Joined Platform</p>
                <p className="font-semibold text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            {/* Story prompts / Bio if available */}
            {(selectedUser.storyPrompt1 || selectedUser.storyPrompt2 || selectedUser.storyPrompt3) && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Profile Prompts</p>
                {selectedUser.storyPrompt1 && (
                  <div>
                    <p className="text-xs text-gray-500 italic">One thing I want to achieve in college:</p>
                    <p className="text-sm font-medium text-gray-800">{selectedUser.storyPrompt1}</p>
                  </div>
                )}
                {selectedUser.storyPrompt2 && (
                  <div>
                    <p className="text-xs text-gray-500 italic">I am most serious about:</p>
                    <p className="text-sm font-medium text-gray-800">{selectedUser.storyPrompt2}</p>
                  </div>
                )}
                {selectedUser.storyPrompt3 && (
                  <div>
                    <p className="text-xs text-gray-500 italic">The kind of peer I am looking for:</p>
                    <p className="text-sm font-medium text-gray-800">{selectedUser.storyPrompt3}</p>
                  </div>
                )}
              </div>
            )}

            {selectedUser.proofOfWorkUrl && (
              <div className="bg-brand-50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-brand-900">Proof of Work / Portfolio:</span>
                <a 
                  href={selectedUser.proofOfWorkUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center"
                >
                  View Link <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}