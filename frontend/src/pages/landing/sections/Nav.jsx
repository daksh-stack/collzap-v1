import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import Logo from '../../../components/brand/Logo';
import Button from '../../../components/ui/Button';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import { cn } from '../../../lib/utils';
import { snappy, transition, useReducedMotion } from '../../../lib/motion';
import { NAV_LINKS, usePrimaryCta } from '../shared';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // At the top the bar floats over the always-dark hero, so it has to carry
  // light colours regardless of theme; once scrolled it rejoins the tokens.
  // An open menu counts as "scrolled" — the sheet is a token surface, and a
  // half-light half-dark header reads as a bug.
  const solid = scrolled || menuOpen;
  const link = solid ? 'text-mute hover:text-ink' : 'text-[#A8BDD8] hover:text-white';

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
          {/* Four anchors plus two auth actions needs real width, so the links
              hand over to the sheet below lg rather than below md. */}
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'hidden rounded px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 lg:block',
                link
              )}
            >
              {item.label}
            </a>
          ))}

          <ThemeToggle
            className={cn('mx-1', !solid && 'text-[#A8BDD8] hover:bg-white/10 hover:text-white')}
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
              'grid h-9 w-9 place-items-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 lg:hidden',
              link
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
            <ul className="mx-auto max-w-6xl px-6 py-3 sm:px-8">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded px-2 py-3 text-sm font-medium text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3 border-t border-line pb-2 pt-3 sm:hidden">
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
