import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import StepHeader from './StepHeader';
import OtpDigitGrid from '../../../components/auth/OtpDigitGrid';
import { useAuthStore } from '../../../store/useAuthStore';
import { useUserStore } from '../../../store/useUserStore';

const LENGTH = 6;

export default function VerifyEmailStep() {
  const { verifyEmail, resendVerifyEmail, user, loading } = useAuthStore();
  const [code, setCode] = useState('');
  const [resetSignal, setResetSignal] = useState(0);
  const [resending, setResending] = useState(false);

  const submit = async (value) => {
    try {
      await verifyEmail(value);
      toast.success("You're confirmed");
      useUserStore.getState().fetchOnboarding();
    } catch (error) {
      toast.error(error.message || 'That code did not work');
      setCode('');
      setResetSignal((n) => n + 1);
    }
  };

  const handleVerify = (e) => {
    e?.preventDefault();
    if (code.length !== LENGTH) {
      toast.error('Enter all six digits');
      return;
    }
    submit(code);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerifyEmail();
      toast.success('New code sent');
    } catch (error) {
      toast.error(error.message || 'Could not resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <StepHeader eyebrow="Step one" title="Confirm it's you.">
        We sent a 6-digit code to <span className="text-ink">{user?.email}</span>. Enter it below.
      </StepHeader>

      <form onSubmit={handleVerify} className="max-w-lg space-y-6">
        <OtpDigitGrid
          length={LENGTH}
          onChange={setCode}
          onComplete={submit}
          disabled={loading}
          resetSignal={resetSignal}
        />

        <div className="flex items-center gap-5">
          <Button type="submit" variant="gradient" size="lg" loading={loading} disabled={code.length !== LENGTH}>
            Verify
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-accent-700 underline underline-offset-4 decoration-accent-300 hover:text-accent-800 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            {resending ? 'Sending…' : 'Send another code'}
          </button>
        </div>
      </form>
    </div>
  );
}
