import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/useAuthStore';
import { snappy, page, useReducedMotion, transition } from '../../lib/motion';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const { requestOtp, loading } = useAuthStore();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your college email');
      return;
    }
    if (isSignup && !name) {
      toast.error('Enter your name');
      return;
    }

    try {
      const response = await requestOtp(email, isSignup ? name : null, isSignup);

      navigate('/verify-otp', {
        state: {
          email,
          name: isSignup ? name : null,
          collegeName: response.collegeName,
          existingAccount: response.existingAccount,
          expiresInSeconds: response.expiresInSeconds,
        },
      });
    } catch (error) {
      toast.error(error.message || 'Could not send the code');
    }
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(page, reduced)}
    >
      <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-ink">
        {isSignup ? 'Get on the list.' : 'Back again.'}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        Use the email your college gave you. Personal Gmail will not get in.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-3">
        <AnimatePresence initial={false}>
          {isSignup && (
            <motion.div
              key="name"
              initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={transition(snappy, reduced)}
              className="overflow-hidden"
            >
              <Input
                label="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          label="College email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Send the code
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-5">
        <button
          type="button"
          className="text-sm text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm"
          onClick={() => setIsSignup(!isSignup)}
          disabled={loading}
        >
          {isSignup ? 'Already have an account?' : "First time here?"}{' '}
          <span className="font-medium text-accent-700 underline underline-offset-4 decoration-accent-300">
            {isSignup ? 'Log in' : 'Sign up'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
