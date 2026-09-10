import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import StepHeader from './StepHeader';
import { useTestStore } from '../../../store/useTestStore';

export default function TakeSeriousnessTestStep() {
  const navigate = useNavigate();
  const { eligibility, checkEligibility, resetTestState, loading } = useTestStore();

  useEffect(() => {
    checkEligibility().catch(console.error);
  }, []);

  // The session is started on /test, not here.
  const handleStart = () => {
    if (resetTestState) resetTestState();
    navigate('/test');
  };

  const resuming = !!eligibility?.hasInProgressSession;
  const blocked = eligibility && !eligibility.eligible && !resuming;

  return (
    <div>
      <StepHeader eyebrow="Step six" title="Sit the paper.">
        Twenty minutes, one sitting, no going back a question. It sets the level
        band you get matched inside — so people stop getting paired with someone
        three years ahead of them.
      </StepHeader>

      <div className="max-w-lg">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
          <div className="bg-surface px-5 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Time</dt>
            <dd className="mt-1 font-display text-2xl text-ink tnum">20 min</dd>
          </div>
          <div className="bg-surface px-5 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Retake after</dt>
            <dd className="mt-1 font-display text-2xl text-ink tnum">30 days</dd>
          </div>
        </dl>

        <Button
          onClick={handleStart}
          size="lg"
          className="mt-10"
          loading={loading}
          disabled={blocked}
        >
          {resuming ? 'Resume' : 'Start the paper'}
        </Button>

        {eligibility && !eligibility.eligible && (
          <p className="mt-4 text-sm text-bad">{eligibility.reason}</p>
        )}
      </div>
    </div>
  );
}
