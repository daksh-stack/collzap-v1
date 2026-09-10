import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import { useAuthStore } from '../../store/useAuthStore';
import { page, useReducedMotion, transition } from '../../lib/motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Fill in every field');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signup(email, password, name);
      // Every fresh signup lands on VERIFY_EMAIL first.
      navigate('/onboarding', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Could not create your account');
    }
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(page, reduced)}
    >
      <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tightest text-ink">
        Get on the list.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        Any email works. We'll confirm it's real, then it's yours.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-3">
        <Input
          label="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          disabled={loading}
        />

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
          autoComplete="new-password"
          hint="At least 8 characters"
          disabled={loading}
        />

        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />

        <Button type="submit" variant="gradient" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-5">
        <button
          type="button"
          className="text-sm text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
          onClick={() => navigate('/login')}
          disabled={loading}
        >
          Already have an account?{' '}
          <span className="font-medium text-accent-700 underline underline-offset-4 decoration-accent-300">
            Log in
          </span>
        </button>
      </div>
    </motion.div>
  );
}
