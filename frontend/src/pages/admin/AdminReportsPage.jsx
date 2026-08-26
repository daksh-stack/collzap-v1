import { useState, useEffect } from 'react';
import { Loader2, Flag, ShieldAlert, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useAdminStore } from '../../store/useAdminStore';

export default function AdminReportsPage() {
  const { reports, fetchReports, resolveReport, loading } = useAdminStore();
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports().catch(console.error);
  }, []);

  const handleResolve = async (action) => {
    if (!selectedReport) return;
    
    try {
      await resolveReport(selectedReport.id, action);
      toast.success(`Report resolved (Action: ${action})`);
      setSelectedReport(null);
    } catch (error) {
      toast.error(error.message || 'Failed to resolve report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Review and moderate user behavior.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason Preview</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !reports?.content ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
              ) : reports?.content?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <EmptyState icon={Flag} title="No reports" description="Hooray! The community is behaving well." />
                  </td>
                </tr>
              ) : (
                reports?.content?.map((report) => (
                  <tr 
                    key={report.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{report.reportedUserName}</div>
                      <div className="text-xs text-gray-500">{report.reportedUserId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.reporterName}</div>
                      <div className="text-xs text-gray-500">{report.reporterId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-md">{report.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)} title="Review Report" size="lg">
        {selectedReport && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Report Reason</h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedReport.reason}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-red-100 bg-red-50 p-4 rounded-lg">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Reported User (Target)</h4>
                <p className="font-bold text-gray-900">{selectedReport.reportedUserName}</p>
                <p className="text-xs text-gray-500 font-mono">{selectedReport.reportedUserId}</p>
              </div>
              <div className="border border-gray-100 bg-white p-4 rounded-lg">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reporter (Author)</h4>
                <p className="font-bold text-gray-900">{selectedReport.reporterName}</p>
                <p className="text-xs text-gray-500 font-mono">{selectedReport.reporterId}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => handleResolve('DISMISS')} icon={<CheckCircle className="w-4 h-4" />}>
                Dismiss Report
              </Button>
              <Button 
                onClick={() => handleResolve('BAN_USER')} 
                className="bg-red-600 hover:bg-red-700" 
                icon={<ShieldAlert className="w-4 h-4" />}
              >
                Ban Reported User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}