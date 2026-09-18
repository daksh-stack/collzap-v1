import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import Logo from '../../../components/brand/Logo';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../store/useAuthStore';
import { usePrimaryCta } from '../shared';

/**
 * Grouped by what the link actually is, not the flat single-row list this
 * used to be. `href` is an in-page anchor on the landing page (rooted at "/"
 * since this footer also renders on every content page); `to` is a route.
 */
const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { href: '/#who', label: "Who it's for" },
      { href: '/#why', label: 'Why CollZap' },
      { href: '/#how', label: 'How it works' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/blog', label: 'Blog' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms & Conditions' },
    ],
  },
];

function FooterLink({ item }) {
  const className = 'rounded text-sm text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500';
  return item.to ? (
    <Link to={item.to} className={className}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href} className={className}>
      {item.label}
    </a>
  );
}

export default function Footer() {
  const { isAuthenticated } = useAuthStore();
  const cta = usePrimaryCta();

  return (
    <footer className="border-t border-line bg-paper px-6 pb-28 pt-16 sm:px-8 md:pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <Logo className="h-7" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">
              India&rsquo;s first campus peer-matching platform &mdash; find serious, verified peers
              inside your own college.
            </p>
            <a
              href="mailto:nitishkumar@collzap.com"
              className="mt-5 inline-flex items-center gap-2 rounded text-sm text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              nitishkumar@collzap.com
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-mute/80">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((item) => (
                  <li key={item.to || item.href}>
                    <FooterLink item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mute">
            <span className="tnum">&copy; {new Date().getFullYear()} CollZap.</span> All rights
            reserved.
          </p>

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
        </div>
      </div>
    </footer>
  );
}
