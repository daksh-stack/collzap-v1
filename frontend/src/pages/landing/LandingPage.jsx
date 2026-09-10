import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { ArrowRight, BadgeCheck, Layers, MessagesSquare, ShieldCheck, Target, Users } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import ConnectionField from '../../components/brand/ConnectionField';
import Button from '../../components/ui/Button';
import ScoreRing from '../../components/ui/ScoreRing';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { cn } from '../../lib/utils';
import { useLenis } from '../../lib/useLenis';
import { reveal, revealGroup, revealVariants, soft, useReducedMotion } from '../../lib/motion';

/* ------------------------------------------------------------------ */

const STEPS = [
  {
    icon: BadgeCheck,
    title: 'Verify your campus',
    body: 'Upload a fee slip or your college ID. A person checks it. No fake accounts, no outsiders, no one from another city pretending.',
  },
  {
    icon: Target,
    title: 'Pick what you mean it about',
    body: 'Two long-haul interests, or one short burst. Be specific — "machine learning" matches you with three hundred people, "diffusion models" finds you the one.',
  },
  {
    icon: Layers,
    title: 'Sit the paper',
    body: 'A short assessment for each long-term interest. It places you honestly: beginner, learning, intermediate or expert. Nobody gets to just claim it.',
  },
  {
    icon: MessagesSquare,
    title: 'Get matched, then talk',
    body: 'Same campus, same interest, roughly the same level. A chat opens the moment the group fills.',
  },
];

const LEVELS = [
  { name: 'Beginner', range: 'Score 0–40', note: 'Starting out. Matched with others who are too.' },
  { name: 'Learning', range: '41–60', note: 'Past the basics, still building.' },
  { name: 'Intermediate', range: '61–80', note: 'Can carry your half of a real project.' },
  { name: 'Expert', range: '81–100', note: 'Matched with people who will keep up.' },
];

const CONNECTIONS = [
  {
    icon: Users,
    name: 'One on one',
    size: '2 people',
    body: 'One peer, one interest, full attention. Opens as soon as your match is found.',
  },
  {
    icon: Users,
    name: 'Short group',
    size: '2 – 4 people',
    body: 'Enough hands to actually finish something before the semester runs out.',
  },
  {
    icon: Users,
    name: 'Society',
    size: 'Long-term only',
    body: 'A standing group around one interest. Grows over time instead of disbanding.',
  },
];

