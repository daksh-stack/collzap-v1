import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { useChatStore } from '../../store/useChatStore';

function relativeTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  const secs = Math.floor((Date.now() - date) / 1000);
  if (secs < 60) return 'now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  if (secs < 172800) return 'yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ChatListPage() {
  const navigate = useNavigate();
  const { chatList, fetchChatList, loading } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChatList().catch(console.error);
  }, []);

  const safeChatList = Array.isArray(chatList) ? chatList : [];

  const filteredChats = safeChatList.filter((chat) => {
    const term = searchTerm.toLowerCase();
    return (chat.title || '').toLowerCase().includes(term)
      || (chat.interestName || '').toLowerCase().includes(term);
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tightest text-ink">
            Threads
          </h1>
          <p className="mt-3 text-sm text-mute">
            Every group you matched into gets one room. That is all.
          </p>
        </div>
        {safeChatList.length > 4 && (
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search"
              icon={<Search className="h-4 w-4" aria-hidden="true" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search threads"
            />
          </div>
        )}
      </header>

      {loading && safeChatList.length === 0 ? (
        <ul className="divide-y divide-line border-y border-line">
          {[1, 2, 3].map((i) => (
            <li key={i} className="animate-pulse py-5">
              <div className="h-3 w-1/4 rounded-sm bg-line" />
              <div className="mt-2 h-3 w-2/5 rounded-sm bg-line/60" />
            </li>
          ))}
        </ul>
      ) : filteredChats.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={searchTerm ? 'Nothing by that name' : 'No rooms yet'}
          description={
            searchTerm
              ? 'Try fewer letters.'
              : 'Rooms appear the moment a match lands.'
          }
          actionLabel={!searchTerm ? 'Find peers' : null}
          onAction={!searchTerm ? () => navigate('/matches') : null}
        />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {filteredChats.map((chat) => {
            const unread = chat.unreadCount > 0;
            return (
              <li key={chat.chatRoomId}>
                <button
                  onClick={() => navigate(`/chat/${chat.chatRoomId}`)}
                  className="group flex w-full items-start justify-between gap-4 py-5 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2.5">
                      <span className={`truncate text-sm ${unread ? 'font-semibold text-ink' : 'font-medium text-ink/80'}`}>
                        {chat.title || chat.interestName || 'Chat'}
                      </span>
                      {chat.type && (
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-mute">
                          {chat.type}
                        </span>
                      )}
                    </span>
                    <span className={`mt-1 block truncate text-sm ${unread ? 'text-ink' : 'text-mute'}`}>
                      {chat.lastMessagePreview || (
                        <span className="italic text-mute/70">Still quiet in there.</span>
                      )}
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-[10px] text-mute tnum">
                      {relativeTime(chat.lastMessageAt)}
                    </span>
                    {unread && (
                      <span className="rounded-sm bg-accent-500 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white tnum">
                        {chat.unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
