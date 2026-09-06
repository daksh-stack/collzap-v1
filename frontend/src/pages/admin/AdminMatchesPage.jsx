import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useAdminStore } from '../../store/useAdminStore';
import { useInterestStore } from '../../store/useInterestStore';
import AdminPageHeader from './AdminPageHeader';

export default function AdminMatchesPage() {
  const { matches, fetchMatches, createMatch, unmatch, loading } = useAdminStore();
  const { catalog, fetchCatalog } = useInterestStore();

  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const [forceModalOpen, setForceModalOpen] = useState(false);
  const [userIds, setUserIds] = useState([]);       // chips
  const [userIdDraft, setUserIdDraft] = useState('');
  const [matchForm, setMatchForm] = useState({
    interestId: '',
    connectionType: 'ONE_ON_ONE',
    projectType: 'SHORT_TERM',
  });

  useEffect(() => {
    const status = activeTab === 'ALL' ? null : activeTab;
    fetchMatches(status, page).catch(console.error);
    fetchCatalog().catch(console.error);
  }, [activeTab, page]);

  const commitDraft = () => {
    const value = userIdDraft.trim().replace(/,$/, '');
    if (!value) return;
    if (!userIds.includes(value)) setUserIds([...userIds, value]);
    setUserIdDraft('');
  };

  const handleCreateMatch = async () => {
    // Fold any half-typed id in before validating.
    const pending = userIdDraft.trim().replace(/,$/, '');
    const ids = pending && !userIds.includes(pending) ? [...userIds, pending] : userIds;

    if (ids.length < 2) {
      toast.error('At least two user ids');
      return;
    }
    if (!matchForm.interestId) {
      toast.error('Pick an interest');
      return;
    }

    try {
      // Body shape is unchanged: { userIds, interestId, connectionType, projectType }
      await createMatch(ids, matchForm.interestId, matchForm.connectionType, matchForm.projectType);
      toast.success('Match created');
      setForceModalOpen(false);
      setUserIds([]);
      setUserIdDraft('');
      setMatchForm({ interestId: '', connectionType: 'ONE_ON_ONE', projectType: 'SHORT_TERM' });
      fetchMatches(activeTab === 'ALL' ? null : activeTab, page);
    } catch (error) {
      toast.error(error.message || 'Could not create that');
    }
  };

  const handleUnmatch = async (matchGroupId, userId, userName) => {
    const who = userName ? `Remove ${userName} from this group?` : 'Dissolve this whole group?';
    if (!window.confirm(who)) return;
    try {
      await unmatch(matchGroupId, userId);
      toast.success(userId ? 'Removed' : 'Group dissolved');
      fetchMatches(activeTab === 'ALL' ? null : activeTab, page);
    } catch (error) {
      toast.error(error.message || 'Could not unmatch');
    }
  };

  // InterestCatalogResponse.longTerm / .shortTerm are already the arrays.
  const interestOptions = [
    { value: '', label: 'Select an interest' },
    ...(catalog?.longTerm || []).map((i) => ({ value: i.id, label: `Long · ${i.name}` })),
    ...(catalog?.shortTerm || []).map((i) => ({ value: i.id, label: `Short · ${i.name}` })),
  ];

  const rows = matches?.content || [];

  return (
    <div>
      <AdminPageHeader title="Matches" count={matches?.totalElements}>
        <Button size="sm" onClick={() => setForceModalOpen(true)}>Force match</Button>
      </AdminPageHeader>

      <Tabs
        tabs={[
          { key: 'ALL', label: 'All' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'WAITING', label: 'Waiting' },
          { key: 'CLOSED', label: 'Closed' },
        ]}
        active={activeTab}
        onChange={(key) => { setPage(0); setActiveTab(key); }}
        className="mb-6"
      />

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-ink/[0.02]">
            <tr>
              {['Interest', 'Type', 'Level', 'Members', 'Status', ''].map((h, i) => (
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
          <tbody className="divide-y divide-line bg-[#FBF8F2]">
            {loading && rows.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-accent-500"><Spinner /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-mute">No groups here.</td></tr>
            ) : (
              rows.map((match) => {
                const matchId = match.matchGroupId || match.id;
                const isOpen = expanded === matchId;

                return (
                  <React.Fragment key={matchId}>
                    <tr
                      className={`cursor-pointer transition-colors hover:bg-ink/[0.02] ${isOpen ? 'bg-ink/[0.03]' : ''}`}
                      onClick={() => setExpanded(isOpen ? null : matchId)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{match.interestName}</div>
                        <div className="font-mono text-[10px] text-mute">{match.collegeName || matchId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-ink">{match.connectionType}</div>
                        <div className="text-xs text-mute">{match.projectType}</div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="secondary">{match.levelBand || 'UNRANKED'}</Badge></td>
                      <td className="px-4 py-3 text-ink tnum">
                        {match.memberCount ?? match.memberNames?.length ?? 0} / {match.maxMembers || 2}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          match.status === 'ACTIVE' ? 'success'
                          : match.status === 'WAITING' ? 'warning' : 'secondary'
                        }>
                          {match.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-bad hover:bg-bad/[0.07]"
                          onClick={(e) => { e.stopPropagation(); handleUnmatch(matchId, null, null); }}
                        >
                          Unmatch
                        </Button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan="6" className="border-b border-line bg-ink/[0.015] px-4 py-4">
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-mute">
                            Members ({match.memberNames?.length || 0})
                          </p>
                          {match.memberNames?.length > 0 ? (
                            <ul className="flex flex-wrap gap-2">
                              {match.memberNames.map((name, idx) => (
                                <li
                                  key={idx}
                                  className="inline-flex items-center gap-2 rounded border border-line bg-[#FBF8F2] px-2.5 py-1 text-xs text-ink"
                                >
                                  {name}
                                  {match.memberIds?.[idx] && (
                                    <button
                                      aria-label={`Remove ${name}`}
                                      onClick={() => handleUnmatch(matchId, match.memberIds[idx], name)}
                                      className="rounded-sm text-mute transition-colors hover:text-bad focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                                    >
                                      <X className="h-3 w-3" aria-hidden="true" />
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs italic text-mute">Nobody in this group.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {matches?.totalPages > 1 && (
        <Pagination
          page={matches.page ?? page}
          totalPages={matches.totalPages}
          onPageChange={setPage}
          className="mt-2 rounded-b-lg border-x border-b border-line bg-[#FBF8F2]"
        />
      )}

      <Modal open={forceModalOpen} onClose={() => setForceModalOpen(false)} title="Force a match">
        <div className="space-y-5">
          <div>
            <label htmlFor="uid-draft" className="mb-1.5 block text-sm font-medium text-ink">
              User ids
            </label>
            {userIds.length > 0 && (
              <ul className="mb-2 flex flex-wrap gap-2">
                {userIds.map((id) => (
                  <li
                    key={id}
                    className="inline-flex items-center gap-2 rounded border border-line bg-ink/[0.03] px-2 py-1 font-mono text-[11px] text-ink"
                  >
                    <span className="max-w-[16rem] truncate">{id}</span>
                    <button
                      aria-label={`Remove ${id}`}
                      onClick={() => setUserIds(userIds.filter((u) => u !== id))}
                      className="rounded-sm text-mute transition-colors hover:text-bad focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              id="uid-draft"
              value={userIdDraft}
              onChange={(e) => setUserIdDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitDraft(); }
                if (e.key === 'Backspace' && !userIdDraft && userIds.length) {
                  setUserIds(userIds.slice(0, -1));
                }
              }}
              onBlur={commitDraft}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (!/[,\s]/.test(text)) return;
                e.preventDefault();
                const parts = text.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
                setUserIds([...new Set([...userIds, ...parts])]);
              }}
              placeholder="Paste a UUID, press Enter"
              className="block h-11 w-full rounded border border-line bg-[#FBF8F2] px-3 font-mono text-xs text-ink placeholder:text-mute/55 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25"
            />
            <p className="mt-1.5 text-xs text-mute">Two or more. Enter, comma or paste a list.</p>
          </div>

          <Select
            label="Interest"
            options={interestOptions}
            value={matchForm.interestId}
            onChange={(e) => setMatchForm({ ...matchForm, interestId: e.target.value })}
          />

          <Select
            label="Connection type"
            options={[
              { value: 'ONE_ON_ONE', label: 'One on one' },
              { value: 'SHORT_GROUP', label: 'Small group' },
              { value: 'SOCIETY', label: 'Society' },
            ]}
            value={matchForm.connectionType}
            onChange={(e) => setMatchForm({ ...matchForm, connectionType: e.target.value })}
          />

          <Select
            label="Project type"
            options={[
              { value: 'SHORT_TERM', label: 'Short term' },
              { value: 'LONG_TERM', label: 'Long term' },
            ]}
            value={matchForm.projectType}
            onChange={(e) => setMatchForm({ ...matchForm, projectType: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setForceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateMatch} loading={loading}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
