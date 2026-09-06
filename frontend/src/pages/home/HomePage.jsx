import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useMatchStore } from '../../store/useMatchStore';
import { useChatStore } from '../../store/useChatStore';
import { useUserStore } from '../../store/useUserStore';

function relativeTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  if (secs < 172800) return 'yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HomePage() {
  const navigate = useNavigate();
  const { circle, fetchCircle } = useMatchStore();
  const { chatList, fetchChatList } = useChatStore();
  const { profile } = useUserStore();

  useEffect(() => {
    fetchCircle().catch(console.error);
    fetchChatList().catch(console.error);
  }, []);

  const connections = circle?.connections || [];
  const waiting = circle?.waiting || [];
  const recentChats = (Array.isArray(chatList) ? chatList : []).slice(0, 3);
  const firstName = profile?.name?.split(' ')[0];

  return (
    <div className="space-y-14">
      <header>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tightest text-ink">
          {connections.length > 0
            ? 'You have people to work with.'
            : firstName ? `Nothing on your desk yet, ${firstName}.` : 'Nothing on your desk yet.'}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
          {connections.length > 0
            ? 'Pick up where you stopped, or go looking for one more.'
            : 'Run the matcher once and see who else is up at this hour.'}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* The one act */}
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
            Start here
          </h2>
          <div className="rounded-lg border border-line bg-[#FBF8F2] p-6">
            <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-ink">
              Find peers
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              Same interest, same level band, same campus. Takes a second.
            </p>
            <Button
              onClick={() => navigate('/matches')}
              className="mt-6 w-full"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Go to matches
            </Button>
          </div>

          {waiting.length > 0 && (
            <p className="mt-4 text-xs text-mute">
              <span className="text-ink tnum">{waiting.length}</span>{' '}
              {waiting.length === 1 ? 'interest is' : 'interests are'} still in the queue.
            </p>
          )}
        </section>

        {/* Live connections */}
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
            Your people
          </h2>

          {connections.length === 0 ? (
            <p className="border-t border-line pt-4 text-sm text-mute">
              Nobody yet. That is normal on day one.
            </p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {connections.slice(0, 5).map((group) => (
                <li key={group.id}>
                  <button
                    onClick={() => navigate(`/matches/${group.id}`)}
                    className="group flex w-full items-baseline justify-between gap-4 py-3.5 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {group.interestName}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-widest text-mute">
                        {group.connectionType} · {group.levelBand}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-mute tnum">
                      {group.memberCount}/{group.maxMembers}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {connections.length > 5 && (
            <button
              onClick={() => navigate('/matches')}
              className="mt-3 text-xs text-accent-700 underline decoration-accent-300 underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              All {connections.length}
            </button>
          )}
        </section>

        {/* Last threads */}
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
            Last said
          </h2>

          {recentChats.length === 0 ? (
            <p className="border-t border-line pt-4 text-sm text-mute">
              No threads open.
            </p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {recentChats.map((chat) => (
                <li key={chat.chatRoomId}>
                  <button
                    onClick={() => navigate(`/chat/${chat.chatRoomId}`)}
                    className="flex w-full items-start justify-between gap-3 py-3.5 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {chat.title || chat.interestName || 'Chat'}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-mute">
                        {chat.lastMessagePreview || 'Nobody has said anything yet.'}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {chat.unreadCount > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                      )}
                      <span className="text-[10px] text-mute tnum">
                        {relativeTime(chat.lastMessageAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
