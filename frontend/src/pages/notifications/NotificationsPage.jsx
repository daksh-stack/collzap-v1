import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, MessageSquare, ShieldCheck, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markRead, markAllRead, loading } = useNotificationStore();
  const page = 0; // Keeping simple without actual pagination state for now

  useEffect(() => {
    fetchNotifications(page).catch(console.error);
  }, [page]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markRead(notification.id);
      } catch (error) {
        console.error("Failed to mark read", error);
      }
    }

    // Navigate based on type
    switch (notification.type) {
      case 'MATCH_FOUND':
        navigate('/matches');
        break;
      case 'NEW_MESSAGE':
        if (notification.payload?.roomId) navigate(`/chat/${notification.payload.roomId}`);
        else navigate('/chat');
        break;
      case 'GROUP_MEMBER_JOINED':
        if (notification.payload?.groupId) navigate(`/matches/${notification.payload.groupId}`);
        else navigate('/matches');
        break;
      case 'VERIFICATION_APPROVED':
        navigate('/profile');
        break;
      case 'VERIFICATION_REJECTED':
        navigate('/onboarding');
        break;
      default:
        break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'MATCH_FOUND': return <Link2 className="w-5 h-5 text-green-600" />;
      case 'NEW_MESSAGE': return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'VERIFICATION_APPROVED': return <ShieldCheck className="w-5 h-5 text-brand-600" />;
      case 'GROUP_MEMBER_JOINED': return <Bell className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'MATCH_FOUND': return 'bg-green-100';
      case 'NEW_MESSAGE': return 'bg-blue-100';
      case 'VERIFICATION_APPROVED': return 'bg-brand-100';
      case 'GROUP_MEMBER_JOINED': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const hasUnread = notifications?.some(n => !n.read);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Stay updated on your matches and messages.</p>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={handleMarkAllRead} 
            disabled={!hasUnread || loading}
            icon={<Check className="w-4 h-4" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && !notifications ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-start">
                <div className="rounded-full bg-gray-200 h-10 w-10 mr-4" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications?.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="When you get matches or messages, they will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications?.map((notification) => (
              <li 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition-colors flex ${!notification.read ? 'bg-brand-50/30' : ''}`}
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-4 mt-1 ${getIconBg(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {notification.body}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>

                {!notification.read && (
                  <div className="flex-shrink-0 ml-4 flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-brand-600"></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {/* Simple pagination mock since backend handles offset/limit, would implement proper page state in a real scenario */}
        {notifications?.length >= 20 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination currentPage={1} totalPages={2} onPageChange={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}