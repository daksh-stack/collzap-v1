import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import ScoreRing from '../../components/ui/ScoreRing';
import Logo from '../../components/brand/Logo';
import { useTestStore } from '../../store/useTestStore';
import { cn } from '../../lib/utils';
import { snappy, page, useReducedMotion, transition } from '../../lib/motion';

const DIVIDER_MS = 800;

export default function SeriousnessTestPage() {
  const navigate = useNavigate();
  const { session, result, startSession, fetchCurrentSession, submitAnswer, submitTest, resetTestState, loading } = useTestStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [divider, setDivider] = useState(null); // interest name being announced
  const [startError, setStartError] = useState(null);

  const initialized = useRef(false);

  // --- session bootstrap -------------------------------------------------
  //
  // Nothing in here may navigate on failure. OnboardingGuard sends users whose
  // nextStep is TAKE_SERIOUSNESS_TEST straight back to /test, so a redirect out
  // of a failed start bounces forever — one GET + one POST per cycle, against
  // production. Failures surface as a terminal screen and stop.
  const init = useCallback(async () => {
    useTestStore.setState({ result: null });
    setStartError(null);

    try {
      let active = null;
      try {
        active = await fetchCurrentSession();
      } catch {
        active = null;
      }

      // Self-heal corrupted sessions (more than 25 questions) caused by the previous race condition bug
      if (active && active.questions && active.questions.length > 25) {
        try {
          await import('../../api/api').then(m => m.api.post('/test/reset'));
          active = null; // force restart
        } catch (e) {
          console.error('Failed to reset corrupted session', e);
        }
      }

      if (!active || !active.questions || active.questions.length === 0) {
        try {
          active = await startSession();
        } catch (startErr) {
          setStartError(startErr.message || 'Cannot start the paper right now.');
          return;
        }
      }

      // Land on the first unanswered question.
      const firstUnanswered = active.questions.findIndex((q) => q.selectedOptionIndex === null);
      const idx = firstUnanswered === -1 ? 0 : firstUnanswered;
      setCurrentQuestionIndex(idx);
      setSelectedOption(active.questions[idx].selectedOptionIndex);
    } catch {
      setStartError('Could not load the paper.');
    }
  }, [fetchCurrentSession, startSession]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    init();
  }, [init]);

  // Retry is the only way back in — one request pair per click, never automatic.
  const handleRetry = () => {
    useTestStore.getState().clearStartBlocked();
    init();
  };

  // Guard against losing work to a stray tab close.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (session && !result) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [session, result]);

  const reduced = useReducedMotion();

  const handleNext = async () => {
    if (selectedOption === null || !session) return;

    const questions = session.questions;
    const currentQ = questions[currentQuestionIndex];

    try {
      await submitAnswer(currentQ.questionId, selectedOption);

      if (currentQuestionIndex < questions.length - 1) {
        const nextIdx = currentQuestionIndex + 1;
        const nextQ = questions[nextIdx];

        const advance = () => {
          setCurrentQuestionIndex(nextIdx);
          setSelectedOption(nextQ.selectedOptionIndex);
        };

        // A new subject gets a full-bleed divider before the question shows.
        if (nextQ.interestName && nextQ.interestName !== currentQ.interestName && !reduced) {
          setDivider(nextQ.interestName);
          setTimeout(() => { advance(); setDivider(null); }, DIVIDER_MS);
        } else {
          advance();
        }
      } else {
        await submitTest();
      }
    } catch (err) {
      toast.error(err.message || 'That answer did not save');
    }
  };

  const handleContinueOnboarding = () => {
    if (resetTestState) resetTestState();
    navigate('/onboarding');
  };

  // --- result ------------------------------------------------------------
  if (result) {
    return (
      <div className="min-h-screen bg-paper px-6 py-20">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(page, reduced)}
          className="mx-auto max-w-2xl"
        >
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
            <span className="grad-brand h-1 w-6 rounded-full" />
            Paper taken up
          </p>

          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-12">
            {result.overallScore !== undefined && result.overallScore !== null && (
              <ScoreRing
                value={result.overallScore}
                label={result.overallLevel}
                size={200}
                className="shrink-0"
              />
            )}

            <div className={result.overallScore == null ? '' : 'text-center sm:text-left'}>
              <h1 className="text-grad font-display text-4xl font-extrabold leading-none tracking-tightest sm:text-5xl">
                {result.overallLevel}
              </h1>
              {/* Copy comes from the API — no invented grade language. */}
              {result.message && (
                <p className="mt-5 max-w-md text-sm leading-relaxed text-mute">{result.message}</p>
              )}
            </div>
          </div>

          {result.results?.length > 0 && (
            <dl className="mt-12 divide-y divide-line border-y border-line">
              {result.results.map((b) => (
                <div key={b.interestId} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="text-sm text-ink">{b.interestName}</dt>
                  <dd className="flex items-baseline gap-5 text-right">
                    <span className="text-sm text-mute tnum">
                      {b.earnedPoints}/{b.maxPoints}
                    </span>
                    <span className="min-w-24 font-display text-base font-bold text-accent-700">
                      {b.level}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <Button onClick={handleContinueOnboarding} size="lg" className="mt-12">
            Carry on
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- cannot start ------------------------------------------------------
  // Terminal by design. The old code redirected here, which the onboarding
  // guard immediately undid; the only way forward now is an explicit action.
  if (startError) {
    return (
      <div className="relative mesh flex min-h-screen flex-col bg-paper">
        <header className="relative z-10 border-b border-line">
          <div className="mx-auto w-full max-w-3xl px-6 py-4">
            <Logo className="h-6" />
          </div>
        </header>

        <div className="relative z-10 flex flex-1 items-center px-6 py-16">
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition(page, reduced)}
            className="mx-auto w-full max-w-lg"
          >
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-wait">
              <span className="h-1 w-6 rounded-full bg-wait" />
              Not ready
            </p>

            <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tightest text-ink sm:text-4xl">
              The paper isn&rsquo;t set yet.
            </h1>

            {/* The API names the interest; don't paraphrase it. */}
            <p className="mt-4 text-sm leading-relaxed text-mute">{startError}</p>
            <p className="mt-3 text-sm leading-relaxed text-mute">
              Nothing is wrong on your side and nothing you entered was lost. Try
              again in a bit, or go back and look at the rest of your setup.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={handleRetry} loading={loading} variant="gradient" size="lg">
                Try again
              </Button>
              <Button onClick={() => navigate('/onboarding')} variant="secondary" size="lg">
                Back to setup
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- loading -----------------------------------------------------------
  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <header className="border-b border-line">
          <div className="mx-auto w-full max-w-3xl px-6 py-4">
            <Logo className="h-6" />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-mute">
            Handing out the paper…
          </p>
        </div>
      </div>
    );
  }

  const questions = session.questions;
  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answered = questions.filter((q) => q.selectedOptionIndex !== null).length;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-6" />
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-mute sm:inline">
              Assessment
            </span>
          </div>

          <span className="font-mono text-[10px] uppercase tracking-widest text-mute tnum">
            {answered}/{questions.length} done
          </span>
        </div>

        {/* progress rule */}
        <div className="h-0.5 w-full bg-line">
          <motion.div
            className="grad-brand h-0.5 rounded-full"
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={transition(snappy, reduced)}
          />
        </div>
      </header>

      <main className="flex flex-1 items-center px-6 py-14">
        <div className="mx-auto w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={transition(page, reduced)}
            >
              <div className="mb-8 flex items-baseline gap-4">
                <span className="font-display text-6xl font-extrabold leading-none tracking-tightest text-line tnum">
                  {String(currentQuestionIndex + 1).padStart(2, '0')}
                </span>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent-700">
                  <span className="grad-brand h-1 w-1 rounded-full" />
                  {currentQ.interestName}
                </span>
              </div>

              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2.1rem]">
                {currentQ.questionText}
              </h1>

              <div className="mt-10 divide-y divide-line border-y border-line">
                {currentQ.options.map((option, index) => {
                  const isOn = selectedOption === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(index)}
                      aria-pressed={isOn}
                      className={cn(
                        'group flex w-full items-start gap-4 py-4 text-left transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm',
                        isOn ? 'text-ink' : 'text-mute hover:text-ink'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold transition-colors',
                          isOn
                            ? 'grad-brand-cta border-transparent text-white'
                            : 'border-line text-mute group-hover:border-accent-400 group-hover:text-accent-700'
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={cn('text-[0.95rem] leading-relaxed', isOn && 'font-medium')}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-between gap-6">
                <p className="text-xs text-mute">Once you move on, that one is set.</p>
                <Button
                  onClick={handleNext}
                  disabled={selectedOption === null || loading}
                  loading={loading}
                  size="lg"
                >
                  {isLastQuestion ? 'Hand it in' : 'Next'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Full-bleed subject divider between interests */}
      <AnimatePresence>
        {divider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-paper"
          >
            <motion.div
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="px-8 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-mute">Next section</p>
              <p className="text-grad mt-4 font-display text-5xl font-extrabold tracking-tightest">
                {divider}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
