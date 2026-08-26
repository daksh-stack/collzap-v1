import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Clock, Users } from 'lucide-react';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useChatStore } from '../../store/useChatStore';

export default function ChatListPage() {
  const navigate = useNavigate();
  const { chatList, fetchChatList, loading } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChatList().catch(console.error);
  }, []);

  const safeChatList = Array.isArray(chatList) ? chatList : [];

  const filteredChats = safeChatList.filter(chat => {
    const title = (chat.title || chat.roomName || '').toLowerCase();
    const interest = (chat.interestName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return title.includes(term) || interest.includes(term);
  });

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Connect with your matches</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search chats..."
            icon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-200">
        {loading && (!chatList || chatList.length === 0) ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex p-4 border-b border-gray-100 last:border-0">
                <div className="rounded-full bg-gray-200 h-12 w-12" />
                <div className="flex-1 ml-4 py-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <EmptyState
              icon={MessageSquare}
              title={searchTerm ? "No chats found" : "No active chats"}
              description={searchTerm ? "Try a different search term" : "Find matches to start chatting"}
              actionLabel={!searchTerm ? "Find Matches" : null}
              onAction={!searchTerm ? () => navigate('/matches') : null}
            />
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const roomId = chat.chatRoomId || chat.roomId || chat.id;
              const chatTitle = chat.title || chat.roomName || chat.interestName || 'Chat Room';
              const avatarInitials = (chatTitle.trim() || 'CR').substring(0, 2).toUpperCase();
              const lastMessage = chat.lastMessagePreview || (chat.lastMessage?.content);
              const lastTime = chat.lastMessageAt || (chat.lastMessage?.sentAt) || chat.createdAt;

              return (
                <li 
                  key={roomId}
                  onClick={() => navigate(`/chat/${roomId}`)}
                  className="group hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center px-4 py-5 sm:px-6">
                    {/* Avatars */}
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 text-brand-700 font-bold text-base border-2 border-white shadow-sm">
                      {avatarInitials}
                    </div>
                    
                    {/* Content */}
                    <div className="min-w-0 flex-1 px-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <p className={`text-sm font-semibold truncate ${chat.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                            {chatTitle}
                          </p>
                          {chat.interestName && (
                            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex text-xs">
                              {chat.interestName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 whitespace-nowrap ml-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatRelativeTime(lastTime)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                          {lastMessage ? (
                            lastMessage
                          ) : (
                            <span className="italic text-brand-600">New match! Say hello 👋</span>
                          )}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-brand-600 rounded-full flex-shrink-0 ml-2">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}