import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useUserStore } from '../../store/useUserStore';
import { useThemeStore } from '../../store/useThemeStore';
import { cn } from '../../lib/utils';

/** Light/dark chooser. Two miniature renderings of the app, not a switch. */
function AppearancePicker() {
  const { theme, setTheme } = useThemeStore();

  const options = [
    {
      value: 'light',
      name: 'Light',
      note: 'Cool off-white ground.',
      shell: 'bg-[#F4F7FB] border-[#DDE6F1]',
      rail: 'bg-[#0C1A31]',
      card: 'bg-white border-[#DDE6F1]',
      bar: 'bg-[#DDE6F1]',
    },
    {
      value: 'dark',
      name: 'Dark',
      note: 'Deep navy, same layout.',
      shell: 'bg-[#0A1428] border-[#1E3355]',
      rail: 'bg-[#0C1A31]',
      card: 'bg-[#101E38] border-[#1E3355]',
      bar: 'bg-[#1E3355]',
    },
  ];

  return (
    <div className="grid gap-4 py-5 sm:grid-cols-2">
      {options.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={active}
            className={cn(
              'group rounded-lg border p-3 text-left transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
              active
                ? 'border-accent-500 shadow-glow-accent'
                : 'border-line hover:border-accent-300'
            )}
          >
            {/* Miniature of the real shell: dark rail, light content well. */}
            <div className={cn('flex h-24 gap-1.5 overflow-hidden rounded border p-1.5', o.shell)}>
              <div className={cn('w-1/4 rounded-sm', o.rail)}>
                <div className="grad-brand mx-1 mt-1.5 h-1 rounded-full" />
                <div className="mx-1 mt-1.5 h-1 rounded-full bg-white/20" />
                <div className="mx-1 mt-1 h-1 rounded-full bg-white/20" />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className={cn('h-6 rounded-sm border', o.card)} />
                <div className={cn('flex-1 rounded-sm border p-1.5', o.card)}>
                  <div className={cn('h-1 w-2/3 rounded-full', o.bar)} />
                  <div className={cn('mt-1 h-1 w-1/2 rounded-full', o.bar)} />
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">{o.name}</span>
              {active && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent-700">
                  On
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-mute">{o.note}</p>
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ id, checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-6 py-5">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
        <p className="mt-1 text-sm leading-relaxed text-mute">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
          checked ? 'grad-brand-cta border-transparent' : 'border-line bg-ink/[0.06]'
        )}
      >
        <span
          className={cn(
            'pointer-events-none mt-[3px] inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { settings, fetchSettings, updateSettings, logoutEverywhere, deleteAccount, loading } = useUserStore();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    fetchSettings().catch(console.error);
  }, []);

  const handleToggle = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
    } catch {
      toast.error('Could not save that');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutEverywhere();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Could not sign out everywhere');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    try {
      await deleteAccount();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Could not delete the account');
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex justify-center py-24 text-accent-500">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-12">
      <header>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink">
          Settings
        </h1>
      </header>

      <section>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-mute">
          Appearance
        </h2>
        <div className="border-y border-line">
          <AppearancePicker />
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-mute">
          Preferences
        </h2>
        <div className="divide-y divide-line border-y border-line">
          <Toggle
            id="notifications-enabled"
            checked={settings?.notificationsEnabled}
            onChange={(v) => handleToggle('notificationsEnabled', v)}
            label="Notifications"
            description="Get told when a match lands or someone writes."
          />
          <Toggle
            id="profile-visible"
            checked={settings?.profileVisible}
            onChange={(v) => handleToggle('profileVisible', v)}
            label="Profile visible"
            description="People you match with can open your full profile."
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-mute">
          Feedback & Ideas
        </h2>
        <div className="flex items-start justify-between gap-6 border-y border-line py-5">
          <div>
            <p className="text-sm font-medium text-ink">Suggest an interest or feature</p>
            <p className="mt-1 text-sm text-mute">
              Missing an interest, have a suggestion or found an issue? Tell the CollZap team.
            </p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => navigate('/feedback')}>
            Give feedback
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-mute">
          Sessions
        </h2>
        <div className="flex items-start justify-between gap-6 border-y border-line py-5">
          <div>
            <p className="text-sm font-medium text-ink">Sign out everywhere</p>
            <p className="mt-1 text-sm text-mute">Ends every session, including this one.</p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0" onClick={() => setLogoutModalOpen(true)}>
            Sign out all
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-bad">
          Cannot be undone
        </h2>
        <div className="flex items-start justify-between gap-6 border-y border-line py-5">
          <div>
            <p className="text-sm font-medium text-ink">Delete account</p>
            <p className="mt-1 text-sm text-mute">
              Profile, matches and messages go with it.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-bad hover:bg-bad/[0.07]"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </section>

      <Modal open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Sign out everywhere">
        <p className="text-sm leading-relaxed text-mute">
          Every device gets signed out, this one included. You will need your
          college email to get back in.
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setLogoutModalOpen(false)}>Cancel</Button>
          <Button onClick={handleLogoutAll} loading={loading}>Sign out</Button>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete your account">
        <p className="text-sm leading-relaxed text-mute">
          This is permanent. Your profile, every match and every message are
          removed and cannot be restored.
        </p>
        <div className="mt-6">
          <Input
            label="Type DELETE to confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Keep it</Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            loading={loading}
            disabled={deleteConfirm !== 'DELETE'}
          >
            Delete for good
          </Button>
        </div>
      </Modal>
    </div>
  );
}
