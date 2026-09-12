import { motion } from 'motion/react';
import { Code2, Palette, Rocket, Users } from 'lucide-react';
import { reveal, revealGroup, revealVariants, useReducedMotion } from '../../../lib/motion';
import SectionLabel from '../SectionLabel';

// The things students are actually looking for, in their own words.
const NEEDS = [
  'Need Project Teammates',
  'Need Startup Partners',
  'Need A Serious Study Group',
  'Looking for startup co-founder',
  'Want a serious study group',
  'Need coding partners',
  'Looking for creators & designers',
  'Want meaningful friendships',
];

const CARDS = [
  {
    icon: Rocket,
    title: 'Startup Partners',
    lead: 'Hard to find ambitious builders.',
    body: 'Finding future co-founders and builders on campus is mostly luck.',
  },
  {
    icon: Code2,
    title: 'Project Teammates',
    lead: 'Talent rarely discovers talent.',
    body: 'Most talented students never discover each other.',
  },
  {
    icon: Users,
    title: 'Study Circles',
    lead: 'Most groups become inactive.',
    body: 'WhatsApp groups often become inactive and noisy. Need a study circle that actually studies.',
  },
  {
    icon: Palette,
    title: 'Creators & like-minded people',
    body: 'Shared interests rarely turn into meaningful connections.',
  },
];

/* ---------------- the corridor ---------------- */

const VP = { x: 400, y: 155 };          // vanishing point
const MOUTH = { l: 20, r: 780, t: 10, b: 300 };
const DEPTHS = [0, 0.2, 0.37, 0.51, 0.62, 0.71];

// Project a point on the corridor mouth back to `t` depth.
const px = (x, t) => VP.x + (1 - t) * (x - VP.x);
const py = (y, t) => VP.y + (1 - t) * (y - VP.y);

/** One door on a side wall, spanning depths t1 → t2. */
function doorPath(wallX, t1, t2) {
  const top = 70;
  const bottom = 272;
  return [
    `M${px(wallX, t1)} ${py(top, t1)}`,
    `L${px(wallX, t2)} ${py(top, t2)}`,
    `L${px(wallX, t2)} ${py(bottom, t2)}`,
    `L${px(wallX, t1)} ${py(bottom, t1)}`,
    'Z',
  ].join(' ');
}

/**
 * A hostel corridor, drawn rather than sourced: receding hairline door frames,
 * every one shut but a single lit one, and one figure standing in front of it.
 * The lit door is the only colour in this whole section.
 */
function Corridor() {
  const doors = [];
  for (let i = 0; i < DEPTHS.length - 1; i++) {
    doors.push({ t1: DEPTHS[i], t2: DEPTHS[i + 1], i });
  }

  return (
    <svg
      viewBox="0 0 800 310"
      className="h-full w-full"
      role="img"
      aria-label="A long hostel corridor of closed doors with a single lit doorway"
    >
      {/* Ceiling, floor and wall creases converging on the vanishing point. */}
      {[
        [MOUTH.l, MOUTH.t], [MOUTH.r, MOUTH.t],
        [MOUTH.l, MOUTH.b], [MOUTH.r, MOUTH.b],
      ].map(([x, y], i) => (
        <line
          key={i}
          x1={x} y1={y} x2={VP.x} y2={VP.y}
          className="stroke-ink/15"
          strokeWidth="1"
        />
      ))}

      {doors.map(({ t1, t2, i }) => {
        // One door, third on the left, is open and lit.
        const lit = i === 2;
        return (
          <g key={`l${i}`}>
            <path
              d={doorPath(MOUTH.l + 90, t1, t2)}
              className={lit ? 'fill-accent-500/20 stroke-accent-500/70' : 'fill-ink/[0.03] stroke-ink/15'}
              strokeWidth="1"
            />
            <path
              d={doorPath(MOUTH.r - 90, t1, t2)}
              className="fill-ink/[0.03] stroke-ink/15"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* The one student, front and centre, facing the long way down. */}
      <g className="fill-ink/70">
        <circle cx="392" cy="214" r="13" />
        <path d="M368 282c0-16 11-28 24-28s24 12 24 28z" />
      </g>
    </svg>
  );
}

/* ---------------- section ---------------- */

/**
 * Deliberately colourless apart from the lit doorway: no accent on the notes
 * or the cards. The first time the brand gradient really appears should be the
 * answer, not the problem.
 */
export default function Problem() {
  const reduced = useReducedMotion();

  return (
    <section id="problem" className="scroll-mt-20 border-b border-line bg-surface-2 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div {...reveal(reduced)} className="max-w-2xl">
          <SectionLabel>The problem</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
            Surrounded By Students. Still Can’t Find Your People.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-mute">
            Most college students never find people who truly share their interests and ambitions.
          </p>
          <p className="mt-4 text-base leading-relaxed text-mute">
            College campuses are full of opportunities, but most students never find the
            people who truly match their interests, ambitions, and goals.
          </p>
        </motion.div>

        <motion.div
          {...reveal(reduced, 0.08)}
          className="mt-12 h-52 overflow-hidden rounded-lg border border-line bg-surface sm:h-72"
        >
          <Corridor />
        </motion.div>

        {/* The same thoughts, pinned up the way they actually get pinned up. */}
        <motion.ul
          {...revealGroup(reduced)}
          className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-5"
          aria-label="What students are looking for"
        >
          {NEEDS.map((need, i) => (
            <motion.li
              key={need}
              variants={reduced ? undefined : revealVariants}
              style={{ rotate: `${(i % 2 === 0 ? -1 : 1) * (1 + (i % 3) * 0.6)}deg` }}
              className="relative w-[10.5rem] rounded-sm border border-wait/25 bg-wait/[0.09] px-3 pb-3 pt-5 text-xs leading-snug text-ink shadow-sm"
            >
              {/* Tape. */}
              <span
                aria-hidden="true"
                className="absolute -top-1.5 left-1/2 h-3 w-10 -translate-x-1/2 rounded-[1px] bg-ink/[0.07]"
              />
              {need}
            </motion.li>
          ))}
        </motion.ul>

        <motion.div {...revealGroup(reduced)} className="mt-14 grid gap-5 sm:grid-cols-2">
          {CARDS.map((card) => (
            <motion.article
              key={card.title}
              variants={reduced ? undefined : revealVariants}
              className="rounded-lg border border-line bg-surface p-7 shadow-sm"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink/[0.05] text-mute">
                <card.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-ink">
                {card.title}
              </h3>
              {card.lead && (
                <p className="mt-1.5 text-sm font-medium text-ink/70">{card.lead}</p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-mute">{card.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.p
          {...reveal(reduced, 0.1)}
          className="mt-14 max-w-2xl font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl"
        >
          The problem isn’t a lack of people. It’s finding the right people.
        </motion.p>
      </div>
    </section>
  );
}
