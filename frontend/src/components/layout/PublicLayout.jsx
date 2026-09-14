import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import ConnectionField from '../brand/ConnectionField';
import IdBadge from '../brand/IdBadge';
import Logo, { LogoMark } from '../brand/Logo';
import { useLenis } from '../../lib/useLenis';
import { page, soft, useReducedMotion, transition } from '../../lib/motion';

// Campus copy, rotating. Specific places, not slogans.
const LINES = [
  'Find a ML lab partner in your hostel, not on LinkedIn.',
  'The guy who actually finishes the project is two floors up.',
  'Mess queue is long enough to find a co-founder.',
  'Someone in your year is stuck on the same paper at 2 a.m.',
];

// Verbatim from the landing's trust strip — the same three promises, so the
// marketing page and the sign-in screen do not make different claims.
const PROMISES = ['Only your college', 'Intent-Based Matching', '100% Confidential'];

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
      {/* Left: the brand's own ground. Hidden on mobile — the form comes first
          there. Always dark, in both themes.

          The middle used to be empty canvas. It now holds the campus ID: the
          one object that says what this screen is actually gatekeeping. */}
      {!isAdmin && (
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0A1428] px-12 py-10 lg:flex">
          <div className="absolute inset-0">
            <ConnectionField />
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 45%, transparent 24%, rgba(10,20,40,0.82) 100%)',
            }}
          />

          <div className="relative z-10">
            <Link to="/" aria-label="CollZap home" className="inline-block rounded">
              <Logo className="h-8 text-[#E8F0FE]" animated />
            </Link>
          </div>

          {/* The badge, lit from behind so it lifts off the field. */}
          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-6">
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full opacity-60 blur-[72px]"
                style={{
                  background:
                    'radial-gradient(circle, rgba(30,136,229,0.55) 0%, rgba(0,188,212,0.3) 45%, transparent 72%)',
                }}
              />
              <motion.div
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition(soft, reduced)}
                className="relative"
              >
                {/* Sized off viewport *height*, not width: the aside is
                    `overflow-hidden`, and a laptop at 720px tall has far less
                    room here than a desktop at 1080 regardless of how wide
                    the column is. */}
                <IdBadge className="w-[11.5rem] [@media(min-height:860px)]:w-[13rem] [@media(min-height:1000px)]:w-[14.5rem]" />
              </motion.div>
            </div>
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

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[#9FB3D0]">
              {PROMISES.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="grad-brand h-1.5 w-1.5 rounded-full" />
                  {p}
                </li>
              ))}
            </ul>
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
