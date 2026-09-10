import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import StepHeader from './StepHeader';
import { useInterestStore } from '../../../store/useInterestStore';
import { cn } from '../../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../../lib/motion';

const BASE_OPTIONS = [
  { id: 'ONE_ON_ONE', name: 'One on one', desc: 'One person, matched close. Least noise.' },
  { id: 'SHORT_GROUP', name: 'Small group', desc: 'Two to four. Someone always carries it.' },
];

// SOCIETY only exists for long-term work.
const SOCIETY = { id: 'SOCIETY', name: 'Society', desc: 'An open room for the interest. Loose, ongoing.' };

export default function SelectConnectionTypeStep() {
  const { projectTypes, fetchProjectTypes, connectionTypes, fetchConnectionTypes, selectConnectionType, loading } = useInterestStore();
  const reduced = useReducedMotion();

  const ptArray = Array.from(projectTypes || []);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    fetchConnectionTypes().catch(console.error);
    fetchProjectTypes().catch(console.error);
  }, []);

  useEffect(() => {
    if (connectionTypes && connectionTypes.length > 0) {
      setSelections((prev) => {
        const next = { ...prev };
        connectionTypes.forEach((ct) => { next[ct.projectType] = ct.connectionType; });
        return next;
      });
    }
  }, [connectionTypes]);

  const handleSelect = (projectType, type) => {
    setSelections((prev) => ({ ...prev, [projectType]: type }));
  };

  const handleSubmit = async () => {
    const missing = ptArray.filter((pt) => !selections[pt]);
    if (missing.length > 0) {
      toast.error('Pick a format for each one');
      return;
    }

    try {
      // Backend takes one project type at a time (PUT /connection-types).
      for (const pt of ptArray) {
        await selectConnectionType(pt, selections[pt]);
      }
    } catch (error) {
      toast.error(error.message || 'Could not save that');
    }
  };

  return (
    <div>
      <StepHeader eyebrow="Last step" title="How many people?">
        You can change this later, but it decides the size of the first room you
        land in.
      </StepHeader>

      <div className="space-y-12">
        {ptArray.map((pt) => {
          const isLongTerm = pt === 'LONG_TERM';
          const options = isLongTerm ? [...BASE_OPTIONS, SOCIETY] : BASE_OPTIONS;
          const selected = selections[pt];

          return (
            <section key={pt}>
              <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-accent-700">
                {isLongTerm ? 'For long-haul work' : 'For short bursts'}
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {options.map((opt) => {
                  const isOn = selected === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(pt, opt.id)}
                      aria-pressed={isOn}
                      whileTap={reduced ? undefined : { scale: 0.99 }}
                      transition={transition(snappy, reduced)}
                      className={cn(
                        'relative rounded-lg border p-5 text-left transition-[background-color,border-color,box-shadow] duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                        isOn ? 'border-accent-500 bg-accent-50 shadow-glow-accent' : 'border-line bg-surface shadow-sm hover:border-accent-300 hover:shadow-md'
                      )}
                    >
                      {isOn && (
                        <motion.span
                          layoutId={reduced ? undefined : `conn-${pt}`}
                          transition={transition(snappy, reduced)}
                          className="grad-brand absolute inset-x-0 top-0 h-0.5 rounded-t-lg"
                        />
                      )}
                      <h3
                        className={cn(
                          'font-display text-xl font-bold tracking-tight',
                          isOn ? 'text-accent-800' : 'text-ink'
                        )}
                      >
                        {opt.name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-mute">{opt.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <Button onClick={handleSubmit} size="lg" loading={loading} className="mt-12">
        Done with setup
      </Button>
    </div>
  );
}
