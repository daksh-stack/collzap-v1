import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';
import { page, useReducedMotion, transition } from '../../lib/motion';

const LENGTH = 6;

export default function OtpVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const reduced = useReducedMotion();

  const [digits, setDigits] = useState(() => Array(LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(state?.expiresInSeconds || 300);
  const [shake, setShake] = useState(0);
  const inputsRef = useRef([]);

  const { verifyOtp, requestOtp, loading } = useAuthStore();

  const code = digits.join('');

  useEffect(() => {
    if (!state?.email) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [state?.email]);

  const submit = useCallback(async (value) => {
    try {
      const response = await verifyOtp(state.email, value, state.name);
      if (response.nextStep === 'READY') {
        navigate('/', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (error) {
      toast.error(error.message || 'That code did not work');
      setDigits(Array(LENGTH).fill(''));
      setShake((n) => n + 1);
      inputsRef.current[0]?.focus();
    }
  }, [verifyOtp, state, navigate]);

  // If no state (e.g. direct navigation to /verify-otp), go back to login.
  if (!state?.email) {
    return <Navigate to="/login" replace />;
  }

  const setDigit = (index, char) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      const joined = next.join('');
      if (char && index === LENGTH - 1 && joined.length === LENGTH && !joined.includes('')) {
        // Last box filled — submit without making them hunt for the button.
        setTimeout(() => submit(joined), 0);
      }
      return next;
    });
  };

  const handleChange = (index, raw) => {
    const char = raw.replace(/\D/g, '').slice(-1);
    if (!char) {
      setDigit(index, '');
      return;
    }
    setDigit(index, char);
    if (index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '');
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigit(index - 1, '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(LENGTH).fill('');
    text.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const landing = Math.min(text.length, LENGTH - 1);
    inputsRef.current[landing]?.focus();
    if (text.length === LENGTH) setTimeout(() => submit(text), 0);
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
    try {
      const response = await requestOtp(state.email, state.name);
      setTimeLeft(response.expiresInSeconds || 300);
      setDigits(Array(LENGTH).fill(''));
      inputsRef.current[0]?.focus();
      toast.success('New code sent');
    } catch (error) {
      toast.error(error.message || 'Could not resend');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(page, reduced)}
    >
      <button
        onClick={() => navigate('/login')}
        className="mb-8 inline-flex items-center text-sm text-mute hover:text-ink transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back
      </button>

      {/* College stamp — the OTP response told us where they study. */}
      {state.collegeName && (
        <div className="mb-7 inline-block -rotate-1 border border-accent-300 rounded-sm px-3 py-1.5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-accent-700">
            {state.email.split('@')[1]} · {state.collegeName}
          </span>
        </div>
      )}

      <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tightest text-ink">
        Six digits.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        Sent to <span className="text-ink">{state.email}</span>. Check spam before you complain.
      </p>

      <form onSubmit={handleVerify} className="mt-9">
        <motion.div
          key={shake}
          animate={reduced || shake === 0 ? undefined : { x: [0, -7, 6, -4, 0] }}
          transition={{ duration: 0.32 }}
          className="flex gap-2"
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              disabled={loading}
              autoFocus={i === 0}
              aria-label={`Digit ${i + 1} of ${LENGTH}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className={cn(
                'h-14 w-full min-w-0 rounded border bg-[#FBF8F2] text-center',
                'font-display text-2xl text-ink tnum',
                'border-line focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25',
                'disabled:opacity-50 transition-[border-color,box-shadow] duration-150',
                digit && 'border-accent-400'
              )}
            />
          ))}
        </motion.div>

        <Button
          type="submit"
          className="mt-6 w-full"
          size="lg"
          loading={loading}
          disabled={code.length !== LENGTH}
        >
          Verify
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-5 text-sm">
        {timeLeft > 0 ? (
          <p className="text-mute">
            Code dies in <span className="text-ink tnum">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-accent-700 underline underline-offset-4 decoration-accent-300 hover:text-accent-800 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Send another one
          </button>
        )}
      </div>
    </motion.div>
  );
}
