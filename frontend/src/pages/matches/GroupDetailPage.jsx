import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MessageSquare, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useMatchStore } from '../../store/useMatchStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { groups, fetchGroup, leaveGroup, loading } = useMatchStore();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const group = groups[groupId];

  useEffect(() => {
    fetchGroup(groupId).catch(() => {
      toast.error("Failed to load group details");
      navigate('/matches');
    });
  }, [groupId]);

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId);
      toast.success("Left the group successfully");
      navigate('/matches');
    } catch (error) {
      toast.error(error.message || "Failed to leave group");
      setLeaveModalOpen(false);
    }
  };

  if (loading && !group) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!group) {
    return <div className="text-center py-20 text-gray-500">Group not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate('/matches')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to matches
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner area */}
        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-800 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        </div>
        
        {/* Main Info */}
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 -mt-10">
            <div className="bg-white p-2 rounded-xl shadow-sm inline-block">
              <div className="h-16 w-16 bg-brand-100 rounded-lg flex items-center justify-center border-2 border-brand-200">
                <Users className="w-8 h-8 text-brand-600" />
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex gap-3">
              {group.status === 'ACTIVE' && group.chatRoomId && (
                <Button 
                  onClick={() => navigate(`/chat/${group.chatRoomId}`)}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Open Chat
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setLeaveModalOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-500"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Leave Group</span>
              </Button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{group.interestName}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">{group.projectType}</Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">{group.connectionType}</Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Level: {group.levelBand}</Badge>
              <Badge variant={group.status === 'ACTIVE' ? 'success' : 'warning'}>{group.status}</Badge>
            </div>
          </div>

          {/* Members List */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              Members <span className="ml-2 text-sm font-normal text-gray-500">({group.memberCount} / {group.maxMembers})</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.members?.map(member => (
                <div 
                  key={member.userId} 
                  className="flex items-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate(`/profile/${member.userId}`)}
                >
                  <Avatar 
                    src={member.profilePhotoUrl} 
                    name={member.name} 
                    size="md" 
                    className="mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {member.name} {member.userId === user.id && <span className="text-gray-400 font-normal ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      Year {member.yearOfStudy} • Level: {member.level}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, group.maxMembers - group.memberCount) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center p-4 rounded-xl border border-dashed border-gray-300 bg-white">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Looking for member...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal 
        open={leaveModalOpen} 
        onClose={() => setLeaveModalOpen(false)}
        title="Leave Group"
      >
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to leave this group? You will be removed from the chat room and will need to match again to find a new group.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleLeaveGroup} 
            loading={loading}
            className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
          >
            Leave Group
          </Button>
        </div>
      </Modal>
    </div>
  );
}