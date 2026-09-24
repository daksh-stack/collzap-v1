import { motion } from 'motion/react';
import { CalendarCheck, Flame, MessagesSquare, Users2 } from 'lucide-react';
import { reveal, revealGroup, revealVariants, useReducedMotion } from '../../../lib/motion';
import SectionLabel from '../SectionLabel';

/**
 * The daily-task loop that starts once a match goes live — the thing that
 * keeps a circle active instead of fading into an unread group chat, which
 * is exactly the failure mode described up in Problem and WhyCollZap.
 */
const CARDS = [
  {
    icon: CalendarCheck,
    title: 'One Task, Every Day',
    body: 'Once you are matched, a new task lands in your chat each day — built around the interest you matched on, not generic busywork.',
  },
  {
    icon: Flame,
    title: 'Points & Streaks',
    body: 'Submit it and you earn points. Keep showing up and you build a streak — a running reason to open the chat today, not just on day one.',
  },
  {
    icon: Users2,
    title: 'Reviewed By Your Circle',
    body: 'Your groupmates score each other’s work on completion, quality, learning and effort, with a line of feedback — not a stranger’s algorithm.',
  },
  {
    icon: MessagesSquare,
    title: 'Built Into The Chat',
    body: 'No separate app to open. Today’s task, your submission, and your group’s reviews all live right inside the conversation you are already in.',
  },
];

export default function DailyMomentum() {
  const reduced = useReducedMotion();

  return (
    <section id="momentum" className="scroll-mt-20 border-t border-line bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div {...reveal(reduced)} className="max-w-2xl">
          <SectionLabel>After the match</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
            Matched Is The Start. Not The Finish.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-mute">
            A WhatsApp group goes quiet after week one because nothing brings anyone back to it.
            Every CollZap circle gets a daily task, so there is always a reason to show up again
            tomorrow.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.div {...revealGroup(reduced)} className="grid gap-5 sm:grid-cols-2">
            {CARDS.map((c) => (
              <motion.article
                key={c.title}
                variants={reduced ? undefined : revealVariants}
                className="rounded-lg border border-line bg-surface p-6 shadow-sm"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent-50 text-accent-700">
                  <c.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-base font-bold tracking-tight text-ink">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{c.body}</p>
              </motion.article>
            ))}
          </motion.div>

          {/* A grounded, literal preview of the in-chat card, in the same
              register as HowItWorks' "verify" and "levels" previews — this
              section is describing a real screen, not an abstraction. */}
          <motion.div
            {...reveal(reduced, 0.12)}
            className="rounded-lg border border-line bg-surface-2 p-6 shadow-sm"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent-700">
              Day 04 · 25 pts · ~20 min
            </p>
            <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-ink">
              Ship one tiny feature, and write down what broke.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              Submit a link, a file, or just what you did — your groupmates review it on
              completion, quality, learning and effort.
            </p>
            <div className="mt-5 flex items-center gap-4 border-t border-line pt-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-ink">
                <Flame className="h-3.5 w-3.5 text-bad" aria-hidden="true" />
                <span className="font-medium tnum">4</span>-day streak
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-ink">
                <span className="font-medium tnum">65</span> pts total
              </span>
            </div>
          </motion.div>
        </div>

        <motion.p
          {...reveal(reduced, 0.1)}
          className="mt-14 max-w-2xl font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl"
        >
          Most circles die from having nothing to do together. This one has something to do
          every single day.
        </motion.p>
      </div>
    </section>
  );
}
