import { useState, useEffect } from 'react';
import { Loader2, Plus, Zap, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { useAdminStore } from '../../store/useAdminStore';
import { useInterestStore } from '../../store/useInterestStore';

export default function AdminMatchesPage() {
  const { matches, fetchMatches, createMatch, unmatch, loading } = useAdminStore();
  const { catalog, fetchCatalog } = useInterestStore();
  
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedMatch, setExpandedMatch] = useState(null);
  
  // Force Match Modal State
  const [forceModalOpen, setForceModalOpen] = useState(false);
  const [matchForm, setMatchForm] = useState({
    userIds: '', // comma separated for simplicity in this mock UI
    interestId: '',
    connectionType: 'ONE_ON_ONE',
    projectType: 'SHORT_TERM'
  });

  useEffect(() => {
    fetchMatches().catch(console.error);
    fetchCatalog().catch(console.error);
  }, []);

  const filteredMatches = matches?.filter(match => {
    if (activeTab === 'ALL') return true;
    return match.status === activeTab;
  }) || [];

  const handleCreateMatch = async () => {
    const ids = matchForm.userIds.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length < 2) {
      toast.error('Please enter at least 2 user IDs');
      return;
    }
    if (!matchForm.interestId) {
      toast.error('Please select an interest');
      return;
    }

    try {
      await createMatch(ids, matchForm.interestId, matchForm.connectionType, matchForm.projectType);
      toast.success('Match created successfully');
      setForceModalOpen(false);
      setMatchForm({ userIds: '', interestId: '', connectionType: 'ONE_ON_ONE', projectType: 'SHORT_TERM' });
    } catch (error) {
      toast.error(error.message || 'Failed to create match');
    }
  };

  const handleUnmatch = async (matchGroupId, userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this match?`)) return;
    
    try {
      await unmatch(matchGroupId, userId);
      toast.success('User removed from match');
    } catch (error) {
      toast.error(error.message || 'Failed to remove user');
    }
  };

  // Compile interests for select
  const interestOptions = [];
  if (catalog) {
    catalog.longTerm?.interests?.forEach(i => interestOptions.push({ value: i.id, label: `(Long) ${i.name}` }));
    catalog.shortTerm?.interests?.forEach(i => interestOptions.push({ value: i.id, label: `(Short) ${i.name}` }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage match groups.</p>
        </div>
        <div>
          <Button onClick={() => setForceModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Force Match
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 border-b border-gray-200">
          <Tabs 
            tabs={[
              { key: 'ALL', label: 'All Matches' },
              { key: 'ACTIVE', label: 'Active' },
              { key: 'WAITING', label: 'Waiting (Partial)' },
              { key: 'CLOSED', label: 'Closed' },
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !matches ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : filteredMatches.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No matches found.</td></tr>
              ) : (
                filteredMatches.map((match) => (
                  <React.Fragment key={match.id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer ${expandedMatch === match.id ? 'bg-brand-50' : ''}`}
                      onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{match.interestName}</div>
                        <div className="text-xs text-gray-500">{match.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{match.connectionType}</div>
                        <div className="text-xs text-gray-500">{match.projectType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{match.levelBand}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {match.memberCount} / {match.maxMembers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={match.status === 'ACTIVE' ? 'success' : match.status === 'WAITING' ? 'warning' : 'secondary'}>
                          {match.status}
                        </Badge>
                      </td>
                    </tr>
                    
                    {expandedMatch === match.id && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">Group Members</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {match.members?.map(member => (
                              <div key={member.userId} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                                <div className="flex items-center truncate">
                                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs mr-3 flex-shrink-0">
                                    {member.name.charAt(0)}
                                  </div>
                                  <div className="truncate">
                                    <p className="text-sm font-bold text-gray-900 truncate">{member.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{member.userId}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleUnmatch(match.id, member.userId, member.name); }}
                                  className="ml-2 text-red-500 hover:text-red-700 p-1"
                                  title="Remove from match"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={forceModalOpen} onClose={() => setForceModalOpen(false)} title="Force Create Match">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User IDs (comma separated)</label>
            <textarea
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
              rows={3}
              value={matchForm.userIds}
              onChange={(e) => setMatchForm({...matchForm, userIds: e.target.value})}
              placeholder="user_id_1, user_id_2"
            />
          </div>
          
          <Select
            label="Interest"
            options={interestOptions}
            value={matchForm.interestId}
            onChange={(e) => setMatchForm({...matchForm, interestId: e.target.value})}
          />
          
          <Select
            label="Connection Type"
            options={[
              { value: 'ONE_ON_ONE', label: '1-on-1' },
              { value: 'SHORT_GROUP', label: 'Short Group' },
              { value: 'SOCIETY', label: 'Society' }
            ]}
            value={matchForm.connectionType}
            onChange={(e) => setMatchForm({...matchForm, connectionType: e.target.value})}
          />
          
          <Select
            label="Project Type"
            options={[
              { value: 'SHORT_TERM', label: 'Short-Term' },
              { value: 'LONG_TERM', label: 'Long-Term' }
            ]}
            value={matchForm.projectType}
            onChange={(e) => setMatchForm({...matchForm, projectType: e.target.value})}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setForceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateMatch} loading={loading} icon={<Zap className="w-4 h-4" />}>
              Create Match
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}