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
    body: 'Something you are still working on next semester. Slower to match, harder to leave.',
    meta: 'Months',
  },
  {
    id: 'SHORT_TERM',
    title: 'Short burst',
    body: 'Hackathon, one paper, one deadline. Match fast, ship, move on.',
    meta: 'Weeks',
  },
];

export default function SelectProjectTypeStep() {
  const { projectTypes: storeProjectTypes, selectProjectTypes, loading, fetchProjectTypes } = useInterestStore();
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchProjectTypes().catch(console.error);
    if (storeProjectTypes && storeProjectTypes.size > 0) {
      setSelectedTypes(new Set(storeProjectTypes));
    }
  }, []);

  const toggleType = (type) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setSelectedTypes(next);
  };

  const handleSubmit = async () => {
    if (selectedTypes.size === 0) {
      toast.error('Pick at least one');
      return;
    }
    try {
      await selectProjectTypes(selectedTypes);
    } catch (error) {
      toast.error(error.message || 'Could not save that');
    }
  };

  return (
    <div>
      <StepHeader eyebrow="Step four" title="How long are you in for?">
        Pick one or both. This decides who you get put in front of — nothing else
        about your profile matters as much.
      </StepHeader>

      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {TILES.map((tile) => {
          const selected = selectedTypes.has(tile.id);
          return (
            <motion.button
              key={tile.id}
              type="button"
              onClick={() => toggleType(tile.id)}
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
        disabled={selectedTypes.size === 0}
        className="mt-10"
      >
        Continue
      </Button>
    </div>
  );
}
