import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { useInterestStore } from '../../store/useInterestStore';
import { useMatchStore } from '../../store/useMatchStore';

const CONNECTION_OPTIONS = [
  { id: 'ONE_ON_ONE', name: 'One on one', desc: 'One person, matched close.' },
  { id: 'SHORT_GROUP', name: 'Small group', desc: 'Two to four.' },
];

/**
 * The repeatable "pick a short-term interest" flow, reachable any time from
 * the home page — not the onboarding wizard. The format (1-on-1 / small
 * group) is always shown and always changeable, pre-filled with whatever is
 * currently set. Confirming never touches the old short-term match/chat, if
 * there is one — it just replaces which interest (and format) is active and
 * queues matching for the new one.
 */
export default function ShortTermInterestModal({ open, onClose }) {
  const {
    catalog, fetchCatalog, myInterests, connectionTypes, fetchConnectionTypes, setShortTermInterest, loading,
  } = useInterestStore();
  const { findMatches } = useMatchStore();

  const [interestId, setInterestId] = useState('');
  const [subTag, setSubTag] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const current = myInterests.find((i) => i.projectType === 'SHORT_TERM');

  useEffect(() => {
    if (open) {
      fetchCatalog().catch(console.error);
      fetchConnectionTypes().catch(console.error);
      setInterestId(current?.interestId || '');
      setSubTag(current?.subTag || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Once connectionTypes loads (a moment after the modal opens), pre-select
  // whatever's already set for Short-Term rather than leaving it blank.
  useEffect(() => {
    if (open) {
      const existing = connectionTypes.find((c) => c.projectType === 'SHORT_TERM');
      setConnectionType(existing?.connectionType || '');
    }
  }, [open, connectionTypes]);

  const options = catalog?.shortTerm || [];

  const handleConfirm = async () => {
    if (!interestId) {
      toast.error('Pick an interest');
      return;
    }
    if (!connectionType) {
      toast.error('Pick a format too');
      return;
    }

    setSubmitting(true);
    try {
      await setShortTermInterest(interestId, subTag, connectionType);
      toast.success("You're queued for that");
      findMatches().catch(console.error);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Could not save that');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Short-term interest" size="md">
      <div className="space-y-5">
        {current && (
          <p className="text-xs text-mute">
            Currently matching on <span className="text-ink">{current.interestName}</span>. Picking a
            new one below won't touch your existing chat for it.
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink">Interest</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((interest) => {
              const isSelected = interestId === interest.id;
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => setInterestId(interest.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                    isSelected
                      ? 'border-accent-500 bg-accent-50 text-accent-800'
                      : 'border-line bg-surface text-ink hover:border-accent-300'
                  )}
                >
                  {interest.name}
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Narrow it down (optional)"
          placeholder="e.g. a specific hackathon track"
          value={subTag}
          onChange={(e) => setSubTag(e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink">Format</label>
          <div className="grid grid-cols-2 gap-2">
            {CONNECTION_OPTIONS.map((opt) => {
              const isOn = connectionType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setConnectionType(opt.id)}
                  aria-pressed={isOn}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                    isOn ? 'border-accent-500 bg-accent-50' : 'border-line bg-surface hover:border-accent-300'
                  )}
                >
                  <p className={cn('text-sm font-semibold', isOn ? 'text-accent-800' : 'text-ink')}>{opt.name}</p>
                  <p className="mt-0.5 text-xs text-mute">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} loading={submitting || loading}>
            {current ? 'Switch' : 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
