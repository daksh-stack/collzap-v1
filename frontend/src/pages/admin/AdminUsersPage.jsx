import { useState, useEffect } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useAdminStore } from '../../store/useAdminStore';
import AdminPageHeader from './AdminPageHeader';

const verificationBadge = (status) => {
  switch (status) {
    case 'APPROVED': return <Badge variant="success">Verified</Badge>;
    case 'DOCUMENT_SUBMITTED': return <Badge variant="warning">In review</Badge>;
    case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
    default: return <Badge variant="secondary">Unverified</Badge>;
  }
};

export default function AdminUsersPage() {
  const { users, fetchUsers, fetchUser, loading } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Search/status/page all go to the server — the store already supports it.
  // Filter changes reset the page inline so this stays a single fetch.
  useEffect(() => {
    const status = activeTab === 'ALL' ? null : activeTab;
    const handle = setTimeout(() => {
      fetchUsers(searchTerm || null, status, page).catch(console.error);
    }, searchTerm ? 300 : 0); // debounce typing only
    return () => clearTimeout(handle);
  }, [searchTerm, activeTab, page]);

  const changeFilter = (fn) => { setPage(0); fn(); };

  const handleOpenUser = async (user) => {
    setSelectedUser(user);
    setLoadingDetail(true);
    try {
      const full = await fetchUser(user.id);
      if (full) setSelectedUser(full);
    } catch (error) {
      console.error('Failed to fetch user detail', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const rows = users?.content || [];

  return (
    <div>
      <AdminPageHeader title="Users" count={users?.totalElements}>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Name, email, college"
            icon={<Search className="h-4 w-4" aria-hidden="true" />}
            value={searchTerm}
            onChange={(e) => changeFilter(() => setSearchTerm(e.target.value))}
            aria-label="Search users"
          />
        </div>
      </AdminPageHeader>

      <Tabs
        tabs={[
          { key: 'ALL', label: 'All' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'DELETED', label: 'Deleted' },
        ]}
        active={activeTab}
        onChange={(key) => changeFilter(() => setActiveTab(key))}
        className="mb-6"
      />

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-ink/[0.02]">
            <tr>
              {['User', 'College', 'Verification', 'Account', 'Joined', ''].map((h, i) => (
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
            {loading && rows.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-accent-500"><Spinner /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-mute">Nobody matches that.</td></tr>
            ) : (
              rows.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => handleOpenUser(user)}
                  className="cursor-pointer transition-colors hover:bg-ink/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{user.name}</div>
                    <div className="text-xs text-mute">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{user.collegeName || '—'}</div>
                    {user.yearOfStudy && <div className="text-xs text-mute">Year {user.yearOfStudy}</div>}
                  </td>
                  <td className="px-4 py-3">{verificationBadge(user.verificationStatus)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.accountStatus === 'DELETED' ? 'destructive' : 'secondary'}>
                      {user.accountStatus || 'ACTIVE'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-mute tnum">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleOpenUser(user); }}
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users?.totalPages > 1 && (
        <Pagination
          page={users.page ?? page}
          totalPages={users.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-surface"
        />
      )}

      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User" size="lg">
        {selectedUser && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                {selectedUser.name}
              </h2>
              <p className="mt-1 text-sm text-mute">{selectedUser.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {verificationBadge(selectedUser.verificationStatus)}
                <Badge variant={selectedUser.accountStatus === 'DELETED' ? 'destructive' : 'secondary'}>
                  {selectedUser.accountStatus || 'ACTIVE'}
                </Badge>
                {selectedUser.profileCompleted && <Badge variant="success">Profile done</Badge>}
              </div>
            </div>

            {loadingDetail && <div className="text-accent-500"><Spinner size="sm" /></div>}

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line text-sm">
              {[
                ['College', selectedUser.collegeName],
                ['City', selectedUser.city],
                ['Year', selectedUser.yearOfStudy ? `Year ${selectedUser.yearOfStudy}` : null],
                ['Joined', selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : null],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">{label}</dt>
                  <dd className="mt-1 text-ink">{value || '—'}</dd>
                </div>
              ))}
            </dl>

            {(selectedUser.storyPrompt1 || selectedUser.storyPrompt2 || selectedUser.storyPrompt3) && (
              <div className="divide-y divide-line border-y border-line">
                {[selectedUser.storyPrompt1, selectedUser.storyPrompt2, selectedUser.storyPrompt3]
                  .filter(Boolean)
                  .map((prompt, i) => (
                    <p key={i} className="py-3 text-sm leading-relaxed text-ink">{prompt}</p>
                  ))}
              </div>
            )}

            {selectedUser.proofOfWorkUrl && (
              <a
                href={selectedUser.proofOfWorkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent-700 underline decoration-accent-300 underline-offset-4"
              >
                Proof of work
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
