import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import EmptyChair from '../../components/EmptyChair';
import ConnectionField from '../../components/brand/ConnectionField';
import { LogoMark } from '../../components/brand/Logo';
import { useMatchStore } from '../../store/useMatchStore';
import { useUserStore } from '../../store/useUserStore';
import { lift, snappy, page, useReducedMotion, transition } from '../../lib/motion';

// Long enough that the matcher's own latency doesn't make this flash.
const SEARCH_MIN_MS = 1400;

const formatWaiting = (seconds) => {
  if (seconds == null) return null;
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const OUTCOME_COPY = {
  MATCHED: { variant: 'success', label: 'Matched' },
  QUEUED: { variant: 'warning', label: 'In queue' },
  ALREADY_MATCHED: { variant: 'secondary', label: 'Already in' },
};

/**
 * The matcher running, as the brand's own visual. Same ConnectionField the
 * auth screen uses, so this reads as one product rather than a spinner.
 */
function SearchingOverlay({ open }) {
  const reduced = useReducedMotion();

  // Portalled to body: AppShell's page wrapper is a motion.div, and a transform
  // on an ancestor would scope `position: fixed` to it instead of the viewport.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.28 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#08101F]"
          role="status"
          aria-live="polite"
        >
          <div className="absolute inset-0">
            <ConnectionField />
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(90% 70% at 50% 50%, transparent 25%, rgba(8,16,31,0.8) 100%)',
            }}
          />

          <div className="relative flex flex-col items-center px-8 text-center">
            <motion.div
              animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <LogoMark className="h-14" />
            </motion.div>

            <p className="mt-8 font-display text-2xl font-bold tracking-tight text-[#E8F0FE]">
              Finding your people…
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#A8BDD8]">
              Matching on your interests, your level band and your campus.
            </p>

            <div className="mt-8 flex items-center gap-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="grad-brand h-1.5 w-1.5 rounded-full"
                  animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function GroupCard({ group, onClick }) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      onClick={onClick}
      whileHover={lift(reduced)}
      whileTap={reduced ? undefined : { scale: 0.995 }}
      transition={transition(snappy, reduced)}
      className="group relative w-full overflow-hidden rounded-lg border border-line bg-surface p-5 text-left shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-accent-300 hover:shadow-glow-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <span className="grad-brand absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
          {group.connectionType}
        </span>
        <Badge variant="secondary">{group.levelBand}</Badge>
      </div>

      <h3 className="mt-4 truncate font-display text-xl font-bold tracking-tight text-ink" title={group.interestName}>
        {group.interestName}
      </h3>

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-xs text-mute tnum">
          {group.memberCount} of {group.maxMembers} seats
        </span>
        <span className="text-xs text-accent-700 opacity-0 transition-opacity group-hover:opacity-100">
          Open →
        </span>
      </div>
    </motion.button>
  );
}

export default function MatchesPage() {
  const navigate = useNavigate();
  const { circle, fetchCircle, findMatches, loading } = useMatchStore();
  const { profile, fetchMe } = useUserStore();
  const [activeTab, setActiveTab] = useState('CONNECTIONS');
  const [matchResults, setMatchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchCircle().catch(console.error);
    if (!profile) fetchMe().catch(console.error);
  }, []);

  // The overlay is dismissed on a timer, which can outlive the page.
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const isVerified = profile?.verificationStatus === 'APPROVED';
  const connections = circle?.connections || [];
  const waiting = circle?.waiting || [];

  const handleFindMatches = async () => {
    if (!isVerified) {
      toast.error('Matching unlocks once someone checks your ID.');
      return;
    }
    setSearching(true);
    const startedAt = Date.now();
    let onDone = () => {};

    try {
      const response = await findMatches();
      const results = response.results || [];
      if (results.length > 0) {
        fetchCircle().catch(console.error);
        onDone = () => setMatchResults(results);
      } else {
        onDone = () => {
          setMatchResults(results);
          toast.error('No active interests to match on.');
        };
      }
    } catch (error) {
      onDone = () => toast.error(error.message || 'The matcher did not run');
    } finally {
      // Hold the overlay a beat so a fast matcher doesn't just blink.
      const wait = reduced ? 0 : Math.max(0, SEARCH_MIN_MS - (Date.now() - startedAt));
      searchTimer.current = setTimeout(() => {
        setSearching(false);
        onDone();
      }, wait);
    }
  };

  const tabs = [
    { key: 'CONNECTIONS', label: `Connections (${connections.length})` },
    { key: 'WAITING', label: `Waiting (${waiting.length})` },
  ];

  const shown = activeTab === 'CONNECTIONS' ? connections : waiting;

  return (
    <div className="space-y-12">
      <SearchingOverlay open={searching} />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink">
            Matches
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
            The matcher looks at your interests, your level band and your campus.
            Run it whenever — it will not double-match you.
          </p>
        </div>
        <Button
          onClick={handleFindMatches}
          loading={loading || searching}
          variant="gradient"
          icon={<Search className="h-4 w-4" />}
          size="lg"
          className="shrink-0"
        >
          Find peers
        </Button>
      </header>

      {!isVerified && profile && (
        <p className="border-l-2 border-wait pl-4 text-sm text-mute">
          Your ID is still with a reviewer. Matching stays locked until then.{' '}
          <button
            onClick={() => navigate('/onboarding')}
            className="text-accent-700 underline decoration-accent-300 underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Status
          </button>
        </p>
      )}

      {/* Run output */}
      <AnimatePresence>
        {matchResults && matchResults.length > 0 && (
          <motion.section
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={transition(page, reduced)}
          >
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
              Last run
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {matchResults.map((result, idx) => {
                const meta = OUTCOME_COPY[result.outcome] || OUTCOME_COPY.QUEUED;
                return (
                  <li key={`${result.interestId}-${idx}`} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="truncate text-sm font-medium text-ink">
                          {result.interestName}
                        </span>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      {result.message && (
                        <p className="mt-1 truncate text-xs text-mute">{result.message}</p>
                      )}
                    </div>
                    {result.outcome === 'MATCHED' && result.group?.chatRoomId && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        onClick={() => navigate(`/chat/${result.group.chatRoomId}`)}
                      >
                        Open chat
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      <section>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} className="mb-8" />

        {shown.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <EmptyChair className="h-32 w-32 text-mute" />
            <p className="mt-6 font-display text-xl font-bold tracking-tight text-ink">
              {activeTab === 'CONNECTIONS' ? 'Nobody across from you yet.' : 'Not waiting on anything.'}
            </p>
            <p className="mt-2 max-w-xs text-sm text-mute">
              {activeTab === 'CONNECTIONS'
                ? 'Run the matcher and the seat gets filled when someone fits.'
                : 'When a match needs one more person, it parks here.'}
            </p>
          </div>
        ) : activeTab === 'CONNECTIONS' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => navigate(`/matches/${group.id}`)}
              />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {waiting.map((group) => (
              <li key={group.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{group.interestName}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-mute">
                    {group.connectionType} · {group.levelBand}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-xs text-mute tnum">
                    {group.memberCount}/{group.maxMembers}
                  </span>
                  {formatWaiting(group.waitingSeconds) && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-wait tnum">
                      {formatWaiting(group.waitingSeconds)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
