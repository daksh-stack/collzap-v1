import { Clock } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';

export default function AwaitingVerificationStep() {
  const { onboarding } = useUserStore();

  return (
    <div className="max-w-md mx-auto text-center py-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
        <Clock className="h-8 w-8 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Verification in Progress
      </h2>
      
      <p className="text-gray-500 mb-8">
        Your document is currently being reviewed by our team. 
        We'll notify you via email once approved.
      </p>

      {onboarding?.verificationStatus && (
        <div className="bg-gray-50 rounded-lg p-4 inline-block text-left border border-gray-200 w-full">
          <p className="text-sm font-medium text-gray-700 mb-1">Submitted Details:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Type: <span className="font-medium">{onboarding.verificationStatus.documentType}</span></li>
            <li>Status: <span className="text-blue-600 font-medium">Pending Review</span></li>
            <li>Submitted: {new Date(onboarding.verificationStatus.submittedAt).toLocaleDateString()}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
