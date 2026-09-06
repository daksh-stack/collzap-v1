import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Button from '../../../components/ui/Button';
import StepHeader from './StepHeader';
import { useModerationStore } from '../../../store/useModerationStore';
import { useReducedMotion } from '../../../lib/motion';

/** A real clock face — hands that actually move, not a spinner. */
function Clock({ reduced }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // One tick a second is enough; under reduced motion we still show the
    // correct time, we just do not animate the sweep.
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#DDD4C8" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const inner = i % 3 === 0 ? 36 : 40;
        return (
          <line
            key={i}
            x1={50 + inner * Math.sin(a)}
            y1={50 - inner * Math.cos(a)}
            x2={50 + 43 * Math.sin(a)}
            y2={50 - 43 * Math.cos(a)}
            stroke="#6B645C"
            strokeWidth={i % 3 === 0 ? 2 : 1}
            opacity={i % 3 === 0 ? 0.75 : 0.35}
          />
        );
      })}
      {/* hour */}
      <line
        x1="50" y1="50"
        x2={50 + 24 * Math.sin((h * 30 * Math.PI) / 180)}
        y2={50 - 24 * Math.cos((h * 30 * Math.PI) / 180)}
        stroke="#1A1714" strokeWidth="3" strokeLinecap="round"
      />
      {/* minute */}
      <line
        x1="50" y1="50"
        x2={50 + 34 * Math.sin((m * 6 * Math.PI) / 180)}
        y2={50 - 34 * Math.cos((m * 6 * Math.PI) / 180)}
        stroke="#1A1714" strokeWidth="2" strokeLinecap="round"
      />
      {/* second — the only moving accent */}
      <line
        x1="50" y1="50"
        x2={50 + 38 * Math.sin((s * 6 * Math.PI) / 180)}
        y2={50 - 38 * Math.cos((s * 6 * Math.PI) / 180)}
        stroke="#C45C26" strokeWidth="1"
        strokeLinecap="round"
        style={reduced ? undefined : { transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)' }}
      />
      <circle cx="50" cy="50" r="2.5" fill="#1A1714" />
    </svg>
  );
}

export default function AwaitingVerificationStep() {
  const navigate = useNavigate();
  const { verificationStatus, fetchVerificationStatus } = useModerationStore();
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchVerificationStatus().catch(console.error);
  }, []);

  const latestDoc = verificationStatus?.documents?.[0];

  const formatDocType = (type) => {
    if (!type) return '—';
    if (type === 'FEE_SLIP') return 'Fee slip';
    if (type === 'ID_CARD') return 'ID card';
    return type.replace(/_/g, ' ').toLowerCase();
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="mb-10">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Clock reduced={reduced} />
        </motion.div>
      </div>

      <StepHeader eyebrow="With a human" title="Setup is done.">
        Matching stays locked until a human checks your ID. Nothing else is
        pending on your side.
      </StepHeader>

      <div className="max-w-lg">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
          <div className="bg-[#FBF8F2] px-5 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">Sent</dt>
            <dd className="mt-1 text-sm text-ink">{formatDocType(latestDoc?.documentType)}</dd>
          </div>
          <div className="bg-[#FBF8F2] px-5 py-4">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-mute">At</dt>
            <dd className="mt-1 text-sm text-ink tnum">{formatDate(latestDoc?.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button onClick={() => navigate('/')}>Look around</Button>
          <Button variant="secondary" onClick={() => navigate('/profile')}>
            Edit profile
          </Button>
        </div>
      </div>
    </div>
  );
}
