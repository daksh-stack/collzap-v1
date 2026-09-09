import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import TextArea from '../../../components/ui/TextArea';
import Select from '../../../components/ui/Select';
import FileUpload from '../../../components/ui/FileUpload';
import StepHeader from './StepHeader';
import { useUserStore } from '../../../store/useUserStore';
import { useAuthStore } from '../../../store/useAuthStore';

const PROMPTS = [
  { name: 'storyPrompt1', label: 'What are you actually into?', placeholder: 'Not the resume version.' },
  { name: 'storyPrompt2', label: "What's open on your laptop right now?", placeholder: 'A repo, a paper, a half-dead side project…' },
  { name: 'storyPrompt3', label: 'One thing people find out about you late', placeholder: 'Anything. Keep it short.' },
];

export default function CompleteProfileStep() {
  const { user } = useAuthStore();
  const { profile, fetchMe, updateProfile, fetchOnboarding, loading } = useUserStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    profilePhotoUrl: '',
    yearOfStudy: '1',
    city: '',
    storyPrompt1: '',
    storyPrompt2: '',
    storyPrompt3: '',
  });

  useEffect(() => {
    // College is only set during the earlier verification step, not at
    // signup — the cached user/profile can predate it, so refetch here to
    // make sure collegeId (required by the backend) is actually present.
    fetchMe().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        profilePhotoUrl: profile.profilePhotoUrl || '',
        yearOfStudy: profile.yearOfStudy?.toString() || '1',
        city: profile.city || '',
        storyPrompt1: profile.storyPrompt1 || '',
        storyPrompt2: profile.storyPrompt2 || '',
        storyPrompt3: profile.storyPrompt3 || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.city.trim()) {
      toast.error('Name and city are required');
      return;
    }

    if (!formData.profilePhotoUrl) {
      toast.error('Upload a profile photo');
      return;
    }

    const collegeId = profile?.collegeId || user?.collegeId;
    if (!collegeId) {
      toast.error('Could not confirm your college — reload the page and try again');
      return;
    }

    try {
      await updateProfile({
        ...formData,
        collegeId,
        yearOfStudy: parseInt(formData.yearOfStudy, 10),
      });
      await fetchOnboarding();
    } catch (error) {
      toast.error(error.message || 'Could not save that');
    }
  };

  return (
    <div>
      <StepHeader eyebrow="Step two" title="Who's asking?">
        This is what a stranger sees before deciding whether to work with you.
        Three honest lines beat three polished ones.
      </StepHeader>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-10">
        <FileUpload
          category="PROFILE_PHOTO"
          label="Profile photo"
          onUploadComplete={(url) => setFormData((prev) => ({ ...prev, profilePhotoUrl: url }))}
          existingUrl={formData.profilePhotoUrl}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Full name" name="name" value={formData.name} onChange={handleChange} disabled={loading} required />
          <Input label="City" name="city" value={formData.city} onChange={handleChange} disabled={loading} required />
          <Select
            label="Year"
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
            disabled={loading}
            options={[
              { value: '1', label: '1st year' },
              { value: '2', label: '2nd year' },
              { value: '3', label: '3rd year' },
              { value: '4', label: '4th year' },
              { value: '5', label: '5th year' },
              { value: '6', label: '6th+ year' },
            ]}
          />
        </div>

        <div className="space-y-5 border-t border-line pt-8">
          {PROMPTS.map((p) => (
            <TextArea
              key={p.name}
              label={p.label}
              name={p.name}
              value={formData[p.name]}
              onChange={handleChange}
              placeholder={p.placeholder}
              disabled={loading}
              rows={2}
              required
            />
          ))}
        </div>

        <Button type="submit" size="lg" loading={loading}>
          Save and continue
        </Button>
      </form>
    </div>
  );
}
