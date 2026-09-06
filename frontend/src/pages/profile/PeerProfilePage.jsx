import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TextArea from '../../components/ui/TextArea';
import Spinner from '../../components/ui/Spinner';
import { useUserStore } from '../../store/useUserStore';
import { useModerationStore } from '../../store/useModerationStore';

const PROMPTS = [
  { key: 'storyPrompt1', q: 'What are you actually into?' },
  { key: 'storyPrompt2', q: "What's open on your laptop right now?" },
  { key: 'storyPrompt3', q: 'One thing people find out about you late' },
];

export default function PeerProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { peerProfile, fetchPeerProfile, loading } = useUserStore();
  const { blockUser, reportUser, loading: moderationLoading } = useModerationStore();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [loaded, setLoaded] = useState(false);

  // The store keeps a single peerProfile, populated by fetchPeerProfile below.
  const profile = peerProfile?.id === userId ? peerProfile : null;

  useEffect(() => {
    setLoaded(false);
    fetchPeerProfile(userId)
      .catch(() => {
        toast.error('Could not load that profile');
        navigate('/matches');
      })
      .finally(() => setLoaded(true));
  }, [userId]);

  const handleBlock = async () => {
    try {
      await blockUser(userId);
      toast.success('Blocked');
      navigate('/matches');
    } catch (error) {
      toast.error(error.message || 'Could not block');
    } finally {
      setBlockModalOpen(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Say what happened first');
      return;
    }
    try {
      await reportUser(userId, reportReason);
      toast.success('Sent to moderation');
      setReportModalOpen(false);
      setReportReason('');
    } catch (error) {
      toast.error(error.message || 'Could not send that');
    }
  };

  if (!profile && (loading || !loaded)) {
    return (
      <div className="flex justify-center py-24 text-accent-500">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return <p className="py-24 text-center text-sm text-mute">No such profile.</p>;
  }

  return (
    <div className="space-y-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm text-mute transition-colors hover:text-ink rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Back
      </button>

      <header className="flex items-center gap-5">
        <Avatar src={profile.profilePhotoUrl} name={profile.name} size="2xl" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tightest text-ink">
            {profile.name}
          </h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-mute">
            {profile.collegeName}
            {profile.yearOfStudy ? ` · Year ${profile.yearOfStudy}` : ''}
            {profile.city ? ` · ${profile.city}` : ''}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="space-y-10">
          {profile.interests?.length > 0 && (
            <section>
              <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
                Works on
              </h2>
              <ul className="divide-y divide-line border-y border-line">
                {/* PeerInterest has no id — key on the natural pair. */}
                {profile.interests.map((i) => (
                  <li key={`${i.interestName}-${i.projectType}`} className="flex items-baseline justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ink">{i.interestName}</span>
                      {i.subTag && (
                        <span className="mt-0.5 block truncate text-xs text-mute">{i.subTag}</span>
                      )}
                    </span>
                    <Badge variant="secondary">{i.level}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.proofOfWorkUrl && (
            <section>
              <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-mute">
                Proof of work
              </h2>
              <a
                href={profile.proofOfWorkUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-sm text-accent-700 underline decoration-accent-300 underline-offset-4 hover:text-accent-800 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                {profile.proofOfWorkUrl}
              </a>
            </section>
          )}
        </div>

        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
            In their words
          </h2>
          <div className="divide-y divide-line border-y border-line">
            {PROMPTS.map(({ key, q }) => (
              <div key={key} className="py-5">
                <p className="text-xs text-mute">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {profile[key] || <span className="italic text-mute/60">Left blank.</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setReportModalOpen(true)}>
              Report
            </Button>
            <Button variant="ghost" size="sm" className="text-bad hover:bg-bad/[0.07]" onClick={() => setBlockModalOpen(true)}>
              Block
            </Button>
          </div>
        </section>
      </div>

      <Modal open={blockModalOpen} onClose={() => setBlockModalOpen(false)} title="Block this person">
        <p className="text-sm leading-relaxed text-mute">
          {profile.name} will not show up in your matches or chats again, and
          cannot reach you.
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBlock} loading={moderationLoading}>Block</Button>
        </div>
      </Modal>

      <Modal open={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report this person">
        <p className="mb-4 text-sm leading-relaxed text-mute">
          Say what happened. A human reads these.
        </p>
        <TextArea
          placeholder="What they did…"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          rows={4}
          aria-label="Reason for reporting"
        />
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setReportModalOpen(false)}>Cancel</Button>
          <Button onClick={handleReport} loading={moderationLoading}>Send</Button>
        </div>
      </Modal>
    </div>
  );
}
