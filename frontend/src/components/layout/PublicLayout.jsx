import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Logo from '../brand/Logo';
import { useLenis } from '../../lib/useLenis';
import { page, useReducedMotion, transition } from '../../lib/motion';

// Campus copy, rotating. Specific places, not slogans.
const LINES = [
  'Find a ML lab partner in your hostel, not on LinkedIn.',
  'The guy who actually finishes the project is two floors up.',
  'Mess queue is long enough to find a co-founder.',
  'Someone in your year is stuck on the same paper at 2 a.m.',
];

// Verbatim from the landing's trust strip — the same three promises, so the
// marketing page and the sign-in screen do not make different claims.
const PROMISES = ['Only your college', 'Intent-Based Matching', 'Private by design'];

/*
 * The campus photo. Swapping in a photo of a launch campus means replacing
 * this one file — nothing in this component needs to change.
 *
 * Current: "GITAM University campus, Visakhapatnam" by Shubham Kr Soni,
 * Wikimedia Commons, CC0 — public domain, no attribution required. Cropped
 * to drop a building sign bearing the institution's name (CollZap has no
 * affiliation with it), then resized to 902x1467 and re-encoded at q70 (~384 KB).
 * If you replace it, check the frame for readable college names or logos.
 */
const CAMPUS_PHOTO = '/images/auth-campus.jpg';

// 1x1 transparent GIF. The <img> fallback phones get instead of the photo.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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
      {/* Left: a real campus, graded into the brand's navy. Hidden on mobile —
          the form comes first there. Always dark, in both themes. */}
      {!isAdmin && (
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0A1428] px-12 py-10 lg:flex">
          {/*
            <picture> with a desktop-only source, not a plain <img>. This aside
            is display:none below lg, and browsers still download an <img>
            inside a hidden element — so phones would pay for a large photo
            they never see. When the media query fails, the browser falls back
            to the blank <img src> and makes no request at all.
          */}
          <picture className="absolute inset-0">
            <source media="(min-width: 1024px)" srcSet={CAMPUS_PHOTO} />
            <motion.img
              src={BLANK}
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
              // A single slow settle on arrival, not a looping Ken Burns: a
              // perpetual transform on a full-height photo repaints forever
              // for nothing, and nobody watches a login screen that long.
              initial={reduced ? false : { scale: 1.07 }}
              animate={{ scale: 1 }}
              transition={reduced ? { duration: 0 } : { duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full object-cover object-center"
            />
          </picture>

          {/* Grade: pull the photo toward the UI's navy so it belongs to the
              product rather than sitting on it like a stock image. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#0B3D91]/30 mix-blend-multiply" />

          {/* Scrim: dark where text sits (logo top, copy bottom), clear through
              the middle so the campus itself stays the subject. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(10,20,40,0.78) 0%, rgba(10,20,40,0.12) 26%, rgba(10,20,40,0.06) 50%, rgba(10,20,40,0.82) 78%, rgba(10,20,40,0.96) 100%)',
            }}
          />

          {/* A brand-gradient seam where the photo meets the form. */}
          <div aria-hidden="true" className="grad-brand pointer-events-none absolute inset-y-0 right-0 w-px opacity-60" />

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
                className="font-display text-2xl font-bold leading-snug tracking-tight text-[#E8F0FE] [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]"
              >
                {LINES[lineIdx]}
              </motion.p>
            </AnimatePresence>

            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-[#B8C8DE]">
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
            // Full lockup, not the bare mark: on a phone this is the only place
            // the name appears before the form. Its wordmark defaults to
            // text-navy / dark:text-ink, so it follows the theme on its own.
            <Link to="/" aria-label="CollZap home" className="mb-10 inline-block rounded lg:hidden">
              <Logo className="h-9" animated />
            </Link>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
