import { motion } from 'motion/react';
import { BadgeCheck, Layers, Sparkles, Target, Users } from 'lucide-react';
import {
  drawVariants,
  reduceVariants,
  reveal,
  revealGroup,
  revealVariants,
  useReducedMotion,
  viewportOnce,
} from '../../../lib/motion';
import SectionLabel from '../SectionLabel';
import Stamp from '../Stamp';
import { INTEREST_CHIPS } from '../shared';

// The three levels shown on the landing. The in-app assessment is finer
// grained; this page deliberately shows only these three.
const LEVELS = [
  { name: 'Beginner', note: 'Connect with beginners' },
  { name: 'Intermediate', note: 'Connect with intermediate students' },
  { name: 'Advanced', note: 'Connect with advanced peers' },
];

const STEPS = [
  {
    icon: BadgeCheck,
    title: 'Verify Your College',
    lead: 'Connect only with students from your campus.',
    detail: 'Sign in using your college identity so every connection is relevant to your campus.',
    extra: 'verify',
  },
  {
    icon: Target,
    title: 'Choose Your Interests',
    lead: 'Select areas where you genuinely want to grow.',
    extra: 'chips',
  },
  {
    icon: Layers,
    title: 'Take A Seriousness Test',
    lead: 'Get matched with students at a similar commitment level.',
    detail: 'A short assessment helps us understand your current level and commitment.',
    extra: 'levels',
  },
  {
    icon: Users,
    title: 'Choose Your Circle',
    lead: '1-on-1 Partner, Small Group, Community, or Society.',
  },
  {
    icon: Sparkles,
    title: 'Get Matched',
    lead: 'Meet students who share your interests and goals.',
    detail: 'Our matching system connects you with students who share similar interests, goals, and seriousness levels. All conversations and matches remain private and secure.',
    extra: 'caption',
  },
];

function StepExtra({ kind }) {
  if (kind === 'verify') {
    return (
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="flex-1 rounded border border-line bg-surface-2 px-3 py-2.5 font-mono text-xs text-mute">
          user@college.edu.in
        </span>
        <span className="grad-brand-cta shrink-0 rounded px-4 py-2.5 text-center text-xs font-semibold text-white">
          Verify
        </span>
      </div>
    );
  }

  if (kind === 'chips') {
    return (
      <ul className="mt-5 flex flex-wrap gap-2">
        {INTEREST_CHIPS.map((chip) => (
          <li
            key={chip}
            className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-ink"
          >
            {chip}
          </li>
        ))}
        <li className="px-1 py-1 text-xs text-mute">and more…</li>
      </ul>
    );
  }

  if (kind === 'levels') {
    return (
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {LEVELS.map((lvl) => (
          <li key={lvl.name} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5">
            <span className="w-28 shrink-0 font-display text-sm font-bold tracking-tight text-ink">
              {lvl.name}
            </span>
            <span className="text-sm text-mute">{lvl.note}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (kind === 'caption') {
    return (
      <p className="mt-5 rounded border-l-2 border-accent-300 bg-surface-2 px-4 py-3 font-mono text-[11px] leading-relaxed text-mute">
        same college + same interest + similar level + same connection type
      </p>
    );
  }

  return null;
}

/**
 * The five steps hang off one lanyard cord rather than a ruled line. The cord
 * is a single path scaled to the list's height (`preserveAspectRatio="none"`,
 * with a non-scaling stroke so it does not smear), drawn on scroll by the same
 * `pathLength` helper the rest of the app uses.
 */
function Cord({ reduced }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 1000"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-8 left-0 top-8 w-11"
    >
      <defs>
        <linearGradient id="cz-how-cord" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B3D91" />
          <stop offset="50%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
      </defs>
      <motion.path
        d="M22 0 C 8 130, 36 250, 22 380 S 8 620, 22 750 S 36 890, 22 1000"
        fill="none"
        stroke="url(#cz-how-cord)"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.55"
        variants={reduceVariants(drawVariants, reduced)}
        initial="initial"
        whileInView="animate"
        viewport={viewportOnce}
      />
    </svg>
  );
}

export default function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how" className="scroll-mt-20 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div {...reveal(reduced)} className="max-w-2xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
            Find The Right People In 5 Simple Steps.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-mute">
            CollZap helps students discover meaningful circles inside their own college.
          </p>
        </motion.div>

        <motion.ol {...revealGroup(reduced)} className="relative mt-14 max-w-3xl">
          <Cord reduced={reduced} />

          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              variants={reduced ? undefined : revealVariants}
              className="relative flex gap-5 pb-8 last:pb-0 sm:gap-7"
            >
              {/* Medallion, clipped to the cord. */}
              <span className="relative z-10 shrink-0">
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-[-5px] h-2.5 w-4 -translate-x-1/2 rounded-sm border border-line bg-surface-2"
                />
                <span className="relative grid h-11 w-11 place-items-center rounded-lg border border-line bg-surface text-accent-700 shadow-sm">
                  <step.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
              </span>

              <div className="min-w-0 flex-1 pb-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-mute tnum">
                  Step {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-ink/80">{step.lead}</p>
                {step.detail && (
                  <p className="mt-2 text-sm leading-relaxed text-mute">{step.detail}</p>
                )}
                <StepExtra kind={step.extra} />
              </div>
            </motion.li>
          ))}
        </motion.ol>

        <div className="mt-16">
          <Stamp
            tone="accent"
            rotate={-2.5}
            className="max-w-full whitespace-normal px-5 py-3 text-sm leading-relaxed tracking-[0.1em] sm:text-base"
          >
            Right College. Right Interests. Right People.
          </Stamp>
        </div>
      </div>
    </section>
  );
}
