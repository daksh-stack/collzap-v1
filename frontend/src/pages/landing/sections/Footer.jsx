import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '../../../components/brand/Logo';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../store/useAuthStore';
import { NAV_LINKS, usePrimaryCta } from '../shared';

export default function Footer() {
  const { isAuthenticated } = useAuthStore();
  const cta = usePrimaryCta();

  return (
    <footer className="border-t border-line bg-paper px-6 py-12 pb-28 sm:px-8 md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo className="h-7" />
          <p className="mt-3 text-xs text-mute">
            India’s first campus peer-matching platform.
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          {/* Same system button as the header, hero and sticky bar. */}
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="rounded px-2 py-2 text-sm font-medium text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                Log in
              </Link>
            )}
            <Link to={cta.to}>
              <Button size="sm" variant="gradient" icon={<ArrowRight className="h-4 w-4" />}>
                {cta.label}
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-mute sm:justify-end">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} className="rounded transition-colors hover:text-ink">
                {item.label}
              </a>
            ))}
            <span className="tnum">© {new Date().getFullYear()} CollZap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
