import { useEffect } from 'react';
import { Loader2, Users } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useAdminStore } from '../../store/useAdminStore';

export default function AdminQueuePage() {
  const { queue, fetchQueue, loading } = useAdminStore();

  useEffect(() => {
    fetchQueue().catch(console.error);
  }, []);

  // Group queue items by interest for better display
  const groupedQueue = {};
  queue?.forEach(item => {
    if (!groupedQueue[item.interestName]) {
      groupedQueue[item.interestName] = [];
    }
    groupedQueue[item.interestName].push(item);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waiting Queue</h1>
        <p className="mt-1 text-sm text-gray-500">Users currently waiting for a match.</p>
      </div>

      {loading && !queue ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : queue?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <EmptyState
            icon={Users}
            title="Queue is empty"
            description="No users are currently waiting for a match."
          />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedQueue).map(([interestName, users]) => (
            <div key={interestName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{interestName}</h2>
                <Badge variant="secondary" className="bg-brand-50 text-brand-700">{users.length} waiting</Badge>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {users.map(user => (
                  <li key={user.userId} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-4">
                        {user.userName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.userName}</p>
                        <p className="text-xs text-gray-500">ID: {user.userId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-900">{user.connectionType}</p>
                        <p className="text-xs text-gray-500">{user.projectType}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="warning">Lvl: {user.level}</Badge>
                      </div>
                      <div className="text-right hidden md:block w-32">
                        <p className="text-xs text-gray-500">Waiting since</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}