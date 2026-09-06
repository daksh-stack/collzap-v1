import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import EmptyChair from '../../components/EmptyChair';
import { useMatchStore } from '../../store/useMatchStore';
import { useUserStore } from '../../store/useUserStore';
import { snappy, page, useReducedMotion, transition } from '../../lib/motion';

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

function GroupCard({ group, onClick }) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      onClick={onClick}
      whileTap={reduced ? undefined : { scale: 0.995 }}
      transition={transition(snappy, reduced)}
      className="group w-full rounded-lg border border-line bg-[#FBF8F2] p-5 text-left transition-colors hover:border-ink/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
          {group.connectionType}
        </span>
        <Badge variant="secondary">{group.levelBand}</Badge>
      </div>

      <h3 className="mt-4 truncate font-display text-xl font-semibold tracking-tight text-ink" title={group.interestName}>
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
  const reduced = useReducedMotion();

  useEffect(() => {
    fetchCircle().catch(console.error);
    if (!profile) fetchMe().catch(console.error);
  }, []);

  const isVerified = profile?.verificationStatus === 'APPROVED';
  const connections = circle?.connections || [];
  const waiting = circle?.waiting || [];

  const handleFindMatches = async () => {
    if (!isVerified) {
      toast.error('Matching unlocks once someone checks your ID.');
      return;
    }
    try {
      const response = await findMatches();
      const results = response.results || [];
      setMatchResults(results);
      if (results.length > 0) {
        fetchCircle().catch(console.error);
      } else {
        toast.error('No active interests to match on.');
      }
    } catch (error) {
      toast.error(error.message || 'The matcher did not run');
    }
  };

  const tabs = [
    { key: 'CONNECTIONS', label: `Connections (${connections.length})` },
    { key: 'WAITING', label: `Waiting (${waiting.length})` },
  ];

  const shown = activeTab === 'CONNECTIONS' ? connections : waiting;

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tightest text-ink">
            Matches
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mute">
            The matcher looks at your interests, your level band and your campus.
            Run it whenever — it will not double-match you.
          </p>
        </div>
        <Button
          onClick={handleFindMatches}
          loading={loading}
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
            <p className="mt-6 font-display text-xl font-semibold tracking-tight text-ink">
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
