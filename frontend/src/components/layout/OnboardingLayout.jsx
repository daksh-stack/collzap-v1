import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import { useUserStore } from '../../store/useUserStore';
import { cn } from '../../lib/utils';
import { useLenis } from '../../lib/useLenis';
import { snappy, useReducedMotion, transition } from '../../lib/motion';

// EXACT backend OnboardingStep enums, in order.
// VERIFICATION_REJECTED is a state of the document step, not its own item.
const STEPS = [
  { id: 'UPLOAD_DOCUMENT', name: 'ID' },
  { id: 'COMPLETE_PROFILE', name: 'Profile' },
  { id: 'SELECT_PROJECT_TYPE', name: 'Scope' },
  { id: 'SELECT_INTERESTS', name: 'Interests' },
  { id: 'TAKE_SERIOUSNESS_TEST', name: 'Paper' },
  { id: 'SELECT_CONNECTION_TYPE', name: 'Format' },
  { id: 'AWAITING_VERIFICATION', name: 'Review' },
];

export default function OnboardingLayout() {
  // OnboardingPage renders off the user store's onboarding.step, so the
  // stepper must read the same source or the two disagree.
  const { onboarding } = useUserStore();
  const reduced = useReducedMotion();
  useLenis(true);

  const step = onboarding?.step;
  const resolved = step === 'VERIFICATION_REJECTED' ? 'UPLOAD_DOCUMENT' : step;
  const currentIndex = STEPS.findIndex((s) => s.id === resolved);
  const rejected = step === 'VERIFICATION_REJECTED';

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-3xl px-6 py-5 flex items-center justify-between gap-6">
          <span className="font-display text-base font-semibold tracking-tightest text-ink shrink-0">
            CollZap
          </span>

          <nav aria-label="Progress" className="flex-1">
            <ol className="flex items-center justify-end gap-1.5">
              {STEPS.map((s, i) => {
                const status =
                  currentIndex === -1 ? 'upcoming'
                  : i < currentIndex ? 'complete'
                  : i === currentIndex ? 'current'
                  : 'upcoming';

                return (
                  <li key={s.id} className="flex items-center gap-1.5">
                    <span className="sr-only">{s.name}</span>
                    <motion.span
                      aria-current={status === 'current' ? 'step' : undefined}
                      animate={{
                        width: status === 'current' ? 26 : 12,
                      }}
                      transition={transition(snappy, reduced)}
                      className={cn(
                        'block h-1 rounded-sm',
                        status === 'complete' && 'bg-accent-400',
                        status === 'current' && (rejected ? 'bg-bad' : 'bg-accent-600'),
                        status === 'upcoming' && 'bg-line'
                      )}
                    />
                  </li>
                );
              })}
            </ol>
            <p className="mt-2 text-right font-mono text-[10px] uppercase tracking-widest text-mute">
              {currentIndex >= 0
                ? `${currentIndex + 1} / ${STEPS.length} · ${STEPS[currentIndex].name}`
                : 'Setup'}
            </p>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
