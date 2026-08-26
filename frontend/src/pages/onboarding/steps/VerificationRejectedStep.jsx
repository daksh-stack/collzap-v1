import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import Button from '../../../../components/ui/Button';

export default function VerificationRejectedStep() {
  const { onboarding } = useUserStore();
  const { nextStep } = useAuthStore();

  const handleReupload = () => {
    // We can force the store to temporarily go back to UPLOAD_DOCUMENT 
    // locally, or the backend should have updated the user state.
    // If backend state says VERIFICATION_REJECTED, they might need an endpoint to reset it.
    // Assuming we can just let them change the view locally for now, 
    // but the easiest is to just update the local auth store nextStep state
    useAuthStore.setState({ nextStep: 'UPLOAD_DOCUMENT' });
  };

  return (
    <div className="max-w-md mx-auto text-center py-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Verification Rejected
      </h2>
      
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
        <p className="text-sm text-red-800 font-medium mb-1">Reason for rejection:</p>
        <p className="text-sm text-red-700">
          {onboarding?.verificationStatus?.rejectionReason || "Your document was illegible or did not match your profile details."}
        </p>
      </div>

      <Button onClick={handleReupload} className="w-full">
        <RefreshCw className="w-4 h-4 mr-2" />
        Re-upload Document
      </Button>
    </div>
  );
}
