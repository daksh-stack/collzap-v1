import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Check, CheckCheck, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import TextArea from '../../components/ui/TextArea';
import Badge from '../../components/ui/Badge';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { webSocketService } from '../../services/websocket';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuthStore();
  const { currentRoom, rooms, messages, fetchRoom, fetchMessages, sendMessage, markRead, loading } = useChatStore();
  
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const room = (rooms && rooms[roomId]) || currentRoom;
  const roomMessages = messages[roomId] || [];

  // Fetch room data and connect WS
  useEffect(() => {
    const init = async () => {
      try {
        await fetchRoom(roomId);
        await fetchMessages(roomId, 0);
        await markRead(roomId);
        
        // Connect WebSocket and subscribe to this room
        webSocketService.connect();
        webSocketService.subscribe(roomId);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load chat room");
        navigate('/chat');
      }
    };
    init();

    return () => {
      webSocketService.unsubscribe(roomId);
    };
  }, [roomId]);

  // Mark read when new messages arrive and we are at the bottom
  useEffect(() => {
    const unreadCount = roomMessages.filter(m => !m.mine && m.receiptStatus !== 'READ').length;
    if (unreadCount > 0) {
      markRead(roomId).catch(console.error);
    }
  }, [roomMessages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(roomId, content.trim());
      setContent('');
      scrollToBottom();
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
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

  const renderMessageStatus = (message) => {
    if (!message.mine && message.senderId !== user?.id) return null;
    
    switch (message.receiptStatus) {
      case 'SENT':
        return <Check className="w-3 h-3 text-brand-200 ml-1" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3 h-3 text-brand-200 ml-1" />;
      case 'READ':
        return <CheckCheck className="w-3 h-3 text-blue-300 ml-1" />;
      default:
        return <Check className="w-3 h-3 text-brand-200 ml-1 opacity-60" />;
    }
  };

  if (loading && !room) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!room) {
    return <div className="text-center py-20 text-gray-500">Room not found.</div>;
  }

  const roomTitle = room?.title || room?.roomName || room?.interestName || 'Chat Room';
  const avatarInitials = (roomTitle.trim() || 'CR').substring(0, 2).toUpperCase();
  const memberCount = room.members?.length || room.memberCount || 2;
  const isGroup = memberCount > 2;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      
      {/* Top Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/chat')}
            className="p-2 -ml-2 mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold mr-3 border border-brand-200 text-sm">
              {avatarInitials}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-none mb-1">{roomTitle}</h2>
              <div className="flex items-center text-xs text-gray-500 font-medium">
                <span className="mr-2">{memberCount} members</span>
                {room.interestName && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 leading-4">{room.interestName}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {roomMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-2">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {room.emptyStateMessage || "You're connected! Say hello to break the ice 👋"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Messages are end-to-end coordinated for your peer group.</p>
          </div>
        ) : (
          roomMessages.map((message, index) => {
            const isMine = message.mine || message.senderId === user?.id;
            const senderName = message.senderName || 'Peer';
            const showName = isGroup && !isMine && (index === roomMessages.length - 1 || roomMessages[index + 1]?.senderId !== message.senderId);
            const messageKey = message.id || message.clientMessageId || `${message.sentAt}-${index}`;
            
            return (
              <div key={messageKey} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar for others in group */}
                  {isGroup && !isMine && (
                    <div className="flex-shrink-0 mr-2 flex flex-col justify-end pb-1">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {senderName.charAt(0)}
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {showName && (
                      <span className="text-[10px] font-medium text-gray-500 mb-1 ml-1">{senderName}</span>
                    )}
                    
                    <div 
                      className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                        isMine 
                          ? 'bg-brand-600 text-white rounded-br-sm' 
                          : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    
                    <div className="flex items-center mt-1">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {message.sentAt ? new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {renderMessageStatus(message)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 sm:p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <TextArea
              placeholder="Type a message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none block w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-brand-500 focus:border-brand-500 sm:text-sm py-3 px-4 max-h-32"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="inline-flex items-center justify-center p-3 border border-transparent rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 mb-1"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-1 text-center sm:text-left ml-2">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}