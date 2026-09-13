import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Check, MessageSquarePlus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Tabs from '../../../components/ui/Tabs';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import TextArea from '../../../components/ui/TextArea';
import StepHeader from './StepHeader';
import { useInterestStore } from '../../../store/useInterestStore';
import { cn } from '../../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../../lib/motion';

export default function SelectInterestsStep() {
  const {
    catalog, fetchCatalog, projectTypes, fetchProjectTypes,
    myInterests, fetchMyInterests, selectInterests, submitFeedback, loading,
  } = useInterestStore();

  const [activeTab, setActiveTab] = useState('');
  const [selections, setSelections] = useState({}); // { LONG_TERM: [{interestId, subTag}], SHORT_TERM: [] }
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [myInterestsLoaded, setMyInterestsLoaded] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchCatalog().catch(console.error);
    fetchProjectTypes().catch(console.error);
    fetchMyInterests().catch(console.error).finally(() => setMyInterestsLoaded(true));
  }, []);

  // Seeded from whatever is already saved — not always blank. This step can be
  // re-entered after onboarding (e.g. adding Long-Term later, or via the back
  // button) with one project type already fully set up; starting that tab
  // blank would let an accidental visit silently wipe a working selection.
  useEffect(() => {
    if (projectTypes && projectTypes.size > 0 && myInterestsLoaded && !activeTab) {
      setActiveTab(Array.from(projectTypes)[0]);
      const initial = {};
      projectTypes.forEach((pt) => {
        initial[pt] = myInterests
          .filter((i) => i.projectType === pt)
          .map((i) => ({ interestId: i.interestId, subTag: i.subTag }));
      });
      setSelections(initial);
    }
  }, [projectTypes, myInterestsLoaded]);

  if (!catalog || !activeTab) return null;

  // InterestCatalogResponse.longTerm / .shortTerm are already the arrays.
  const currentInterests = activeTab === 'LONG_TERM' ? catalog.longTerm : catalog.shortTerm;
  const maxSelections = activeTab === 'LONG_TERM' ? catalog.maxLongTermSelections : catalog.maxShortTermSelections;
  const currentSelections = selections[activeTab] || [];

  const tabs = Array.from(projectTypes).map((pt) => ({
    key: pt,
    label: pt === 'LONG_TERM' ? 'Long haul' : 'Short burst',
  }));

  const handleToggleInterest = (interest) => {
    const isSelected = currentSelections.some((s) => s.interestId === interest.id);
    let next = [...currentSelections];

    if (isSelected) {
      next = next.filter((s) => s.interestId !== interest.id);
    } else {
      if (next.length >= maxSelections) {
        toast.error(`${maxSelections} is the cap here. Drop one first.`);
        return;
      }
      next.push({ interestId: interest.id, subTag: null });
    }

    setSelections((prev) => ({ ...prev, [activeTab]: next }));
  };

  const handleSubTagChange = (interestId, subTag) => {
    const next = currentSelections.map((s) =>
      s.interestId === interestId ? { ...s, subTag: subTag || null } : s
    );
    setSelections((prev) => ({ ...prev, [activeTab]: next }));
  };

  const handleSubmit = async () => {
    try {
      await selectInterests(activeTab, currentSelections);

      const unsubmitted = Array.from(projectTypes).filter(
        (pt) => pt !== activeTab && (selections[pt] || []).length === 0
      );

      if (unsubmitted.length > 0) {
        setActiveTab(unsubmitted[0]);
        toast.success('Saved. Now the other one.');
      }
    } catch (error) {
      toast.error(error.message || 'Could not save those');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    try {
      await submitFeedback(activeTab, feedbackText);
      toast.success('Noted. We read these.');
      setFeedbackOpen(false);
      setFeedbackText('');
    } catch {
      toast.error('Could not send that');
    }
  };

  const isLastTab = tabs.length <= 1 || tabs[tabs.length - 1].key === activeTab;

  return (
    <div>
      <StepHeader eyebrow="Step five" title="What are you here for?">
        Be specific. &ldquo;Machine learning&rdquo; matches you with three hundred people;
        the sub-tag is what gets you the right one.
      </StepHeader>

      {tabs.length > 1 && (
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-8" />
      )}

      <div className="mb-5 flex items-baseline justify-between border-b border-line pb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
          Pick up to {maxSelections}
        </span>
        <span className="font-display text-lg text-ink tnum">
          {currentSelections.length}<span className="text-mute">/{maxSelections}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {currentInterests?.map((interest) => {
          const selection = currentSelections.find((s) => s.interestId === interest.id);
          const isSelected = !!selection;

          return (
            <div
              key={interest.id}
              className={cn(
                'rounded-lg border transition-[background-color,border-color,box-shadow] duration-200',
                isSelected ? 'border-accent-500 bg-accent-50 shadow-glow-accent' : 'border-line bg-surface shadow-sm hover:border-accent-300 hover:shadow-md'
              )}
            >
              <button
                type="button"
                onClick={() => handleToggleInterest(interest)}
                aria-pressed={isSelected}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <span className={cn('text-sm font-medium', isSelected ? 'text-accent-800' : 'text-ink')}>
                  {interest.name}
                </span>
                <span
                  className={cn(
                    'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors',
                    isSelected ? 'grad-brand-cta border-transparent' : 'border-line'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                    transition={transition(snappy, reduced)}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3.5">
                      <Input
                        placeholder="Narrow it down — e.g. diffusion models"
                        className="h-9 text-xs"
                        value={selection.subTag || ''}
                        onChange={(e) => handleSubTagChange(interest.id, e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setFeedbackOpen(true)}
        className="mt-6 flex w-full items-center gap-3 rounded-lg border border-dashed border-line bg-surface-2 px-4 py-3.5 text-left transition-colors hover:border-accent-400 hover:bg-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-accent-700">
          <MessageSquarePlus className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-medium text-ink">Not seeing yours here?</span>
          <span className="block text-xs text-mute">Suggest it — we add topics when enough people ask.</span>
        </span>
      </button>

      <div className="mt-10 flex justify-end border-t border-line pt-6">
        <Button onClick={handleSubmit} size="lg" loading={loading} disabled={currentSelections.length === 0}>
          {isLastTab ? 'Continue' : 'Next category'}
        </Button>
      </div>

      <Modal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Suggest an interest">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-mute">
            Tell us what you are working on. We add topics when enough people ask.
          </p>
          <TextArea
            placeholder="I'm looking for people doing…"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} loading={loading}>Send</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
