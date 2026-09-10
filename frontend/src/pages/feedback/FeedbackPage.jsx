import { useState } from 'react';
import { Send, CheckCircle2, Sparkles, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import TextArea from '../../components/ui/TextArea';
import { useInterestStore } from '../../store/useInterestStore';
import { cn } from '../../lib/utils';

const TRACKS = [
  {
    id: 'LONG_TERM',
    name: 'Long-term projects',
    desc: 'Semester builds, startups, research, or capstones.',
  },
  {
    id: 'SHORT_TERM',
    name: 'Short-term gigs',
    desc: 'Hackathons, study buddies, or quick sprints.',
  },
];

const CATEGORIES = [
  { id: 'interest', label: 'Missing Interest', hint: 'e.g. Flutter, Robotics, Quantum Computing, UI/UX' },
  { id: 'feature', label: 'Feature Idea', hint: 'e.g. Calendar sync, portfolio links, Discord integration' },
  { id: 'feedback', label: 'General Feedback', hint: 'e.g. What you love or what feels clunky' },
];

export default function FeedbackPage() {
  const { submitFeedback, loading } = useInterestStore();

  const [track, setTrack] = useState('LONG_TERM');
  const [category, setCategory] = useState('interest');
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedText, setLastSubmittedText] = useState('');

  const activeCategory = CATEGORIES.find((c) => c.id === category);
  const charsLeft = 200 - suggestion.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = suggestion.trim();
    if (!trimmed) {
      toast.error('Please write your suggestion first');
      return;
    }

    // Format text with category prefix if it is a feature or general feedback
    let payloadText = trimmed;
    if (category === 'feature' && !trimmed.toLowerCase().startsWith('[feature]')) {
      payloadText = `[Feature] ${trimmed}`;
    } else if (category === 'feedback' && !trimmed.toLowerCase().startsWith('[feedback]')) {
      payloadText = `[Feedback] ${trimmed}`;
    }

    // Ensure it doesn't exceed 200 chars after prefix
    if (payloadText.length > 200) {
      payloadText = payloadText.slice(0, 200);
    }

    try {
      await submitFeedback(track, payloadText);
      setLastSubmittedText(payloadText);
      setSubmitted(true);
      setSuggestion('');
      toast.success('Thanks for the note — we will take a look!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not submit feedback');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSuggestion('');
  };

  return (
    <div className="max-w-2xl space-y-10">
      <header>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
          <span className="grad-brand h-1 w-6 rounded-full" />
          Ideas
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink">
          Something missing?
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
          If the interest you care about is not in the catalog, say so. Every note
          goes to the people who decide what gets added.
        </p>
      </header>

      {submitted ? (
        <Card className="border-accent-500/30 bg-surface p-8 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">
            Noted.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mute max-w-md mx-auto">
            It went straight to the people who decide what gets added to the catalog.
          </p>

          {lastSubmittedText && (
            <div className="mt-6 mx-auto max-w-md rounded border border-line bg-paper/60 p-4 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mute block mb-1">
                Your note
              </span>
              <p className="text-xs text-ink whitespace-pre-wrap">{lastSubmittedText}</p>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={handleReset} variant="secondary">
              Send another note
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Track Selection */}
          <section className="space-y-3">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute"><span className="grad-brand h-1 w-5 rounded-full" />
              Project track
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TRACKS.map((t) => {
                const selected = track === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={cn(
                      'flex flex-col items-start rounded-lg border p-4 text-left',
                      'transition-[background-color,border-color,box-shadow] duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                      selected
                        ? 'border-accent-500 bg-accent-50 shadow-glow-accent'
                        : 'border-line bg-surface shadow-sm hover:border-accent-300 hover:shadow-md'
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className={cn('text-sm font-semibold', selected ? 'text-accent-700' : 'text-ink')}>
                        {t.name}
                      </span>
                      {selected && (
                        <span className="grad-brand h-2 w-2 rounded-full" />
                      )}
                    </div>
                    <span className="mt-1 text-xs leading-relaxed text-mute">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Category Pill Selection */}
          <section className="space-y-3">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute"><span className="grad-brand h-1 w-5 rounded-full" />
              What kind
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const selected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-xs font-semibold',
                      'transition-[background-color,border-color,box-shadow] duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                      selected
                        ? 'grad-brand-cta border-transparent text-white shadow-sm'
                        : 'border-line bg-surface text-mute hover:border-accent-300 hover:text-ink'
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            {activeCategory && (
              <p className="text-xs text-mute/80 italic">
                {activeCategory.hint}
              </p>
            )}
          </section>

          {/* Step 3: Text Input */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="suggestion-input" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
                <span className="grad-brand h-1 w-5 rounded-full" />
                Your note
              </label>
              <span className={cn(
                'font-mono text-[11px] tnum',
                charsLeft < 20 ? 'text-bad font-semibold' : 'text-mute'
              )}>
                {charsLeft} left
              </span>
            </div>
            <TextArea
              id="suggestion-input"
              rows={4}
              maxLength={200}
              placeholder={
                category === 'interest'
                  ? 'Which skill, topic, or field would you like to see added? (e.g. Next.js, Rust, Competitive Math)'
                  : category === 'feature'
                  ? 'What feature would help you find or work with peers faster?'
                  : 'Tell us how CollZap can be better on your campus...'
              }
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              required
            />
          </section>

          <div className="flex items-center justify-between pt-2 border-t border-line">
            <div className="flex items-center gap-1.5 text-xs text-mute">
              <Sparkles className="h-3.5 w-3.5 text-accent-600" />
              <span>Reviewed directly by campus admins</span>
            </div>
            <Button
              type="submit"
              variant="gradient"
              loading={loading}
              disabled={!suggestion.trim()}
              icon={<Send className="h-4 w-4" />}
            >
              Send feedback
            </Button>
          </div>
        </form>
      )}

      {/* Helpful info callout */}
      <section className="rounded-lg border border-line bg-surface p-5">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-ink">How suggestions work</p>
            <p className="text-xs leading-relaxed text-mute">
              When multiple students request a new interest (like a specialized AI framework, game engine, or club project),
              administrators approve and publish it to the campus interest directory.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
