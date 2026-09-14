import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useReducedMotion, viewportOnce } from '../../lib/motion';

/**
 * A rubber stamp that inks in: lands slightly oversized and settles, the way a
 * stamp bounces when it hits paper. Fires once on scroll.
 *
 * Used three times on the landing — VALID — SAME CAMPUS on the hero badge,
 * WRONG CIRCLE on the old-app cards, and the closing mantra under
 * how-it-works — so the gesture reads as one idea rather than three effects.
 */

const TONES = {
  accent: 'border-accent-500/55 text-accent-600',
  bad: 'border-bad/50 text-bad',
  ink: 'border-ink/35 text-ink/70',
};

export default function Stamp({
  children,
  tone = 'accent',
  rotate = -6,
  className,
}) {
  const reduced = useReducedMotion();

  return (
    <motion.span
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.45, rotate: rotate - 4 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, rotate }}
      viewport={viewportOnce}
      transition={
        reduced
          ? { duration: 0.01 }
          // Stiff and slightly underdamped: it overshoots once, then sets.
          : { type: 'spring', stiffness: 520, damping: 17, mass: 0.7 }
      }
      style={reduced ? { rotate } : undefined}
      className={cn(
        'inline-block select-none rounded-sm border-2 px-3 py-1.5',
        'font-mono text-[11px] font-bold uppercase leading-none tracking-[0.18em]',
        // Ink never sits perfectly solid on paper. Opacity only — a blend mode
        // would vanish on the dark surfaces these also sit on.
        'opacity-90',
        TONES[tone],
        className
      )}
    >
      {children}
    </motion.span>
  );
}
