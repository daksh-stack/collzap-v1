import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import ConnectionField from '../../../components/brand/ConnectionField';
import Button from '../../../components/ui/Button';
import { reveal, useReducedMotion } from '../../../lib/motion';
import IdBadge from '../IdBadge';
import { usePrimaryCta } from '../shared';

// The four promises, verbatim.
const STRIP = [
  'Meaningful Connections',
  'Shared Interests & Goals',
  'Build Projects & Startups',
  'Learn, Grow & Succeed Together',
];

export default function Hero() {
  const reduced = useReducedMotion();
  const cta = usePrimaryCta();

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

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_auto] lg:gap-16">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <motion.p
              {...reveal(reduced)}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8FC2F5]"
            >
              Same campus. Different dreams. One platform.
            </motion.p>

            <motion.h1
              {...reveal(reduced, 0.08)}
              className="mt-7 font-display text-4xl font-extrabold leading-[1.05] tracking-tightest text-[#E8F0FE] sm:text-5xl xl:text-6xl"
            >
              Find <span className="text-grad">Your Circle</span> Before College Passes You By.
            </motion.h1>

            <motion.p
              {...reveal(reduced, 0.16)}
              className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[#A8BDD8] sm:text-lg lg:mx-0"
            >
              CollZap helps students discover like-minded peers for friendships, projects,
              startups, learning, and growth inside their campus.
            </motion.p>

            <motion.p
              {...reveal(reduced, 0.22)}
              className="mt-5 text-sm text-[#7C93B5]"
            >
              Launching first in selected Indian colleges.
            </motion.p>

            <motion.div
              {...reveal(reduced, 0.28)}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link to={cta.to} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="gradient"
                  className="w-full sm:w-auto"
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  {cta.label}
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full border border-white/20 bg-white/[0.06] text-[#E8F0FE] shadow-none hover:border-white/35 hover:bg-white/[0.11] hover:shadow-none sm:w-auto"
                >
                  Log in
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* The brand object. Below lg it follows the CTAs rather than pushing
              them under the fold. */}
          <motion.div {...reveal(reduced, 0.34)} className="lg:pt-4">
            <IdBadge />
          </motion.div>
        </div>

        <motion.ul
          {...reveal(reduced, 0.4)}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[10px] uppercase tracking-widest text-[#7C93B5]"
        >
          {STRIP.map((t) => (
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
