import { motion } from 'motion/react';
import { Building2, User, Users, UsersRound } from 'lucide-react';
import { reveal, revealGroup, revealVariants, soft, useReducedMotion } from '../../../lib/motion';
import SectionLabel from '../SectionLabel';

/**
 * The four circle types, exactly as specified. Only the first has supplied
 * description copy — the rest carry their name alone rather than padding
 * invented detail onto the page.
 */
const CIRCLES = [
  {
    icon: User,
    name: '1-on-1 Partner',
    size: '2 matched peers',
    body: 'Deep and focused. A private chat between 2 matched peers.',
  },
  { icon: Users, name: 'Small Group', size: '3–5 students' },
  { icon: UsersRound, name: 'College Community' },
  { icon: Building2, name: 'Official Student Society' },
];

export default function Circles() {
  const reduced = useReducedMotion();

  return (
    <section id="circles" className="scroll-mt-20 border-t border-line bg-surface-2 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div {...reveal(reduced)} className="max-w-2xl">
          <SectionLabel>Choose your circle type</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
            Choose Your Circle.
          </h2>
        </motion.div>

        <motion.div
          {...revealGroup(reduced)}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CIRCLES.map((c) => (
            <motion.article
              key={c.name}
              variants={reduced ? undefined : revealVariants}
              whileHover={reduced ? undefined : { y: -5 }}
              transition={soft}
              className="group relative overflow-hidden rounded-lg border border-line bg-surface p-7 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-accent-300 hover:shadow-glow-accent"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent-50 text-accent-700">
                <c.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink">
                {c.name}
              </h3>
              {c.size && (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent-700">
                  {c.size}
                </p>
              )}
              {c.body && <p className="mt-3 text-sm leading-relaxed text-mute">{c.body}</p>}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