/* ------------------------------------------------------------------ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // At the top the bar floats over the always-dark hero, so it has to carry
  // light colours regardless of theme; once scrolled it rejoins the tokens.
  const link = scrolled
    ? 'text-mute hover:text-ink'
    : 'text-[#A8BDD8] hover:text-white';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 transition-all duration-300',
        scrolled
          ? 'border-b border-line bg-paper/85 backdrop-blur-lg'
          : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Logo className={cn('h-7 transition-colors duration-300 sm:h-8', !scrolled && 'text-[#E8F0FE]')} animated />

        <nav className="flex items-center gap-1 sm:gap-3">
          <a
            href="#how"
            className={cn(
              'hidden rounded px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:block',
              link
            )}
          >
            How it works
          </a>
          <a
            href="#levels"
            className={cn(
              'hidden rounded px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:block',
              link
            )}
          >
            Matching
          </a>
          <ThemeToggle
            className={cn('mr-1', !scrolled && 'text-[#A8BDD8] hover:bg-white/10 hover:text-white')}
          />
          <Link to="/signup">
            <Button size="sm" variant="gradient">Get started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
      <span className="grad-brand h-1 w-6 rounded-full" />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#08101F] pb-24 pt-32 sm:pb-32 sm:pt-40">
      <div className="absolute inset-0">
        <ConnectionField />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(100% 70% at 50% 0%, transparent 20%, rgba(8,16,31,0.86) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center sm:px-8">
        <motion.p
          {...reveal(reduced)}
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8FC2F5]"
        >
          Same campus · Different dreams · One platform
        </motion.p>

        <motion.h1
          {...reveal(reduced, 0.08)}
          className="mt-7 font-display text-4xl font-extrabold leading-[1.05] tracking-tightest text-[#E8F0FE] sm:text-6xl"
        >
          Build real connections.
          <br />
          <span className="text-grad">Grow together.</span>
        </motion.h1>

        <motion.p
          {...reveal(reduced, 0.16)}
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[#A8BDD8] sm:text-lg"
        >
          CollZap finds you verified students from your own college who are serious
          about the same thing — and roughly as far along as you are.
        </motion.p>

        <motion.div
          {...reveal(reduced, 0.24)}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link to="/signup" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="gradient"
              className="w-full sm:w-auto"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Get started
            </Button>
          </Link>
          <a href="#how" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full border border-white/20 bg-white/[0.06] text-[#E8F0FE] shadow-none hover:border-white/35 hover:bg-white/[0.11] hover:shadow-none sm:w-auto"
            >
              How it works
            </Button>
          </a>
        </motion.div>

        <motion.ul
          {...reveal(reduced, 0.32)}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[10px] uppercase tracking-widest text-[#7C93B5]"
        >
          {['Verified students only', 'Your college only', 'Matched by seriousness'].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="grad-brand h-1 w-1 rounded-full" />
              {t}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Wave hand-off into the light section below. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24">
        <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 48C240 8 420 88 720 60S1200 4 1440 40V96H0Z"
            className="fill-paper"
          />
        </svg>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how" className="scroll-mt-20 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div {...reveal(reduced)} className="max-w-2xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
            Four steps, and none of them are&nbsp;guesswork.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mute">
            Every filter exists for a reason. Campus verification keeps strangers out.
            The assessment keeps mismatched pairings out. What's left is people who
            will actually show up.
          </p>
        </motion.div>

        <motion.ol {...revealGroup(reduced)} className="mt-14 grid gap-5 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              variants={reduced ? undefined : revealVariants}
              whileHover={reduced ? undefined : { y: -4 }}
              transition={soft}
              className="group relative overflow-hidden rounded-lg border border-line bg-surface p-7 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-accent-300 hover:shadow-lg"
            >
              <span className="grad-brand absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              <div className="flex items-start gap-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent-50 text-accent-700">
                  <step.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-mute tnum">
                    Step {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{step.body}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Matching() {
  const reduced = useReducedMotion();

  return (
    <section id="levels" className="scroll-mt-20 border-y border-line bg-surface-2 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_auto]">
          <motion.div {...reveal(reduced)}>
            <SectionLabel>Matched by seriousness</SectionLabel>
            <h2 className="mt-5 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
              The part nobody else does.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-mute">
              Anyone can say they're serious. So before you're matched on a long-term
              interest, you sit a short assessment on it. Your score places you in a
              band, and you're only paired with people in the same one.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-mute">
              That's why a first-year who genuinely grinds doesn't get stuck with
              someone who joined for the résumé line.
            </p>

            <ul className="mt-9 divide-y divide-line border-y border-line">
              {LEVELS.map((lvl) => (
                <li key={lvl.name} className="flex items-baseline gap-4 py-3.5">
                  <span className="w-28 shrink-0 font-display text-sm font-bold tracking-tight text-ink">
                    {lvl.name}
                  </span>
                  <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-wide text-accent-700 tnum">
                    {lvl.range}
                  </span>
                  <span className="text-sm text-mute">{lvl.note}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...reveal(reduced, 0.1)} className="mx-auto lg:mx-0">
            <div className="rounded-lg border border-line bg-surface p-8 shadow-lg rim">
              <ScoreRing value={78} label="Intermediate" trigger="view" />
              <p className="mt-4 max-w-[14rem] text-center text-xs leading-relaxed text-mute">
                Retake in 30 days. Your level moves with you.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Connections() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div {...reveal(reduced)} className="max-w-2xl">
          <SectionLabel>Three ways to connect</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
            Pick the shape that fits the work.
          </h2>
        </motion.div>

        <motion.div {...revealGroup(reduced)} className="mt-14 grid gap-5 sm:grid-cols-3">
          {CONNECTIONS.map((c) => (
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
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent-700">
                {c.size}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mute">{c.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Trust() {
  const reduced = useReducedMotion();

  return (
    <section className="border-t border-line bg-surface-2 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2">
        <motion.div {...reveal(reduced)}>
          <SectionLabel>Your college only</SectionLabel>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
            A closed campus, on purpose.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mute">
            Every account is checked against a real college document before it can be
            matched with anyone. You can hide your profile, block someone, or report
            them from any screen — and leaving a group takes one tap.
          </p>
        </motion.div>

        <motion.ul {...revealGroup(reduced)} className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, t: 'Document verified', d: 'Fee slip or college ID, reviewed by a person.' },
            { icon: BadgeCheck, t: 'Campus locked', d: 'You only ever see people from your own college.' },
            { icon: Users, t: 'Leave any time', d: 'Groups are not a commitment you can’t undo.' },
            { icon: MessagesSquare, t: 'Report and block', d: 'Available from every profile and chat.' },
          ].map((f) => (
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

/* ------------------------------------------------------------------ */

function FinalCta() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-paper px-6 py-20 sm:px-8 sm:py-28">
      <motion.div
        {...reveal(reduced)}
        className="grad-brand relative mx-auto max-w-6xl overflow-hidden rounded-2xl px-8 py-16 text-center sm:px-16 sm:py-20"
      >
        <div className="absolute inset-0 opacity-70">
          <ConnectionField intensity={0.55} />
        </div>

        <div className="relative">
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tightest text-white sm:text-4xl">
            Someone on your campus is stuck
            <br className="hidden sm:block" /> on the same thing tonight.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/85">
            Verify once. Get matched with people who mean it.
          </p>
          <Link to="/signup" className="mt-9 inline-block">
            <Button
              size="lg"
              className="bg-white text-[#0A3F8C] shadow-lg hover:bg-white hover:brightness-95"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Get started
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-paper px-6 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <Logo className="h-7" />
          <p className="mt-3 text-xs text-mute">
            India’s first campus peer-matching platform.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-mute">
          <Link to="/login" className="rounded transition-colors hover:text-ink">Sign in</Link>
          <a href="#how" className="rounded transition-colors hover:text-ink">How it works</a>
          <span className="tnum">© {new Date().getFullYear()} CollZap</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function LandingPage() {
  useLenis(true);

  return (
    <div className="min-h-screen bg-paper">
      <Helmet>
        <title>CollZap — Same campus. Different dreams. One platform.</title>
        <meta
          name="description"
          content="CollZap matches you with verified students from your own college who are serious about the same thing, at the same level."
        />
      </Helmet>

      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Matching />
        <Connections />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
