import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';
import { useChatStore } from '../../store/useChatStore';
import { webSocketService } from '../../services/websocket';
import { snappy, useReducedMotion, transition } from '../../lib/motion';
import { cn } from '../../lib/utils';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const {
    currentRoom, rooms, messages, systemEvents,
    fetchRoom, fetchMessages, sendMessage, markRead, loading,
  } = useChatStore();

  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const initialRenderRef = useRef(true);

  const room = (rooms && rooms[roomId]) || currentRoom;
  const roomMessages = messages[roomId] || [];
  const joins = systemEvents?.[roomId] || [];

  useEffect(() => {
    const init = async () => {
      try {
        await fetchRoom(roomId);
        await fetchMessages(roomId, 0);
        await markRead(roomId);

        webSocketService.connect();
        webSocketService.subscribe(roomId);
      } catch {
        toast.error('Could not open that room');
        navigate('/chat');
      }
    };
    init();

    return () => {
      webSocketService.unsubscribe(roomId);
    };
  }, [roomId]);

  // Mark read when someone else's message lands while we are looking.
  useEffect(() => {
    const unread = roomMessages.filter((m) => !m.mine && m.receiptStatus !== 'READ').length;
    if (unread > 0) markRead(roomId).catch(() => {});
  }, [roomMessages.length]);

  useEffect(() => {
    // Jump on first paint, glide afterwards.
    messagesEndRef.current?.scrollIntoView({
      behavior: initialRenderRef.current || reduced ? 'auto' : 'smooth',
    });
    initialRenderRef.current = false;
  }, [roomMessages.length, joins.length]);

  const handleSend = async () => {
    if (!content.trim() || sending) return;
    try {
      setSending(true);
      // REST send. The socket echo is deduped by the store.
      await sendMessage(roomId, content.trim());
      setContent('');
    } catch (error) {
      toast.error(error.message || 'That did not send');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Ticks belong to your own messages only.
  const renderReceipt = (message) => {
    if (!message.mine) return null;
    const base = 'ml-1 h-3 w-3 shrink-0';
    switch (message.receiptStatus) {
      case 'READ':
        return <CheckCheck className={cn(base, 'text-accent-600')} aria-label="Read" />;
      case 'DELIVERED':
        return <CheckCheck className={cn(base, 'text-mute')} aria-label="Delivered" />;
      case 'SENT':
      default:
        return <Check className={cn(base, 'text-mute/60')} aria-label="Sent" />;
    }
  };

  if (loading && !room) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-accent-500">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!room) {
    return <p className="py-24 text-center text-sm text-mute">That room is not here.</p>;
  }

  const roomTitle = room.title || room.interestName || 'Chat';
  const memberCount = room.members?.length || 0;
  const isGroup = memberCount > 2;

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-lg border border-line bg-[#FBF8F2]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
        <button
          onClick={() => navigate('/chat')}
          aria-label="Back to threads"
          className="-ml-1 rounded p-1.5 text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-base font-semibold leading-tight tracking-tight text-ink">
            {roomTitle}
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mute">
            {memberCount} {memberCount === 1 ? 'person' : 'people'}
            {room.interestName ? ` · ${room.interestName}` : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        role="log"
        aria-label="Messages"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto px-4 py-5"
      >
        {roomMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-lg font-semibold tracking-tight text-ink">
              {room.emptyStateMessage || 'Nobody has said anything yet.'}
            </p>
            <p className="mt-2 text-sm text-mute">
              Someone has to go first. It might as well be you.
            </p>
          </div>
        ) : (
          roomMessages.map((message, index) => {
            const isMine = message.mine;
            const prev = roomMessages[index - 1];
            const showName = isGroup && !isMine && prev?.senderId !== message.senderId;
            const key = message.id || message.clientMessageId || `${message.sentAt}-${index}`;

            return (
              <motion.div
                key={key}
                // New bubbles rise from the bottom; history does not animate.
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition(snappy, reduced)}
                className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
              >
                <div className={cn('max-w-[78%]', isMine ? 'items-end' : 'items-start')}>
                  {showName && (
                    <p className="mb-1 ml-0.5 font-mono text-[10px] uppercase tracking-widest text-mute">
                      {message.senderName}
                    </p>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-3.5 py-2.5',
                      isMine
                        ? 'bg-accent-500 text-white'
                        : 'border border-line bg-paper text-ink'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <div className={cn('mt-1 flex items-center', isMine ? 'justify-end' : 'justify-start')}>
                    <span className="text-[10px] text-mute tnum">
                      {message.sentAt
                        ? new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                    {renderReceipt(message)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* MEMBER_JOINED, as a quiet system line — never a bubble. */}
        {joins.map((join) => (
          <p key={join.id} className="py-1 text-center font-mono text-[10px] uppercase tracking-widest text-mute">
            {join.name} joined
          </p>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line px-4 py-3">
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <textarea
            id="chat-input"
            rows={1}
            placeholder="Say something"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-h-32 flex-1 resize-none rounded border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-mute/55 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25"
          />
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            aria-label="Send message"
            className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-accent-500 text-white transition-colors hover:bg-accent-600 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            {sending ? <Spinner size="sm" className="text-current" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-mute/70">Enter sends · Shift+Enter for a new line</p>
      </div>
    </div>
  );
}
