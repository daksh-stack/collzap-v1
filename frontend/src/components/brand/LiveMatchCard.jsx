import { useId } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useReducedMotion } from '../../lib/motion';
import { LogoMark } from './Logo';
import Stamp from '../ui/Stamp';

/**
 * The brand object: not an artifact you'd carry (a badge, a phone mockup) but
 * the product's actual moment of value, shown happening. Two anonymous campus
 * signals converge, the three things CollZap actually checks tick on one at a
 * time, and the link resolves into a match — the mechanism made visible,
 * which is a stronger thesis for a matching product than any prop could be.
 *
 * No name, no photo, no avatar-with-initials: the two peers are drawn as bare
 * signal nodes, same principle IdBadge established — the promise is what
 * membership gets you, never an invented identity standing in for a member.
 */

const CHECKS = [
  { label: 'Same campus, verified' },
  { label: 'Shared interest' },
  { label: 'Matched seriousness level' },
];

export default function LiveMatchCard({ className }) {
  const reduced = useReducedMotion();
  const gradId = useId();

  const lineDraw = reduced
    ? { pathLength: 1 }
    : {
        pathLength: [0, 1, 1, 0],
        transition: { duration: 3.2, times: [0, 0.4, 0.85, 1], repeat: Infinity, repeatDelay: 0.6 },
      };

  const checkStagger = (i) =>
    reduced
      ? { opacity: 1 }
      : {
          opacity: [0, 0, 1, 1],
          transition: {
            duration: 3.2,
            repeat: Infinity,
            repeatDelay: 0.6,
            times: [0, 0.18 + i * 0.16, 0.3 + i * 0.16, 1],
          },
        };

  return (
    <div className={cn('relative mx-auto w-[19rem] sm:w-[21rem] lg:w-[23rem]', className)}>
      <div className="rim relative overflow-hidden rounded-2xl border border-white/12 bg-[#0C1830]/80 px-6 pb-6 pt-5 shadow-2xl backdrop-blur-sm">
        <span className="grad-brand pointer-events-none absolute inset-x-0 top-0 h-[2px]" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="h-4 text-white" />
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#7FE3C8]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7FE3C8] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7FE3C8]" />
            </span>
            Live match
          </span>
        </div>

        {/* The two signals + the line resolving between them */}
        <div className="relative mt-7 flex items-center justify-between px-2">
          <SignalNode />
          <svg
            viewBox="0 0 140 24"
            className="absolute left-1/2 top-1/2 h-6 w-[7.5rem] -translate-x-1/2 -translate-y-1/2 overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2B7FE0" />
                <stop offset="100%" stopColor="#3DD9C0" />
              </linearGradient>
            </defs>
            <path d="M4 12H136" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeLinecap="round" />
            <motion.path
              d="M4 12H136"
              stroke={`url(#${gradId})`}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={lineDraw}
            />
          </svg>
          <SignalNode />
        </div>

        {/* What actually gets checked — the product, not decoration */}
        <ul className="mt-7 space-y-2.5">
          {CHECKS.map((c, i) => (
            <motion.li
              key={c.label}
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={checkStagger(i)}
              className="flex items-center gap-2.5"
            >
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#3DD9C0]/15 text-[#3DD9C0]">
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden="true" />
              </span>
              <span className="text-[12.5px] font-medium leading-tight text-[#D7E4F7]">
                {c.label}
              </span>
            </motion.li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <p className="flex items-center gap-1.5 text-[11px] text-[#7C93B5]">
            <Sparkle className="h-3 w-3" aria-hidden="true" />
            No swiping. No strangers off-campus.
          </p>
          <Stamp tone="accent" rotate={-8} className="border-[#3DD9C0]/55 px-2 py-1 text-[8px] tracking-[0.14em] text-[#3DD9C0]">
            Matched
          </Stamp>
        </div>
      </div>
    </div>
  );
}

function SignalNode() {
  return (
    <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.04]">
      <span className="grad-brand h-4 w-4 rounded-full opacity-90" />
      <span className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'scale(1.35)' }} />
    </div>
  );
}
