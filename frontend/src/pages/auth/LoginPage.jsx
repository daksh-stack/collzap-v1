import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import { useAuthStore } from '../../store/useAuthStore';
import { page, useReducedMotion, transition } from '../../lib/motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Enter your email and password');
      return;
    }

    try {
      const response = await login(email, password);
      navigate(response.nextStep === 'READY' ? '/home' : '/onboarding', { replace: true });
    } catch (error) {
      if (error.code === 'password_reset_required') {
        toast.error("This account doesn't have a password yet — set one now.");
        navigate('/forgot-password', { state: { email } });
        return;
      }
      toast.error(error.message || 'Could not sign in');
    }
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(page, reduced)}
    >
      <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tightest text-ink">
        Back again.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        Sign in with your email and password.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-3">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-mute hover:text-ink transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            onClick={() => navigate('/forgot-password', { state: { email } })}
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="gradient" className="w-full" size="lg" loading={loading}>
          Log in
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-5">
        <button
          type="button"
          className="text-sm text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
          onClick={() => navigate('/signup')}
          disabled={loading}
        >
          First time here?{' '}
          <span className="font-medium text-accent-700 underline underline-offset-4 decoration-accent-300">
            Sign up
          </span>
        </button>
      </div>
    </motion.div>
  );
}
