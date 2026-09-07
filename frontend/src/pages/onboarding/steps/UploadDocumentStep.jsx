import { useState } from 'react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import FileUpload from '../../../components/ui/FileUpload';
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
  const reduced = useReducedMotion();

  const { uploadDocument, loading } = useModerationStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentUrl) {
      toast.error('Upload a document first');
      return;
    }

    try {
      await uploadDocument(documentType, documentUrl);
      toast.success('Sent for review');
    } catch (err) {
      toast.error(err.message || 'Could not submit that');
    }
  };

  return (
    <div>
      <StepHeader eyebrow="Step one" title="Prove you actually go there.">
        Upload a photo of your fee slip or ID card. Make sure the name and year
        are clearly visible.
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

        <Button type="submit" size="lg" loading={loading} disabled={!documentUrl}>
          Send for review
        </Button>
      </form>
    </div>
  );
}
