import { useNavigate } from 'react-router-dom';
import { Target, Clock, ShieldAlert } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useTestStore } from '../../../store/useTestStore';
import { useEffect } from 'react';

export default function TakeSeriousnessTestStep() {
  const navigate = useNavigate();
  const { eligibility, checkEligibility, loading } = useTestStore();

  useEffect(() => {
    checkEligibility().catch(console.error);
  }, []);

  return (
    <div className="max-w-xl mx-auto text-center py-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 mb-6">
        <Target className="h-8 w-8 text-brand-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Seriousness Assessment
      </h2>
      
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        To ensure high-quality matches, we ask all users to complete a brief assessment. 
        This helps us match you with peers who share your level of commitment and expertise.
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
          <Clock className="h-6 w-6 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-900">20 Minutes</span>
          <span className="text-xs text-gray-500">Time Limit</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
          <ShieldAlert className="h-6 w-6 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-900">30 Days</span>
          <span className="text-xs text-gray-500">Retake Cooldown</span>
        </div>
      </div>

      <div className="max-w-xs mx-auto">
        <Button 
          onClick={() => navigate('/test')} 
          className="w-full text-lg h-12"
          loading={loading}
          disabled={eligibility && !eligibility.eligible}
        >
          {eligibility?.hasActiveSession ? 'Resume Test' : 'Start Assessment'}
        </Button>
        
        {eligibility && !eligibility.eligible && (
          <p className="mt-3 text-sm text-red-600">
            {eligibility.reason}
          </p>
        )}
      </div>
    </div>
  );
}
