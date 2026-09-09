import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useUserStore } from '../../store/useUserStore';
import Spinner from '../../components/ui/Spinner';
import { page, useReducedMotion, transition } from '../../lib/motion';

// Import all steps
import VerifyEmailStep from './steps/VerifyEmailStep';
import UploadDocumentStep from './steps/UploadDocumentStep';
import AwaitingVerificationStep from './steps/AwaitingVerificationStep';
import VerificationRejectedStep from './steps/VerificationRejectedStep';
import CompleteProfileStep from './steps/CompleteProfileStep';
import SelectProjectTypeStep from './steps/SelectProjectTypeStep';
import SelectInterestsStep from './steps/SelectInterestsStep';
import TakeSeriousnessTestStep from './steps/TakeSeriousnessTestStep';
import SelectConnectionTypeStep from './steps/SelectConnectionTypeStep';

const STEP_COMPONENTS = {
  VERIFY_EMAIL: VerifyEmailStep,
  UPLOAD_DOCUMENT: UploadDocumentStep,
  AWAITING_VERIFICATION: AwaitingVerificationStep,
  VERIFICATION_REJECTED: VerificationRejectedStep,
  COMPLETE_PROFILE: CompleteProfileStep,
  SELECT_PROJECT_TYPE: SelectProjectTypeStep,
  SELECT_INTERESTS: SelectInterestsStep,
  TAKE_SERIOUSNESS_TEST: TakeSeriousnessTestStep,
  SELECT_CONNECTION_TYPE: SelectConnectionTypeStep,
};

export default function OnboardingPage() {
  const { onboarding, fetchOnboarding, loading } = useUserStore();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchOnboarding().catch(console.error);
  }, []);

  const step = onboarding?.step;

  // READY still leaves onboarding; the guard normally catches this first.
  useEffect(() => {
    if (step === 'READY') navigate('/', { replace: true });
  }, [step, navigate]);

  if (loading && !onboarding) {
    return (
      <div className="flex justify-center py-24 text-accent-500">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!onboarding) {
    return (
      <p className="py-24 text-center text-sm text-bad">
        Could not load your setup state. Reload the page.
      </p>
    );
  }

  if (step === 'READY') {
    return <p className="py-24 text-center text-sm text-mute">All set. Taking you in…</p>;
  }

  const StepComponent = STEP_COMPONENTS[step];

  if (!StepComponent) {
    return (
      <p className="py-24 text-center text-sm text-mute">
        Unknown step: <span className="font-mono text-ink">{String(step)}</span>
      </p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        layoutId={reduced ? undefined : 'onboarding-panel'}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={transition(page, reduced)}
      >
        <StepComponent />
      </motion.div>
    </AnimatePresence>
  );
}
