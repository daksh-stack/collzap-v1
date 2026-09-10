import { useState, useEffect } from 'react';
import { ShieldCheck, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import FileUpload from '../../components/ui/FileUpload';
import { useUserStore } from '../../store/useUserStore';
import { useInterestStore } from '../../store/useInterestStore';

const PROMPTS = [
  { key: 'storyPrompt1', q: 'What are you actually into?' },
  { key: 'storyPrompt2', q: "What's open on your laptop right now?" },
  { key: 'storyPrompt3', q: 'One thing people find out about you late' },
];

export default function ProfilePage() {
  const { profile, fetchMe, updateProfile, updatePhoto, loading } = useUserStore();
  const { myInterests, fetchMyInterests } = useInterestStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  useEffect(() => {
    fetchMe().catch(console.error);
    fetchMyInterests().catch(console.error);
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        profilePhotoUrl: profile.profilePhotoUrl || '',
        yearOfStudy: profile.yearOfStudy?.toString() || '1',
        city: profile.city || '',
        storyPrompt1: profile.storyPrompt1 || '',
        storyPrompt2: profile.storyPrompt2 || '',
        storyPrompt3: profile.storyPrompt3 || '',
      });
    }
  }, [profile, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...formData,
        collegeId: profile?.collegeId,
        yearOfStudy: parseInt(formData.yearOfStudy, 10),
      });
      toast.success('Saved');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Could not save that');
    }
  };

  const handlePhotoUploaded = async (url) => {
    try {
      await updatePhoto(url);
      setShowPhotoUpload(false);
      toast.success('Photo updated');
    } catch (error) {
      toast.error(error.message || 'Could not update photo');
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center py-24 text-accent-500">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return <p className="py-24 text-center text-sm text-bad">Could not load your profile.</p>;
  }

  const isVerified = profile.verificationStatus === 'APPROVED';
  const interests = Array.isArray(myInterests) ? myInterests : [];

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-5">
          {/* Clickable avatar with camera overlay */}
          <div className="group relative">
            <Avatar src={profile.profilePhotoUrl} name={profile.name} size="2xl" />
            <button
              type="button"
              onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              className="absolute inset-0 flex items-center justify-center rounded bg-ink/0 transition-colors group-hover:bg-ink/40"
              aria-label="Change profile photo"
            >
              <Camera className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
            </button>
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink">
              {profile.name}
            </h1>
            <p className="mt-2 text-sm text-mute">{profile.email}</p>
            {isVerified && (
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-good">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified student
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {!isEditing ? (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setIsEditing(false); setShowPhotoUpload(false); }}>Cancel</Button>
              <Button onClick={handleSubmit} loading={loading}>Save</Button>
            </div>
          )}
        </div>
      </header>

      {/* Photo upload panel */}
      {showPhotoUpload && (
        <div className="max-w-sm">
          <FileUpload
            category="PROFILE_PHOTO"
            label="Change profile photo"
            onUploadComplete={handlePhotoUploaded}
            existingUrl={profile.profilePhotoUrl}
          />
        </div>
      )}

      {!isEditing ? (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">Where</h2>
              <dl className="divide-y divide-line border-y border-line text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-mute">College</dt>
                  <dd className="text-right text-ink">{profile.collegeName || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-mute">Year</dt>
                  <dd className="text-right text-ink tnum">{profile.yearOfStudy || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-mute">City</dt>
                  <dd className="text-right text-ink">{profile.city || '—'}</dd>
                </div>
              </dl>
            </section>

            {interests.length > 0 && (
              <section>
                <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
                  Matching on
                </h2>
                <ul className="divide-y divide-line border-y border-line">
                  {interests.map((i) => (
                    <li key={`${i.id}-${i.projectType}`} className="flex items-baseline justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink">{i.name}</span>
                        {i.subTag && (
                          <span className="mt-0.5 block truncate text-xs text-mute">{i.subTag}</span>
                        )}
                      </span>
                      <Badge variant="secondary">{i.level}</Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section>
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-mute">
              What people read first
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {PROMPTS.map(({ key, q }) => (
                <div key={key} className="py-5">
                  <p className="text-xs text-mute">{q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">
                    {profile[key] || <span className="italic text-mute/60">Left blank.</span>}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-10">
          <FileUpload
            category="PROFILE_PHOTO"
            label="Profile photo"
            onUploadComplete={(url) => setFormData({ ...formData, profilePhotoUrl: url })}
            existingUrl={formData.profilePhotoUrl}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Select
              label="Year"
              value={formData.yearOfStudy}
              onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
              options={[
                { value: '1', label: '1st year' }, { value: '2', label: '2nd year' },
                { value: '3', label: '3rd year' }, { value: '4', label: '4th year' },
                { value: '5', label: '5th year' }, { value: '6', label: '6th+ year' },
              ]}
            />
          </div>

          <div className="space-y-5 border-t border-line pt-8">
            {PROMPTS.map(({ key, q }) => (
              <TextArea
                key={key}
                label={q}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                rows={2}
              />
            ))}
          </div>
        </form>
      )}
    </div>
  );
}
