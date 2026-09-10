import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import ConnectionField from '../brand/ConnectionField';
import Logo, { LogoMark } from '../brand/Logo';
import { useLenis } from '../../lib/useLenis';
import { page, useReducedMotion, transition } from '../../lib/motion';

// Campus copy, rotating. Specific places, not slogans.
const LINES = [
  'Find a ML lab partner in your hostel, not on LinkedIn.',
  'The guy who actually finishes the project is two floors up.',
  'Mess queue is long enough to find a co-founder.',
  'Someone in your year is stuck on the same paper at 2 a.m.',
];

export default function PublicLayout() {
  const location = useLocation();
  const reduced = useReducedMotion();
  useLenis(true);

  const isAdmin = location.pathname === '/admin/login';
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (isAdmin) return;
    const id = setInterval(() => setLineIdx((i) => (i + 1) % LINES.length), 5200);
    return () => clearInterval(id);
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left: atmosphere. Hidden on mobile — form comes first there.
          Always dark, in both themes: it is the brand's own ground. */}
      {!isAdmin && (
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0A1428] px-12 py-10 lg:flex">
          <div className="absolute inset-0">
            <ConnectionField />
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 50%, transparent 30%, rgba(10,20,40,0.75) 100%)',
            }}
          />

          <div className="relative z-10">
            <Link to="/" aria-label="CollZap home" className="inline-block rounded">
              <Logo className="h-8 text-[#E8F0FE]" animated />
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIdx}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={transition(page, reduced)}
                className="font-display text-2xl font-bold leading-snug tracking-tight text-[#E8F0FE]"
              >
                {LINES[lineIdx]}
              </motion.p>
            </AnimatePresence>
            <p className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#9FB3D0]">
              <span className="grad-brand h-1.5 w-1.5 rounded-full" />
              Verified students only
            </p>
          </div>
        </aside>
      )}

      {/* Right: the form. */}
      <main
        className={
          isAdmin
            ? 'flex min-h-screen items-center justify-center px-6 lg:col-span-2'
            : 'flex min-h-screen items-center justify-center px-6 py-14 sm:px-10'
        }
      >
        <div className="w-full max-w-sm">
          {!isAdmin && (
            <Link to="/" aria-label="CollZap home" className="mb-10 inline-block rounded lg:hidden">
              <LogoMark className="h-9" />
            </Link>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
