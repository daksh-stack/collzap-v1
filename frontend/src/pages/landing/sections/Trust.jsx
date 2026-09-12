import { motion } from 'motion/react';
import { Heart, Lock, ShieldCheck, Target, Building2 } from 'lucide-react';
import { reveal, revealGroup, revealVariants, useReducedMotion } from '../../../lib/motion';
import SectionLabel from '../SectionLabel';

const GUARANTEES = [
  { icon: Building2, t: 'Only your college', d: 'Connections stay within your campus.' },
  { icon: Lock, t: '100% Confidential', d: 'Your data, interests and conversations are always private.' },
  { icon: Target, t: 'Intent-Based Matching', d: 'Matched on interests, seriousness and goals not just randomly.' },
  { icon: Heart, t: 'Meaningful Connections', d: 'Build friendships, projects, startups and grow together.' },
  { icon: ShieldCheck, t: 'Safe & Secure Environment', d: 'Verified students only. No spam. No noise. Just real people.' },
];

export default function Trust() {
  const reduced = useReducedMotion();

  return (
    <section id="trust" className="scroll-mt-20 border-t border-line bg-paper py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div {...reveal(reduced)} className="max-w-2xl">
          <SectionLabel>Built on trust</SectionLabel>
        </motion.div>

        <motion.ul
          {...revealGroup(reduced)}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {GUARANTEES.map((f) => (
            <motion.li
              key={f.t}
              variants={reduced ? undefined : revealVariants}
              className="rounded-lg border border-line bg-surface p-5 shadow-sm"
            >
              <f.icon className="h-5 w-5 text-teal-600" strokeWidth={1.8} aria-hidden="true" />
              <p className="mt-3 font-display text-sm font-bold tracking-tight text-ink">{f.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-mute">{f.d}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
