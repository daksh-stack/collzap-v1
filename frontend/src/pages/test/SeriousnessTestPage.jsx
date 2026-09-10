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

/** Parse the ISO instant the backend sends. Returns NaN if unusable. */
function parseExpiry(value) {
  if (!value) return NaN;
  if (typeof value === 'number') return value < 1e11 ? value * 1000 : value;
  return new Date(value).getTime();
}

export default function SeriousnessTestPage() {
  const navigate = useNavigate();
  const { session, result, startSession, fetchCurrentSession, submitAnswer, submitTest, resetTestState, loading } = useTestStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [expiresAtMs, setExpiresAtMs] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [divider, setDivider] = useState(null); // interest name being announced
  const submittingRef = useRef(false);

  // --- session bootstrap -------------------------------------------------
  useEffect(() => {
    submittingRef.current = false;
    useTestStore.setState({ result: null });

    const init = async () => {
      try {
        let active = null;
        try {
          active = await fetchCurrentSession();
        } catch {
          active = null;
        }

        if (!active || !active.questions || active.questions.length === 0) {
          try {
            active = await startSession();
          } catch (startErr) {
            toast.error(startErr.message || 'Cannot start the paper right now');
            navigate('/onboarding');
            return;
          }
        }

        // Land on the first unanswered question.
        const firstUnanswered = active.questions.findIndex((q) => q.selectedOptionIndex === null);
        const idx = firstUnanswered === -1 ? 0 : firstUnanswered;
        setCurrentQuestionIndex(idx);
        setSelectedOption(active.questions[idx].selectedOptionIndex);

        // Timer comes from expiresAt, which the backend always sends.
        setExpiresAtMs(parseExpiry(active.expiresAt));
      } catch {
        toast.error('Could not load the paper');
        navigate('/onboarding');
      }
    };

    init();
  }, []);

  const handleTimeUp = useCallback(async () => {
    if (!session || result) return;
    try {
      await submitTest(session.sessionId);
    } catch {
      /* the paper is taken up regardless */
    }
  }, [session, result, submitTest]);

  // --- countdown, driven off the absolute expiry ------------------------
  useEffect(() => {
    if (result || expiresAtMs === null) return;

    const tick = () => {
      const remaining = isNaN(expiresAtMs)
        ? null
        : Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000));

      setTimeLeft(remaining);

      if (remaining === 0 && !submittingRef.current) {
        submittingRef.current = true;
        handleTimeUp();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAtMs, result, handleTimeUp]);

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
      await submitAnswer(session.sessionId, currentQ.questionId, selectedOption);
      questions[currentQuestionIndex].selectedOptionIndex = selectedOption;

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
        await submitTest(session.sessionId);
      }
    } catch {
      toast.error('That answer did not save');
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
                      {b.score}/{b.totalQuestions}
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

  // --- loading -----------------------------------------------------------
  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="font-mono text-[11px] uppercase tracking-widest text-mute">
          Handing out the paper…
        </p>
      </div>
    );
  }

  const questions = session.questions;
  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answered = questions.filter((q) => q.selectedOptionIndex !== null).length;
  const lowTime = timeLeft !== null && timeLeft < 300;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Invigilator's header */}
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-6" />
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-mute sm:inline">
              Assessment
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute tnum">
              {answered}/{questions.length} done
            </span>
            <span
              className={cn(
                'font-display text-xl tnum tabular-nums transition-colors',
                lowTime ? 'text-bad' : 'text-ink'
              )}
              aria-live="polite"
            >
              {formatTime(timeLeft)}
            </span>
          </div>
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
