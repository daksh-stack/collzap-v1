import { useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';
import Spinner from '../../components/ui/Spinner';

// Import all steps
import UploadDocumentStep from './steps/UploadDocumentStep';
import AwaitingVerificationStep from './steps/AwaitingVerificationStep';
import VerificationRejectedStep from './steps/VerificationRejectedStep';
import CompleteProfileStep from './steps/CompleteProfileStep';
import SelectProjectTypeStep from './steps/SelectProjectTypeStep';
import SelectInterestsStep from './steps/SelectInterestsStep';
import TakeSeriousnessTestStep from './steps/TakeSeriousnessTestStep';
import SelectConnectionTypeStep from './steps/SelectConnectionTypeStep';

export default function OnboardingPage() {
  const { onboarding, fetchOnboarding, loading } = useUserStore();

  useEffect(() => {
    fetchOnboarding().catch(console.error);
  }, []);

  if (loading && !onboarding) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!onboarding) {
    return <div className="text-center py-20 text-red-500">Failed to load onboarding state.</div>;
  }

  // Route based on step
  switch (onboarding.step) {
    case 'UPLOAD_DOCUMENT':
      return <UploadDocumentStep />;
    case 'AWAITING_VERIFICATION':
      return <AwaitingVerificationStep />;
    case 'VERIFICATION_REJECTED':
      return <VerificationRejectedStep />;
    case 'COMPLETE_PROFILE':
      return <CompleteProfileStep />;
    case 'SELECT_PROJECT_TYPE':
      return <SelectProjectTypeStep />;
    case 'SELECT_INTERESTS':
      return <SelectInterestsStep />;
    case 'TAKE_SERIOUSNESS_TEST':
      return <TakeSeriousnessTestStep />;
    case 'SELECT_CONNECTION_TYPE':
      return <SelectConnectionTypeStep />;
    case 'READY':
      // Force programmatic redirection if guard misses it
      setTimeout(() => window.location.href = '/', 100);
      return <div className="text-center py-20">Onboarding complete! Redirecting...</div>;
    default:
      return <div className="text-center py-20">Unknown step: {onboarding.step}</div>;
  }
}