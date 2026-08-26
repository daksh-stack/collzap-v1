import { useEffect } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useAdminStore } from '../../store/useAdminStore';

export default function AdminFeedbackPage() {
  const { interestFeedback, fetchInterestFeedback, loading } = useAdminStore();

  useEffect(() => {
    fetchInterestFeedback().catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interest Suggestions</h1>
        <p className="mt-1 text-sm text-gray-500">Review new interest ideas submitted by users during onboarding.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {loading && !interestFeedback?.content ? (
             <li className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></li>
          ) : interestFeedback?.content?.length === 0 ? (
            <li className="px-6 py-10 text-center">
              <EmptyState icon={MessageSquare} title="No feedback yet" description="Users haven't suggested any new interests recently." />
            </li>
          ) : (
            interestFeedback?.content?.map((item) => (
              <li key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center text-sm mr-3">
                      {item.userName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.userName}</p>
                      <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100">{item.projectType}</Badge>
                </div>
                <div className="mt-3 bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.suggestionText}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}