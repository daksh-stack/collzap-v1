import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, User, Compass, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import { useModerationStore } from '../../../store/useModerationStore';
import { useUserStore } from '../../../store/useUserStore';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export default function AwaitingVerificationStep() {
  const navigate = useNavigate();
  const { verificationStatus, fetchVerificationStatus, loading } = useModerationStore();
  const { onboarding } = useUserStore();

  useEffect(() => {
    fetchVerificationStatus().catch(console.error);
  }, []);

  const latestDoc = verificationStatus?.documents?.[0];

  const formatDocType = (type) => {
    if (!type) return 'College Document';
    if (type === 'COLLEGE_ID') return 'Student ID Card';
    if (type === 'FEE_RECEIPT') return 'Fee Receipt / Slip';
    return type.replace(/_/g, ' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      {/* Header card */}
      <div className="text-center bg-white rounded-2xl p-8 border border-brand-100 shadow-sm relative overflow-hidden">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 mb-4 shadow-inner">
          <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
        </div>

        <Badge variant="warning" className="mb-3 px-3 py-1 font-semibold text-xs uppercase tracking-wide">
          Review in Progress
        </Badge>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Pending
        </h2>
        
        <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
          Your college document was received and is in the queue for manual review. In the meantime, you have full access to explore the app!
        </p>

        {/* Submitted Document Summary */}
        <div className="mt-6 bg-gray-50/80 rounded-xl p-4 text-left border border-gray-200/80 max-w-md mx-auto">
          <div className="flex items-center justify-between border-b border-gray-200/60 pb-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-gray-400" />
              Submission Details
            </span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Pending Admin Review
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 block">Document Type:</span>
              <span className="font-semibold text-gray-800">
                {formatDocType(latestDoc?.documentType)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Submitted At:</span>
              <span className="font-semibold text-gray-800">
                {formatDate(latestDoc?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature unlock roadmap */}
      <div className="bg-gradient-to-br from-brand-50/50 to-indigo-50/30 rounded-2xl p-6 border border-brand-100">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
          What you can do right now
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-start text-sm text-gray-700 bg-white/80 backdrop-blur rounded-xl p-3 border border-brand-100/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2.5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Customise your profile & interests</p>
              <p className="text-xs text-gray-500">Fine-tune your story prompts, photos, and project focus anytime.</p>
            </div>
          </div>
          <div className="flex items-start text-sm text-gray-700 bg-white/80 backdrop-blur rounded-xl p-3 border border-brand-100/50">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2.5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Practice Seriousness Assessment</p>
              <p className="text-xs text-gray-500">Review your questions, standing, and prepare your level bands.</p>
            </div>
          </div>
          <div className="flex items-start text-sm text-gray-700 bg-white/80 backdrop-blur rounded-xl p-3 border border-amber-200/50">
            <Clock className="w-5 h-5 text-amber-500 mr-2.5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Peer Matchmaking & Direct Chat</p>
              <p className="text-xs text-amber-700 font-medium">Unlocks automatically the moment your document is approved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button 
          onClick={() => navigate('/')} 
          className="flex-1 py-3 justify-center shadow-sm"
          icon={<Compass className="w-4 h-4" />}
        >
          Explore CollZap Dashboard
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/profile')} 
          className="flex-1 py-3 justify-center"
          icon={<User className="w-4 h-4" />}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
}

