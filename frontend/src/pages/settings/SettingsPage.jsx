import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useUserStore } from '../../store/useUserStore';
import { cn } from '../../lib/utils';

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
          checked ? 'border-accent-600 bg-accent-500' : 'border-line bg-ink/[0.06]'
        )}
      >
        <span
          className={cn(
            'pointer-events-none mt-[3px] inline-block h-4 w-4 transform rounded-full bg-[#FBF8F2] shadow transition-transform',
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
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tightest text-ink">
          Settings
        </h1>
      </header>

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
