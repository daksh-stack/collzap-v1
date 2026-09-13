import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import Button from '../../../components/ui/Button';
import StepHeader from './StepHeader';
import { useInterestStore } from '../../../store/useInterestStore';
import { cn } from '../../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../../lib/motion';

const TILES = [
  {
    id: 'LONG_TERM',
    title: 'Long haul',
    body: 'Something you are still working on next semester. Slower to match, harder to leave. This is a one-time choice — set once, not changeable later.',
    meta: 'Months',
  },
  {
    id: 'SHORT_TERM',
    title: 'Short burst',
    body: 'Hackathon, one paper, one deadline. Match fast, ship, move on. You can pick a new one any time from your home page.',
    meta: 'Weeks',
  },
];

// This step only ever renders when the user has picked nothing yet — once a
// project type exists, OnboardingService.resolveStep() never routes back
// here. Long-Term can be added later from the home page (routes back through
// onboarding just for that); Short-Term has its own repeatable home-page flow
// entirely. So the choice here is strictly single: which one to start with.
export default function SelectProjectTypeStep() {
  const { selectProjectTypes, loading, fetchProjectTypes } = useInterestStore();
  const [selectedType, setSelectedType] = useState(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchProjectTypes().catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('Pick one to start');
      return;
    }
    try {
      await selectProjectTypes(new Set([selectedType]));
    } catch (error) {
      toast.error(error.message || 'Could not save that');
    }
  };

  return (
    <div>
      <StepHeader eyebrow="Step four" title="How long are you in for?">
        Pick one to start with — you can add the other later.
      </StepHeader>

      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {TILES.map((tile) => {
          const selected = selectedType === tile.id;
          return (
            <motion.button
              key={tile.id}
              type="button"
              onClick={() => setSelectedType(tile.id)}
              aria-pressed={selected}
              whileTap={reduced ? undefined : { scale: 0.99 }}
              transition={transition(snappy, reduced)}
              className={cn(
                'group relative flex min-h-[13rem] flex-col justify-between rounded-lg border p-6 text-left',
                'transition-[background-color,border-color,box-shadow] duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                selected
                  ? 'border-accent-500 bg-accent-50 shadow-glow-accent'
                  : 'border-line bg-surface shadow-sm hover:border-accent-300 hover:shadow-md'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
                  {tile.meta}
                </span>
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors',
                    selected ? 'grad-brand-cta border-transparent' : 'border-line'
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </span>
              </div>

              <div>
                <h2
                  className={cn(
                    'font-display text-3xl font-bold tracking-tight',
                    selected ? 'text-accent-800' : 'text-ink'
                  )}
                >
                  {tile.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mute">{tile.body}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Button
        onClick={handleSubmit}
        size="lg"
        loading={loading}
        disabled={!selectedType}
        className="mt-10"
      >
        Continue
      </Button>
    </div>
  );
}
