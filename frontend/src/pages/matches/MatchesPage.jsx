import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { useMatchStore } from '../../store/useMatchStore';
import { useUserStore } from '../../store/useUserStore';
import toast from 'react-hot-toast';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { circle, fetchCircle, findMatches, loading } = useMatchStore();
  const { profile } = useUserStore();
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [matchResults, setMatchResults] = useState(null);

  useEffect(() => {
    fetchCircle().catch(console.error);
  }, []);

  const isVerified = profile?.verificationStatus === 'APPROVED';

  const handleFindMatches = async () => {
    if (!isVerified) {
      toast.error("Your student verification is still in review. Matching will unlock once approved!");
      return;
    }
    try {
      const response = await findMatches();
      const results = response.results || [];
      setMatchResults(results);
      if (results.length > 0) {
        toast.success(`Processed ${results.length} interests.`);
        fetchCircle(); // Refresh circle data
      } else {
        toast.error("No active interests to match. Please select interests in your profile.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to find matches");
    }
  };

  const tabs = [
    { key: 'ACTIVE', label: `Active (${circle?.activeGroups?.length || 0})` },
    { key: 'WAITING', label: `Waiting (${circle?.waitingGroups?.length || 0})` },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matches & Circle</h1>
        <p className="mt-1 text-sm text-gray-500">Find new peers and manage your active connections.</p>
      </div>

      {/* Match Engine Section */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-200 p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-50 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          {!isVerified && profile && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Student verification is pending review. You will be able to run matchmaking as soon as an admin approves your document.</span>
              </div>
              <button 
                onClick={() => navigate('/onboarding')} 
                className="font-semibold text-amber-700 hover:text-amber-900 underline ml-2 flex-shrink-0"
              >
                View Status
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Looking for a match?</h2>
              <p className="text-sm text-gray-500">Run the matchmaking engine to find peers in your selected interests.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                onClick={handleFindMatches} 
                loading={loading} 
                icon={<Search className="w-4 h-4" />}
                variant={!isVerified ? 'secondary' : 'primary'}
              >
                Find Matches Now
              </Button>
            </div>
          </div>

          {matchResults && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Match Results</h3>
              <div className="space-y-3">
                {matchResults.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-gray-900">{result.interestName}</span>
                        <Badge variant={
                          result.outcome === 'MATCHED' ? 'success' : 
                          result.outcome === 'QUEUED' ? 'warning' : 'secondary'
                        }>
                          {result.outcome}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                    {result.outcome === 'MATCHED' && result.chatRoomId && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/chat/${result.chatRoomId}`)}>
                        Chat
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Circle Section */}
      <div>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-6" />

        {activeTab === 'ACTIVE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circle?.activeGroups?.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={Users}
                  title="No active groups"
                  description="You haven't matched with anyone yet. Click 'Find Matches' above to start!"
                />
              </div>
            ) : (
              circle?.activeGroups?.map(group => (
                <div 
                  key={group.id} 
                  onClick={() => navigate(`/matches/${group.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:border-brand-300 hover:shadow-md transition-all group-card"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-brand-50 text-brand-700 border-brand-200">
                      {group.projectType}
                    </Badge>
                    <Badge>{group.connectionType}</Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={group.interestName}>
                    {group.interestName}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4 mr-1.5" />
                    {group.memberCount} / {group.maxMembers} members
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-brand-600 font-medium text-sm group-hover:text-brand-700">
                    <span>View Group</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'WAITING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circle?.waitingGroups?.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  icon={Clock}
                  title="No pending queues"
                  description="You are not waiting for any matches right now."
                />
              </div>
            ) : (
              circle?.waitingGroups?.map(group => (
                <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="warning">In Queue</Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                    {group.interestName}
                  </h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Waiting for {group.connectionType}
                    </div>
                    {group.position && (
                      <div className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100">
                        Position in queue: <span className="text-brand-600">{group.position}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}