import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import OtpDigitGrid from '../../components/auth/OtpDigitGrid';
import { useAuthStore } from '../../store/useAuthStore';
import { page, useReducedMotion, transition } from '../../lib/motion';

export default function ForgotPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [email, setEmail] = useState(location.state?.email || '');
  const [stage, setStage] = useState('email'); // 'email' | 'reset'
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSignal, setResetSignal] = useState(0);

  const { forgotPassword, resetPassword, loading } = useAuthStore();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your email');
      return;
    }
    try {
      await forgotPassword(email);
      toast.success('Code sent — check your inbox');
      setStage('reset');
    } catch (error) {
      toast.error(error.message || 'Could not send the code');
    }
  };

  const handleReset = async (e) => {
    e?.preventDefault();
    if (code.length !== 6) {
      toast.error('Enter all six digits');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await resetPassword(email, code, newPassword);
      toast.success('Password set');
      navigate(response.nextStep === 'READY' ? '/' : '/onboarding', { replace: true });
    } catch (error) {
      toast.error(error.message || 'That code did not work');
      setCode('');
      setResetSignal((n) => n + 1);
    }
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(page, reduced)}
    >
      <button
        onClick={() => (stage === 'reset' ? setStage('email') : navigate('/login'))}
        className="mb-8 inline-flex items-center text-sm text-mute hover:text-ink transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back
      </button>

      {stage === 'email' ? (
        <>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-ink">
            Forgot your password?
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-mute">
            We'll send a code to your email. If your account never had a password, this is also how you set your first one.
          </p>

          <form onSubmit={handleRequestCode} className="mt-9 space-y-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Send code
            </Button>
          </form>
        </>
      ) : (
        <>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-ink">
            Set a new password.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-mute">
            Enter the code sent to <span className="text-ink">{email}</span>.
          </p>

          <form onSubmit={handleReset} className="mt-9 space-y-5">
            <OtpDigitGrid onChange={setCode} disabled={loading} resetSignal={resetSignal} />

            <div className="space-y-3">
              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                hint="At least 8 characters"
                disabled={loading}
              />
              <PasswordInput
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading} disabled={code.length !== 6}>
              Reset password
            </Button>
          </form>
        </>
      )}
    </motion.div>
  );
}
