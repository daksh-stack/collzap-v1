import { useEffect } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useAuthStore } from '../../../store/useAuthStore';
import Button from '../../../components/ui/Button';
import StepHeader from './StepHeader';

export default function VerificationRejectedStep() {
  const { profile, fetchMe } = useUserStore();

  // rejectionReason lives on UserResponse, not on the onboarding payload
  // (where verificationStatus is a plain string enum).
  useEffect(() => {
    if (!profile) fetchMe().catch(console.error);
  }, []);

  const handleReupload = () => {
    // OnboardingPage renders off useUserStore.onboarding.step, so that is what
    // has to move for the upload form to appear. Keep auth nextStep in sync so
    // OnboardingGuard agrees. The backend already permits a re-upload while the
    // status is REJECTED, and posting a new document refetches onboarding.
    useUserStore.setState((state) => ({
      onboarding: { ...state.onboarding, step: 'UPLOAD_DOCUMENT' },
    }));
    useAuthStore.setState({ nextStep: 'UPLOAD_DOCUMENT' });
  };

  return (
    <div>
      <StepHeader eyebrow="Sent back" title="That one didn't pass.">
        Nothing personal — the reviewer could not read it or it did not match your
        name. Send a clearer one and you are through.
      </StepHeader>

      <div className="max-w-lg">
        <div className="border-l-2 border-bad pl-5 py-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-bad">
            Reviewer note
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            {profile?.rejectionReason || 'Your document was illegible or did not match your profile details.'}
          </p>
        </div>

        <Button onClick={handleReupload} size="lg" className="mt-10">
          Send another
        </Button>
      </div>
    </div>
  );
}
