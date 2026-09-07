import { useState } from 'react';
import { Send, CheckCircle2, MessageSquarePlus, Sparkles, Lightbulb } from 'lucide-react';
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
        <div className="flex items-center gap-2 text-accent-600 font-mono text-[11px] uppercase tracking-widest">
          <MessageSquarePlus className="h-4 w-4" />
          <span>Student Voices</span>
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tightest text-ink">
          Feedback & Suggestions
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          CollZap is tailored to your campus. If a domain, skill, or tool is missing from the catalog,
          or if you have ideas to improve collaboration, let the team know.
        </p>
      </header>

      {submitted ? (
        <Card className="border-accent-500/30 bg-[#FBF8F2] p-8 text-center sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
            Note Received
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mute max-w-md mx-auto">
            Your suggestion was delivered to the campus administrators. We review every submission
            to expand interest options and refine matchmaking.
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
            <label className="block font-mono text-[10px] uppercase tracking-widest text-mute">
              1. Project Track
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
                      'flex flex-col items-start rounded-lg border p-4 text-left transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                      selected
                        ? 'border-accent-500 bg-accent-500/[0.04] shadow-sm'
                        : 'border-line bg-[#FBF8F2] hover:border-line/80 hover:bg-ink/[0.02]'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={cn('text-sm font-semibold', selected ? 'text-accent-700' : 'text-ink')}>
                        {t.name}
                      </span>
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-accent-500" />
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
            <label className="block font-mono text-[10px] uppercase tracking-widest text-mute">
              2. What kind of suggestion?
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
                      'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                      selected
                        ? 'bg-ink text-[#FBF8F2]'
                        : 'border border-line bg-[#FBF8F2] text-mute hover:text-ink hover:bg-ink/[0.03]'
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
              <label htmlFor="suggestion-input" className="font-mono text-[10px] uppercase tracking-widest text-mute">
                3. Your note or topic
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
      <section className="rounded-lg border border-line bg-[#FBF8F2] p-5">
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
