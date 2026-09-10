import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../lib/motion';

/**
 * A row of single-digit boxes for entering an OTP. Auto-advances focus,
 * supports paste, and auto-fires onComplete once every box is filled — but
 * that's a convenience, not the only way in: `onChange` reports the current
 * value on every keystroke too, so the parent can drive its own "Verify"
 * button as a fallback (autofill, editing a digit after the fact, or the
 * auto-submit simply not firing all land on a dead end without one).
 * Bump `resetSignal` (e.g. a counter) to clear the grid and shake it — the
 * standard "that code was wrong" response.
 */
export default function OtpDigitGrid({ length = 6, onChange, onComplete, disabled, resetSignal }) {
  const [digits, setDigits] = useState(() => Array(length).fill(''));
  const inputsRef = useRef([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (resetSignal === undefined || resetSignal === 0) return;
    setDigits(Array(length).fill(''));
    onChange?.('');
    inputsRef.current[0]?.focus();
    // Only re-run when resetSignal actually changes — onChange is a fresh
    // function on every parent render and must not retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal, length]);

  const setDigit = (index, char) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      const joined = next.join('');
      onChange?.(joined);
      if (char && index === length - 1 && joined.length === length && !joined.includes('')) {
        setTimeout(() => onComplete?.(joined), 0);
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
    if (index < length - 1) inputsRef.current[index + 1]?.focus();
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
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill('');
    text.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    onChange?.(next.join(''));
    const landing = Math.min(text.length, length - 1);
    inputsRef.current[landing]?.focus();
    if (text.length === length) setTimeout(() => onComplete?.(text), 0);
  };

  return (
    <motion.div
      key={resetSignal}
      animate={reduced || !resetSignal ? undefined : { x: [0, -7, 6, -4, 0] }}
      transition={{ duration: 0.32 }}
      className="flex gap-2"
    >
      {digits.map((digit, i) => (
        <div key={i} className="relative min-w-0 flex-1">
        <input
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-14 w-full min-w-0 rounded border bg-surface text-center',
            'font-display text-2xl font-bold text-ink tnum',
            'border-line focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25',
            'disabled:opacity-50 transition-[border-color,box-shadow] duration-150',
            digit && 'border-accent-400'
          )}
        />
        {/* A filled box earns the brand mark under it. */}
        {digit && (
          <span
            aria-hidden="true"
            className="grad-brand pointer-events-none absolute inset-x-2.5 bottom-2 h-0.5 rounded-full"
          />
        )}
        </div>
      ))}
    </motion.div>
  );
}
