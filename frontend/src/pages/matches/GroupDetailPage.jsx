import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useMatchStore } from '../../store/useMatchStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const { currentGroup, fetchGroup, leaveGroup, loading } = useMatchStore();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // The store keeps a single currentGroup, populated by fetchGroup below.
  // Guard against rendering a stale group while a different id is loading.
  const group = currentGroup?.id === groupId ? currentGroup : null;

  useEffect(() => {
    setLoaded(false);
    fetchGroup(groupId)
      .catch(() => {
        toast.error('Could not load that group');
        navigate('/matches');
      })
      .finally(() => setLoaded(true));
  }, [groupId]);

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(groupId);
      toast.success('You left the group');
      navigate('/matches');
    } catch (error) {
      toast.error(error.message || 'Could not leave');
      setLeaveModalOpen(false);
    }
  };

  if (!group && (loading || !loaded)) {
    return (
      <div className="flex justify-center py-24 text-accent-500">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return <p className="py-24 text-center text-sm text-mute">That group is not here.</p>;
  }

  const emptySeats = Math.max(0, (group.maxMembers || 0) - (group.memberCount || 0));

  return (
    <div className="space-y-12">
      <button
        onClick={() => navigate('/matches')}
        className="inline-flex items-center text-sm text-mute transition-colors hover:text-ink rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Matches
      </button>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-700">
            {group.projectType} · {group.connectionType}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink">
            {group.interestName}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant={group.status === 'ACTIVE' ? 'success' : 'warning'}>{group.status}</Badge>
            <Badge variant="secondary">Level {group.levelBand}</Badge>
          </div>
        </div>

        <div className="flex shrink-0 gap-3">
          {group.status === 'ACTIVE' && group.chatRoomId && (
            <Button
              onClick={() => navigate(`/chat/${group.chatRoomId}`)}
              icon={<MessageSquare className="h-4 w-4" />}
            >
              Open chat
            </Button>
          )}
          <Button variant="secondary" onClick={() => setLeaveModalOpen(true)}>
            Leave
          </Button>
        </div>
      </header>

      <section>
        <h2 className="mb-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-mute">
          <span>{group.connectionType === 'ONE_ON_ONE' ? 'In this connection' : 'In this group'}</span>
          <span className="tnum">{group.memberCount}/{group.maxMembers}</span>
        </h2>

        <ul className="divide-y divide-line border-y border-line">
          {group.members?.map((member) => {
            const isMe = member.self || member.userId === user?.id;
            return (
            <li key={member.userId}>
              <button
                onClick={() => navigate(isMe ? '/profile' : `/profile/${member.userId}`)}
                className="flex w-full items-center gap-4 py-4 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <Avatar src={member.profilePhotoUrl} name={member.name} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {member.name}
                    {isMe && (
                      <span className="ml-2 font-normal text-mute">you</span>
                    )}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-mute">
                    Year {member.yearOfStudy} · {member.level}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-mute">
                  {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : ''}
                </span>
              </button>
            </li>
          )})}

          {Array.from({ length: emptySeats }).map((_, i) => (
            <li key={`seat-${i}`} className="flex items-center gap-4 py-4">
              <span className="h-10 w-10 shrink-0 rounded border border-dashed border-line" />
              <span className="text-sm text-mute/70">Seat open</span>
            </li>
          ))}
        </ul>
      </section>

      <Modal open={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title={group.connectionType === 'ONE_ON_ONE' ? 'Leave this connection' : 'Leave this group'}>
        <p className="text-sm leading-relaxed text-mute">
          You will drop out of the chat too, and you would have to match again to
          get back in with {group.connectionType === 'ONE_ON_ONE' ? 'this person' : 'these people'}.
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setLeaveModalOpen(false)}>Stay</Button>
          <Button variant="danger" onClick={handleLeaveGroup} loading={loading}>
            Leave
          </Button>
        </div>
      </Modal>
    </div>
  );
}
