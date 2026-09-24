import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Tabs from '../../components/ui/Tabs';
import ThreadAvatar from './ThreadAvatar';
import { cn } from '../../lib/utils';
import { useChatStore } from '../../store/useChatStore';

const TYPE_LABEL = { ONE_ON_ONE: '1:1', GROUP: 'Group', SOCIETY: 'Society' };

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

/**
 * The persistent thread rail — ChatShell's left pane. Opening a thread never
 * unmounts this; it navigates the right pane only, the way a real chat client
 * (WhatsApp Web, Slack, Telegram) never re-renders its own thread list to
 * show you a conversation.
 */
export default function ChatSidebar() {
  const navigate = useNavigate();
  const { roomId: activeRoomId } = useParams();
  const { chatList, fetchChatList, loading } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('LONG_TERM');

  useEffect(() => {
    fetchChatList().catch(console.error);
  }, []);

  const safeChatList = Array.isArray(chatList) ? chatList : [];

  const filteredChats = safeChatList.filter((chat) => {
    if (chat.projectType !== mode) return false;
    const term = searchTerm.toLowerCase();
    return (chat.title || '').toLowerCase().includes(term)
      || (chat.interestName || '').toLowerCase().includes(term);
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-3.5 border-b border-line p-4">
        <h1 className="font-display text-xl font-bold tracking-tight text-ink">Threads</h1>

        {safeChatList.length > 4 && (
          <Input
            placeholder="Search"
            icon={<Search className="h-4 w-4" aria-hidden="true" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search threads"
          />
        )}

        <Tabs
          tabs={[
            { key: 'LONG_TERM', label: 'Long term peer' },
            { key: 'SHORT_TERM', label: 'Short term buddy' },
          ]}
          active={mode}
          onChange={setMode}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading && safeChatList.length === 0 ? (
          <ul className="space-y-1">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex animate-pulse items-center gap-3 rounded-lg px-2 py-2.5">
                <div className="h-10 w-10 shrink-0 rounded bg-line/60" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-2/3 rounded-sm bg-line" />
                  <div className="mt-2.5 h-3 w-4/5 rounded-sm bg-line/60" />
                </div>
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
                : `No ${mode === 'LONG_TERM' ? 'long-haul' : 'short-burst'} rooms yet.`
            }
            actionLabel={!searchTerm ? 'Find peers' : null}
            onAction={!searchTerm ? () => navigate('/matches') : null}
            className="border-none bg-transparent py-10"
          />
        ) : (
          <ul className="space-y-1">
            {filteredChats.map((chat) => {
              const unread = chat.unreadCount > 0;
              const active = chat.chatRoomId === activeRoomId;
              return (
                <li key={chat.chatRoomId}>
                  <button
                    onClick={() => navigate(`/chat/${chat.chatRoomId}`)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-inset',
                      active ? 'bg-accent-50' : 'hover:bg-ink/[0.035]'
                    )}
                  >
                    <ThreadAvatar type={chat.type} members={chat.members} size="sm" />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`truncate text-sm ${unread ? 'font-semibold text-ink' : 'font-medium text-ink/80'}`}>
                          {chat.title || chat.interestName || 'Chat'}
                        </span>
                        {chat.type && (
                          <Badge variant={chat.type === 'ONE_ON_ONE' ? 'primary' : 'default'} className="shrink-0">
                            {TYPE_LABEL[chat.type] || chat.type}
                          </Badge>
                        )}
                      </span>
                      <span className={`mt-0.5 block truncate text-xs ${unread ? 'text-ink' : 'text-mute'}`}>
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
                        <span className="grad-brand-cta rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-white tnum">
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
    </div>
  );
}
