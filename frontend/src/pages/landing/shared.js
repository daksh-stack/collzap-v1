import { useAuthStore } from '../../store/useAuthStore';

/**
 * The landing is reachable signed in or out, so the primary call to action has
 * to change: pitching "Get started" at someone who already has an account is
 * noise. Targets mirror OnboardingGuard's own rules so the CTA never lands on
 * a route that immediately redirects.
 *
 * Every CTA on the page goes through this — never a hardcoded `/signup`.
 */
export function usePrimaryCta() {
  const { isAuthenticated, user, nextStep } = useAuthStore();

  if (!isAuthenticated) return { to: '/signup', label: 'Get started' };
  if (user?.isAdmin) return { to: '/admin', label: 'Open the console' };

  const canAccessApp = !nextStep || nextStep === 'READY' || nextStep === 'AWAITING_VERIFICATION';
  return canAccessApp
    ? { to: '/home', label: 'Go to your desk' }
    : { to: '/onboarding', label: 'Finish setting up' };
}

/**
 * Shared by the header and the footer so the two can never drift apart. Each
 * hash must match an `id` on a landing section element.
 *
 * Rooted at "/" rather than bare "#who" because the header and footer also
 * render on /about and /faq, where a bare hash would resolve against the
 * current page and go nowhere.
 */
export const NAV_LINKS = [
  { href: '/#who', label: "Who it's for" },
  { href: '/#why', label: 'Why CollZap' },
  { href: '/#how', label: 'How it works' },
];

/** Content pages, linked from the footer — the site's only non-anchor internal links. */
export const FOOTER_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
];

/**
 * The interest catalogue as it appears in the product. Used as tags in two
 * places — the "who it's for" section and step 2 of how-it-works — so it lives
 * here rather than being typed twice.
 */
export const INTEREST_CHIPS = [
  'Startups',
  'Coding',
  'AI / ML',
  'Design',
  'Finance',
  'Fitness',
  'Marketing',
  'Content Creation',
];
