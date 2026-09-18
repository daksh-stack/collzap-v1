import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import Logo from '../../../components/brand/Logo';
import Button from '../../../components/ui/Button';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import { cn } from '../../../lib/utils';
import { snappy, transition, useReducedMotion } from '../../../lib/motion';
import { HOME_SECTIONS, NAV_PAGES, usePrimaryCta } from '../shared';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const homeRef = useRef(null);
  const reduced = useReducedMotion();
  const cta = usePrimaryCta();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Closes on Escape and on a click anywhere outside the trigger + panel —
  // the two things a dropdown is expected to do that a plain toggle button
  // doesn't get for free.
  useEffect(() => {
    if (!homeOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setHomeOpen(false); };
    const onClick = (e) => {
      if (homeRef.current && !homeRef.current.contains(e.target)) setHomeOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [homeOpen]);

  // At the top the bar floats over the always-dark hero, so it has to carry
  // light colours regardless of theme; once scrolled it rejoins the tokens.
  // An open menu counts as "scrolled" — the sheet is a token surface, and a
  // half-light half-dark header reads as a bug.
  const solid = scrolled || menuOpen;
  const link = solid ? 'text-mute hover:text-ink' : 'text-[#A8BDD8] hover:text-white';

  // On a phone the header is just a logo and two bare glyphs, which reads as
  // unfinished. Giving them a real surface makes them look like the buttons
  // they are — and 40px is a proper touch target.
  const iconBtn = solid
    ? 'border border-line bg-surface text-mute hover:text-ink'
    : 'border border-white/15 bg-white/[0.07] text-[#A8BDD8] hover:bg-white/[0.12] hover:text-white';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 transition-all duration-300',
        solid
          ? 'border-b border-line bg-paper/85 backdrop-blur-lg'
          : 'border-b border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Logo className={cn('h-7 transition-colors duration-300 sm:h-8', !solid && 'text-[#E8F0FE]')} animated />

        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Home: a direct link back to "/" from anywhere on the site, plus a
              dropdown for the landing page's own sections — those are anchors
              on one page, not destinations of their own, so grouping them
              under Home keeps the bar from reading as five equal-weight
              top-level items. Click-toggled rather than hover-opened: hover
              menus don't have an equivalent on touch, and this way desktop
              and mobile share one interaction model. */}
          <div ref={homeRef} className="relative hidden lg:block">
            <div className={cn('flex items-center rounded', link)}>
              <Link
                to="/"
                className="rounded-l px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                Home
              </Link>
              <button
                type="button"
                aria-label="Homepage sections"
                aria-expanded={homeOpen}
                onClick={() => setHomeOpen((o) => !o)}
                className="rounded-r py-2 pl-0.5 pr-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform', homeOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            </div>

            <AnimatePresence>
              {homeOpen && (
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={transition(snappy, reduced)}
                  className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-line bg-surface py-1.5 shadow-lg"
                >
                  {HOME_SECTIONS.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setHomeOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-accent-50 hover:text-accent-700 focus-visible:outline-none focus-visible:bg-accent-50"
                    >
                      {item.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_PAGES.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'hidden rounded px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 lg:block',
                link
              )}
            >
              {item.label}
            </Link>
          ))}

          <ThemeToggle
            className={cn(
              'ml-1 h-10 w-10 rounded-lg lg:ml-2 lg:h-9 lg:w-9',
              iconBtn,
              solid && 'hover:bg-accent-50 hover:text-accent-700'
            )}
          />

          <Link
            to="/login"
            className={cn(
              'hidden rounded px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:block',
              link
            )}
          >
            Log in
          </Link>

          <Link to={cta.to} className="hidden sm:block">
            <Button size="sm" variant="gradient">{cta.label}</Button>
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              'ml-2 grid h-10 w-10 place-items-center rounded-lg transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 lg:hidden',
              iconBtn
            )}
          >
            {menuOpen
              ? <X className="h-5 w-5" aria-hidden="true" />
              : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={transition(snappy, reduced)}
            className="overflow-hidden border-t border-line bg-paper lg:hidden"
          >
            <ul className="mx-auto max-w-6xl divide-y divide-line px-6 pb-4 sm:px-8">
              {/* Mobile has room to just show everything at once rather than
                  nesting a second toggle inside the sheet — Home as its own
                  row, its sections indented underneath. */}
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded py-4 text-base font-medium text-ink transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  Home
                  <ChevronRight className="h-4 w-4 shrink-0 text-mute" aria-hidden="true" />
                </Link>
                <ul className="ml-3 border-l border-line pb-3 pl-4">
                  {HOME_SECTIONS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded py-2.5 text-sm font-medium text-mute transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              {NAV_PAGES.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded py-4 text-base font-medium text-ink transition-colors hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 shrink-0 text-mute" aria-hidden="true" />
                  </Link>
                </li>
              ))}

              <li className="flex items-center gap-3 pt-4 sm:hidden">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="shrink-0 rounded px-2 py-2 text-sm font-medium text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  Log in
                </Link>
                <Link to={cta.to} onClick={() => setMenuOpen(false)} className="flex-1">
                  <Button size="md" variant="gradient" className="w-full">{cta.label}</Button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
