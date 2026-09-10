import { useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import StepHeader from './StepHeader';
import { useModerationStore } from '../../../store/useModerationStore';
import { cn } from '../../../lib/utils';
import { snappy, useReducedMotion, transition } from '../../../lib/motion';

const TYPES = [
  { id: 'FEE_SLIP', label: 'Fee slip', hint: 'This term or last' },
  { id: 'ID_CARD', label: 'ID card', hint: 'Name and year visible' },
];

export default function UploadDocumentStep() {
  const [documentType, setDocumentType] = useState('FEE_SLIP');
  const [documentUrl, setDocumentUrl] = useState('');
  const [error, setError] = useState('');
  const reduced = useReducedMotion();

  const { uploadDocument, loading } = useModerationStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentUrl.trim()) {
      setError('Paste a link first');
      return;
    }
    setError('');

    try {
      await uploadDocument(documentType, documentUrl.trim());
      toast.success('Sent for review');
    } catch (err) {
      toast.error(err.message || 'Could not submit that');
    }
  };

  return (
    <div>
      <StepHeader eyebrow="Step one" title="Prove you actually go there.">
        Paste the Drive or campus-portal link to your fee slip or ID card. Make sure
        the link opens for anyone — a locked file gets rejected.
      </StepHeader>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-8">
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
                    'rounded-lg border p-4 text-left transition-[background-color,border-color,box-shadow] duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
                    selected
                      ? 'border-accent-500 bg-accent-50 shadow-glow-accent'
                      : 'border-line bg-surface shadow-sm hover:border-accent-300 hover:shadow-md'
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

        <Input
          label="Link to the document"
          type="url"
          placeholder="https://drive.google.com/…"
          value={documentUrl}
          onChange={(e) => { setDocumentUrl(e.target.value); if (error) setError(''); }}
          disabled={loading}
          error={error}
        />

        <Button type="submit" size="lg" loading={loading}>
          Send for review
        </Button>
      </form>
    </div>
  );
}
