import { useId } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { soft, transition, useReducedMotion } from '../../lib/motion';
import {
  ICON_PATH,
  ICON_VIEWBOX,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
  LOCKUP_VIEWBOX,
  LOCKUP_ICON_Y,
  LOCKUP_WORDMARK_X,
  LOCKUP_WORDMARK_SCALE,
} from './logoPaths';

/**
 * The CollZap mark, traced from the artwork in /public.
 *
 * The icon always carries the brand gradient — it reads correctly on both
 * grounds, so it never changes with the theme. The wordmark uses currentColor
 * so it can flip from brand navy to near-white in dark mode.
 *
 * Size these with a height class: <Logo className="h-8" />. Width follows the
 * viewBox, so never set both.
 */

function Gradient({ id }) {
  return (
    <linearGradient id={id} x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0" stopColor="#0B5CC7" />
      <stop offset="0.46" stopColor="#0093D2" />
      <stop offset="0.74" stopColor="#00B8BC" />
      <stop offset="1" stopColor="#06C8AD" />
    </linearGradient>
  );
}

/** Icon only: the two capped figures joined by the wave. */
export function LogoMark({ className, animated = false, ...props }) {
  const uid = useId();
  const gradId = `czg-${uid}`;
  const reduced = useReducedMotion();

  const Shape = animated ? motion.g : 'g';
  const motionProps = animated
    ? {
        initial: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 },
        animate: reduced ? { opacity: 1 } : { opacity: 1, scale: 1 },
        transition: transition(soft, reduced),
        style: { transformOrigin: 'center' },
      }
    : {};

  return (
    <svg
      viewBox={ICON_VIEWBOX}
      className={cn('h-8 w-auto', className)}
      role="presentation"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <Gradient id={gradId} />
      </defs>
      <Shape {...motionProps}>
        <path d={ICON_PATH} fill={`url(#${gradId})`} fillRule="evenodd" />
      </Shape>
    </svg>
  );
}

/** Wordmark only. Inherits colour from `currentColor`. */
export function Wordmark({ className, ...props }) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={cn('h-6 w-auto text-navy dark:text-ink', className)}
      role="presentation"
      aria-hidden="true"
      {...props}
    >
      <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/**
 * The horizontal lockup — icon plus wordmark, at the proportions measured from
 * layout_horizontal.png. This is the default brand element.
 */
export default function Logo({ className, animated = false, title = 'CollZap', ...props }) {
  const uid = useId();
  const gradId = `czl-${uid}`;
  const reduced = useReducedMotion();

  const Icon = animated ? motion.g : 'g';
  const Word = animated ? motion.g : 'g';

  const iconMotion = animated
    ? {
        initial: reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 },
        animate: reduced ? { opacity: 1 } : { opacity: 1, scale: 1 },
        transition: transition(soft, reduced),
        style: { transformOrigin: '83px 52px' },
      }
    : {};

  const wordMotion = animated
    ? {
        initial: reduced ? { opacity: 0 } : { opacity: 0, x: -12 },
        animate: reduced ? { opacity: 1 } : { opacity: 1, x: 0 },
        transition: reduced
          ? transition(soft, reduced)
          : { ...soft, delay: 0.12 },
      }
    : {};

  return (
    <svg
      viewBox={LOCKUP_VIEWBOX}
      className={cn('h-8 w-auto text-navy dark:text-ink', className)}
      role="img"
      aria-label={title}
      {...props}
    >
      <defs>
        <Gradient id={gradId} />
      </defs>
      <Icon {...iconMotion}>
        <g transform={`translate(0 ${LOCKUP_ICON_Y})`}>
          <path d={ICON_PATH} fill={`url(#${gradId})`} fillRule="evenodd" />
        </g>
      </Icon>
      <Word {...wordMotion}>
        <g transform={`translate(${LOCKUP_WORDMARK_X} 0) scale(${LOCKUP_WORDMARK_SCALE})`}>
          <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
        </g>
      </Word>
    </svg>
  );
}
