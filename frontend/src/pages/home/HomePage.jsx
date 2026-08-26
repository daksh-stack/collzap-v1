import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, MessageSquare, ArrowRight, Activity, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useMatchStore } from '../../store/useMatchStore';
import { useChatStore } from '../../store/useChatStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { circle, fetchCircle, loading: circleLoading } = useMatchStore();
  const { chatList, fetchChatList, loading: chatLoading } = useChatStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchCircle().catch(console.error);
    fetchChatList().catch(console.error);
    fetchUnreadCount().catch(console.error);
  }, []);

  const stats = [
    { name: 'Active Connections', value: circle?.activeGroups?.length || 0, icon: Users, color: 'text-brand-600', bg: 'bg-brand-100' },
    { name: 'Waiting in Queue', value: circle?.waitingGroups?.length || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Unread Messages', value: unreadCount || 0, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const hasActivity = (circle?.activeGroups?.length > 0) || (chatList?.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.name} className="flex items-center px-4 py-5 sm:p-6">
            <div className={`p-3 rounded-lg ${item.bg}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                <dd>
                  <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                </dd>
              </dl>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-4">
            <button
              onClick={() => navigate('/matches')}
              className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-brand-100 bg-brand-50 hover:bg-brand-100 transition-colors group"
            >
              <div className="flex items-center">
                <Search className="h-6 w-6 text-brand-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-bold text-brand-900">Find Matches</h3>
                  <p className="text-sm text-brand-700">Look for new peers in your interests</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-brand-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/chat')}
              className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-bold text-gray-900">Open Chats</h3>
                  <p className="text-sm text-gray-500">Continue your conversations</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          {chatLoading || circleLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : !hasActivity ? (
            <div className="text-center py-6">
              <Activity className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">No recent activity found.</p>
              <Button onClick={() => navigate('/matches')} variant="outline" size="sm">
                Get Started
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {chatList?.slice(0, 3).map((chat) => {
                const roomId = chat.chatRoomId || chat.roomId || chat.id;
                const title = chat.title || chat.roomName || chat.interestName || 'Chat Room';
                const initial = (title.trim() || 'C').charAt(0).toUpperCase();
                const preview = chat.lastMessagePreview || chat.lastMessage?.content || 'New match!';

                return (
                  <div 
                    key={roomId} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" 
                    onClick={() => navigate(`/chat/${roomId}`)}
                  >
                    <div className="flex items-center truncate mr-4">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold mr-3 flex-shrink-0">
                        {initial}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                        <p className="text-xs text-gray-500 truncate">{preview}</p>
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-brand-600 rounded-full flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
              {(!chatList || chatList.length === 0) && circle?.activeGroups?.slice(0, 3).map(group => (
                <div key={group.id} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-100" onClick={() => navigate(`/matches/${group.id}`)}>
                  Matched in <span className="font-medium text-gray-900">{group.interestName}</span> group.
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}