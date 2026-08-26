import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, MapPin, GraduationCap, Building2, Flag, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TextArea from '../../components/ui/TextArea';
import { useUserStore } from '../../store/useUserStore';
import { useModerationStore } from '../../store/useModerationStore';

export default function PeerProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const { peerProfiles, fetchPeerProfile, loading } = useUserStore();
  const { blockUser, reportUser, loading: moderationLoading } = useModerationStore();
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const profile = peerProfiles[userId];

  useEffect(() => {
    fetchPeerProfile(userId).catch(() => {
      toast.error("Failed to load peer profile");
      navigate('/matches');
    });
  }, [userId]);

  const handleBlock = async () => {
    try {
      await blockUser(userId);
      toast.success("User blocked");
      navigate('/matches');
    } catch (error) {
      toast.error(error.message || "Failed to block user");
    } finally {
      setBlockModalOpen(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      await reportUser(userId, reportReason);
      toast.success("Report submitted successfully");
      setReportModalOpen(false);
      setReportReason('');
    } catch (error) {
      toast.error(error.message || "Failed to submit report");
    }
  };

  if (loading && !profile) {
    return <div className="text-center py-20 text-gray-500">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-red-500">Profile not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      <div className="relative rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gray-200"></div>
        
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
              <div className="relative">
                <Avatar src={profile.profilePhotoUrl} name={profile.name} size="xl" className="border-4 border-white shadow-md bg-white" />
                {profile.verified && (
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-brand-500" />
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
                <div className="flex items-center justify-center sm:justify-start mt-1 space-x-3 text-sm text-gray-500">
                  <span className="flex items-center"><Building2 className="w-4 h-4 mr-1" /> {profile.collegeName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <GraduationCap className="w-5 h-5 mr-3 text-gray-400" />
                    Year {profile.yearOfStudy} Student
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                    {profile.city}
                  </div>
                </div>
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Top Interests</h3>
                  <div className="space-y-3">
                    {profile.interests.map(i => (
                      <div key={i.interestId} className="flex flex-col">
                        <span className="font-medium text-gray-900 text-sm mb-1">{i.interestName}</span>
                        <Badge variant="secondary" className="w-fit text-xs bg-brand-50 text-brand-700 border-brand-200">
                          {i.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Icebreakers</h3>
                <div className="space-y-4">
                  {[
                    { q: "What drives you?", a: profile.storyPrompt1 },
                    { q: "What are you currently working on?", a: profile.storyPrompt2 },
                    { q: "Fun fact about you", a: profile.storyPrompt3 }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{item.q}</p>
                      <p className="text-gray-900 text-sm leading-relaxed">{item.a || <span className="text-gray-400 italic">No answer provided.</span>}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setReportModalOpen(true)} icon={<Flag className="w-4 h-4" />}>
              Report
            </Button>
            <Button variant="outline" onClick={() => setBlockModalOpen(true)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" icon={<Ban className="w-4 h-4" />}>
              Block User
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={blockModalOpen} onClose={() => setBlockModalOpen(false)} title="Block User">
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to block {profile.name}? You will no longer see them in matches or chats, and they won't be able to contact you.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
          <Button onClick={handleBlock} loading={moderationLoading} className="bg-red-600 hover:bg-red-700">Block</Button>
        </div>
      </Modal>

      <Modal open={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report User">
        <p className="text-sm text-gray-500 mb-4">
          Please describe why you are reporting this user. Our moderation team will review this report.
        </p>
        <TextArea 
          placeholder="Harassment, spam, inappropriate content, etc." 
          value={reportReason} 
          onChange={(e) => setReportReason(e.target.value)}
          rows={4}
          className="mb-6"
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setReportModalOpen(false)}>Cancel</Button>
          <Button onClick={handleReport} loading={moderationLoading}>Submit Report</Button>
        </div>
      </Modal>
    </div>
  );
}