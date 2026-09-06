import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import IdCardCanvas from '../three/IdCardCanvas';
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
      {/* Left: atmosphere. Hidden on mobile — form comes first there. */}
      {!isAdmin && (
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-line px-12 py-10 grain">
          <div className="relative z-10">
            <span className="font-display text-xl font-semibold tracking-tightest text-ink">
              CollZap
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <IdCardCanvas className="h-[26rem] w-full" />
          </div>

          <div className="relative z-10 max-w-md">
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIdx}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={transition(page, reduced)}
                className="font-display text-2xl leading-snug tracking-tight text-ink"
              >
                {LINES[lineIdx]}
              </motion.p>
            </AnimatePresence>
            <p className="mt-4 text-xs uppercase tracking-widest text-mute">
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
            <span className="lg:hidden mb-10 block font-display text-lg font-semibold tracking-tightest text-ink">
              CollZap
            </span>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
