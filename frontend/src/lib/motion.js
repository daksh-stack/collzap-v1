import { useEffect, useState } from 'react';

// Shared spring configs. Motion is physical and fast: 200–500ms.
export const snappy = { type: 'spring', stiffness: 380, damping: 32 };
export const soft = { type: 'spring', stiffness: 180, damping: 24 };
export const page = { duration: 0.35, ease: [0.22, 1, 0.36, 1] };

// Anything under reduced-motion collapses to a near-instant opacity change.
export const instant = { duration: 0.01 };

const QUERY = '(prefers-reduced-motion: reduce)';

/** Read the reduced-motion preference once, outside of React. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Subscribe to the reduced-motion preference; updates if the user flips it. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Strip movement out of a variant set when reduced motion is on:
 * transforms are dropped, only opacity survives.
 */
export function reduceVariants(variants, reduced) {
  if (!reduced) return variants;
  const out = {};
  for (const [key, value] of Object.entries(variants)) {
    if (typeof value !== 'object' || value === null) {
      out[key] = value;
      continue;
    }
    const { opacity } = value;
    out[key] = {
      ...(opacity !== undefined ? { opacity } : {}),
      transition: instant,
    };
  }
  return out;
}

/** Pick a transition that honours the preference. */
export function transition(config, reduced) {
  return reduced ? instant : config;
}

/**
 * Standard entrance for a panel/step. Slight rise, no bounce.
 * Under reduced motion this becomes a plain fade.
 */
export const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Children stagger for lists that deserve it (used sparingly, not on every load). */
export const listVariants = {
  animate: { transition: { staggerChildren: 0.045 } },
};

export const listItemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

/* --- Scroll-triggered reveals (landing page, marketing sections) --- */

/** Shared viewport config: fire once, a little before the element is centred. */
export const viewportOnce = { once: true, margin: '0px 0px -12% 0px' };

export const revealVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Parent for a staggered group. Pair children with `revealVariants`. */
export const revealGroupVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/**
 * Props for a section that reveals its children on scroll.
 * Spread onto a motion element: <motion.div {...revealGroup(reduced)}>
 */
export function revealGroup(reduced) {
  return {
    variants: reduceVariants(revealGroupVariants, reduced),
    initial: 'initial',
    whileInView: 'animate',
    viewport: viewportOnce,
  };
}

/** Props for a single element revealing on scroll. */
export function reveal(reduced, delay = 0) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1, transition: instant },
      viewport: viewportOnce,
    };
  }
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: viewportOnce,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  };
}

/** Card hover: a small rise on a soft spring. Never applied under reduced motion. */
export function lift(reduced, y = -4) {
  return reduced ? undefined : { y, transition: soft };
}

/** SVG path draw-on. Pair with `pathLength` on a motion.path. */
export const drawVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.25 },
    },
  },
};
