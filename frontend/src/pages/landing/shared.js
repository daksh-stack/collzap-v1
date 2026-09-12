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
 * In-page destinations, shared by the header and the footer so the two can
 * never drift apart. Each `href` must match an `id` on a section element.
 */
export const NAV_LINKS = [
  { href: '#problem', label: 'The problem' },
  { href: '#who', label: "Who it's for" },
  { href: '#why', label: 'Why CollZap' },
  { href: '#how', label: 'How it works' },
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
