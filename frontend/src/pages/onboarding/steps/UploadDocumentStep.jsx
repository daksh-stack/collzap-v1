import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import FileUpload from '../../../components/ui/FileUpload';
import OtpDigitGrid from '../../../components/auth/OtpDigitGrid';
import StepHeader from './StepHeader';
import { useModerationStore } from '../../../store/useModerationStore';
import { useCollegeStore } from '../../../store/useCollegeStore';
import { useUserStore } from '../../../store/useUserStore';
import { cn } from '../../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../../lib/motion';

const TYPES = [
  { id: 'FEE_SLIP', label: 'Fee slip', hint: 'This term or last' },
  { id: 'ID_CARD', label: 'ID card', hint: 'Name and year visible' },
];

const METHODS = [
  { id: 'DOCUMENT', label: 'Upload a document', hint: 'Admin reviews it, usually within a few hours' },
  { id: 'COLLEGE_EMAIL', label: 'Verify with college email', hint: 'Instant — no waiting' },
];

export default function UploadDocumentStep() {
  const [method, setMethod] = useState('DOCUMENT');
  const reduced = useReducedMotion();

  return (
    <div>
      <StepHeader eyebrow="Step two" title="Prove you actually go there.">
        Pick whichever is easier — a document for an admin to check, or your college email for instant verification.
      </StepHeader>

      <div className="mb-8 grid max-w-lg grid-cols-2 gap-3">
        {METHODS.map((m) => {
          const selected = method === m.id;
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              whileTap={reduced ? undefined : { scale: 0.985 }}
              transition={transition(snappy, reduced)}
              aria-pressed={selected}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                selected ? 'border-accent-500 bg-accent-50' : 'border-line bg-[#FBF8F2] hover:border-ink/25'
              )}
            >
              <span className={cn('block font-display text-base font-semibold tracking-tight', selected ? 'text-accent-800' : 'text-ink')}>
                {m.label}
              </span>
              <span className="mt-0.5 block text-xs text-mute">{m.hint}</span>
            </motion.button>
          );
        })}
      </div>

      {method === 'DOCUMENT' ? <DocumentPath /> : <CollegeEmailPath />}
    </div>
  );
}

function DocumentPath() {
  const [documentType, setDocumentType] = useState('FEE_SLIP');
  const [documentUrl, setDocumentUrl] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const reduced = useReducedMotion();

  const { uploadDocument, loading } = useModerationStore();
  const { colleges, fetchColleges } = useCollegeStore();

  useEffect(() => {
    fetchColleges().catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collegeId) {
      toast.error('Select your college');
      return;
    }
    if (!documentUrl) {
      toast.error('Upload a document first');
      return;
    }

    try {
      await uploadDocument(documentType, documentUrl, collegeId);
      toast.success('Sent for review');
      useUserStore.getState().fetchOnboarding();
    } catch (err) {
      toast.error(err.message || 'Could not submit that');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-8">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Your college</label>
        <Select value={collegeId} onChange={(e) => setCollegeId(e.target.value)}>
          <option value="" disabled>Select your college</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-3 font-mono text-[10px] uppercase tracking-widest text-mute">
          What are you sending
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((t) => {
            const selected = documentType === t.id;
            return (
              <motion.button
                key={t.id}
                type="button"
                onClick={() => setDocumentType(t.id)}
                whileTap={reduced ? undefined : { scale: 0.985 }}
                transition={transition(snappy, reduced)}
                aria-pressed={selected}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                  selected
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-line bg-[#FBF8F2] hover:border-ink/25'
                )}
              >
                <span className={cn(
                  'block font-display text-lg font-semibold tracking-tight',
                  selected ? 'text-accent-800' : 'text-ink'
                )}>
                  {t.label}
                </span>
                <span className="mt-0.5 block text-xs text-mute">{t.hint}</span>
              </motion.button>
            );
          })}
        </div>
      </fieldset>

      <FileUpload
        category="DOCUMENT"
        label="Upload your document"
        onUploadComplete={(url) => setDocumentUrl(url)}
      />

      <Button type="submit" size="lg" loading={loading} disabled={!documentUrl || !collegeId}>
        Send for review
      </Button>
    </form>
  );
}

function CollegeEmailPath() {
  const [email, setEmail] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [resetSignal, setResetSignal] = useState(0);

  const { requestCollegeEmailOtp, confirmCollegeEmailOtp, loading } = useModerationStore();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your college email');
      return;
    }
    try {
      const response = await requestCollegeEmailOtp(email);
      setCollegeName(response.collegeName);
      setSent(true);
      toast.success('Code sent');
    } catch (err) {
      toast.error(err.message || 'Could not send the code');
    }
  };

  const handleComplete = async (value) => {
    try {
      await confirmCollegeEmailOtp(email, value);
      toast.success("You're verified");
      useUserStore.getState().fetchOnboarding();
    } catch (err) {
      toast.error(err.message || 'That code did not work');
      setCode('');
      setResetSignal((n) => n + 1);
    }
  };

  const handleConfirm = (e) => {
    e?.preventDefault();
    if (code.length !== 6) {
      toast.error('Enter all six digits');
      return;
    }
    handleComplete(code);
  };

  if (!sent) {
    return (
      <form onSubmit={handleSendCode} className="max-w-lg space-y-5">
        <Input
          label="College email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
        <Button type="submit" size="lg" loading={loading}>
          Send code
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="max-w-lg space-y-6">
      <p className="text-sm text-mute">
        Sent to <span className="text-ink">{email}</span>
        {collegeName && <> · <span className="text-ink">{collegeName}</span></>}
      </p>
      <OtpDigitGrid
        onChange={setCode}
        onComplete={handleComplete}
        disabled={loading}
        resetSignal={resetSignal}
      />
      <div className="flex items-center gap-5">
        <Button type="submit" size="lg" loading={loading} disabled={code.length !== 6}>
          Confirm
        </Button>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-sm text-mute hover:text-ink transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          Use a different email
        </button>
      </div>
    </form>
  );
}
