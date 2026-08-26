import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Shuffle, ListTodo, Flag } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAdminStore } from '../../store/useAdminStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, fetchStats, loading } = useAdminStore();

  useEffect(() => {
    fetchStats().catch(console.error);
  }, []);

  const statCards = [
    { name: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', link: '/admin/users' },
    { name: 'Pending Verifications', value: stats?.pendingVerifications || 0, icon: FileText, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/admin/verifications' },
    { name: 'Active Matches', value: stats?.activeMatches || 0, icon: Shuffle, color: 'text-green-600', bg: 'bg-green-100', link: '/admin/matches' },
    { name: 'Waiting in Queue', value: stats?.waitingQueue || 0, icon: ListTodo, color: 'text-purple-600', bg: 'bg-purple-100', link: '/admin/queue' },
    { name: 'Unresolved Reports', value: stats?.unresolvedReports || 0, icon: Flag, color: 'text-red-600', bg: 'bg-red-100', link: '/admin/reports' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of platform metrics and pending tasks.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => (
          <div 
            key={item.name}
            onClick={() => navigate(item.link)}
            className="cursor-pointer transition-transform hover:-translate-y-1"
          >
            <Card className="flex items-center px-4 py-5 sm:p-6 h-full">
              <div className={`p-3 rounded-lg ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                  <dd>
                    {loading ? (
                      <div className="h-8 bg-gray-100 rounded animate-pulse w-16 mt-1"></div>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}