import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useReducedMotion, viewportOnce } from '../../lib/motion';

/**
 * Gradient progress ring for a 0–100 score.
 *
 * `trigger="view"` fills when it scrolls into view (landing page);
 * `trigger="mount"` fills immediately (the test result).
 */
export default function ScoreRing({
  value = 0,
  label,
  caption,
  size = 224,
  trigger = 'mount',
  className,
}) {
  const uid = useId();
  const gradId = `ring-${uid}`;
  const reduced = useReducedMotion();

  const R = 68;
  const C = 2 * Math.PI * R;
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = C * (1 - clamped / 100);

  const fill = { strokeDashoffset: offset };
  const anim = trigger === 'view'
    ? { whileInView: fill, viewport: viewportOnce }
    : { animate: fill };

  return (
    <div
      className={cn('relative grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0B5CC7" />
            <stop offset="0.55" stopColor="#0093D2" />
            <stop offset="1" stopColor="#06C8AD" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={R} fill="none" strokeWidth="10" className="stroke-line" />
        <motion.circle
          cx="80"
          cy="80"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke={`url(#${gradId})`}
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          transition={reduced ? { duration: 0.01 } : { duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          {...anim}
        />
      </svg>

      <div className="absolute text-center">
        <p className="font-display text-4xl font-extrabold tracking-tightest text-ink tnum">
          {Math.round(clamped)}
        </p>
        {label && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mute">
            {label}
          </p>
        )}
        {caption && <p className="mt-1 text-[11px] text-mute">{caption}</p>}
      </div>
    </div>
  );
}
