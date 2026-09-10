import { motion } from 'motion/react';
import { listItemVariants, listVariants, reduceVariants, useReducedMotion } from '../../../lib/motion';

/**
 * One question per screen: a big headline, small helper under it.
 * Every onboarding step opens with this so the rhythm stays identical.
 */
export default function StepHeader({ eyebrow, title, children }) {
  const reduced = useReducedMotion();

  return (
    <motion.header
      variants={reduceVariants(listVariants, reduced)}
      initial="initial"
      animate="animate"
      className="mb-12 max-w-xl"
    >
      {eyebrow && (
        <motion.p
          variants={reduceVariants(listItemVariants, reduced)}
          className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent-700"
        >
          <span className="grad-brand h-1 w-5 rounded-full" />
          {eyebrow}
        </motion.p>
      )}
      <motion.h1
        variants={reduceVariants(listItemVariants, reduced)}
        className="font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-tightest text-ink sm:text-5xl"
      >
        {title}
      </motion.h1>
      {children && (
        <motion.p
          variants={reduceVariants(listItemVariants, reduced)}
          className="mt-5 max-w-md text-sm leading-relaxed text-mute"
        >
          {children}
        </motion.p>
      )}
    </motion.header>
  );
}
