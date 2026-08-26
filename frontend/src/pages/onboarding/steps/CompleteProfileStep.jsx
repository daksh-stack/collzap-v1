import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import TextArea from '../../../components/ui/TextArea';
import Select from '../../../components/ui/Select';
import { useUserStore } from '../../../store/useUserStore';
import { useAuthStore } from '../../../store/useAuthStore';

export default function CompleteProfileStep() {
  const { user } = useAuthStore();
  const { updateProfile, fetchOnboarding, loading } = useUserStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    profilePhotoUrl: '',
    yearOfStudy: '1',
    city: '',
    storyPrompt1: '',
    storyPrompt2: '',
    storyPrompt3: ''
  });

  // Pre-fill if we already have profile data fetched
  const { profile } = useUserStore.getState();
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        profilePhotoUrl: profile.profilePhotoUrl || '',
        yearOfStudy: profile.yearOfStudy?.toString() || '1',
        city: profile.city || '',
        storyPrompt1: profile.storyPrompt1 || '',
        storyPrompt2: profile.storyPrompt2 || '',
        storyPrompt3: profile.storyPrompt3 || ''
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.city.trim()) {
      toast.error('Name and City are required');
      return;
    }

    try {
      await updateProfile({
        ...formData,
        collegeId: user?.collegeId || profile?.collegeId,
        yearOfStudy: parseInt(formData.yearOfStudy, 10)
      });
      toast.success('Profile saved successfully');
      // Advance step
      await fetchOnboarding();
    } catch (error) {
      toast.error(error.message || 'Failed to save profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Complete your profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us a bit about yourself. This helps us match you with the right peers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
          
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Mumbai, New York"
            disabled={loading}
            required
          />

          <Select
            label="Year of Study"
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
            disabled={loading}
            options={[
              { value: '1', label: '1st Year' },
              { value: '2', label: '2nd Year' },
              { value: '3', label: '3rd Year' },
              { value: '4', label: '4th Year' },
              { value: '5', label: '5th Year' },
              { value: '6', label: '6th+ Year' },
            ]}
          />

          <Input
            label="Profile Photo URL"
            name="profilePhotoUrl"
            type="url"
            value={formData.profilePhotoUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            disabled={loading}
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Icebreakers</h3>
          <div className="space-y-4">
            <TextArea
              label="What drives you?"
              name="storyPrompt1"
              value={formData.storyPrompt1}
              onChange={handleChange}
              placeholder="I'm passionate about building tech that helps people..."
              disabled={loading}
              rows={2}
              required
            />
            <TextArea
              label="What are you currently working on?"
              name="storyPrompt2"
              value={formData.storyPrompt2}
              onChange={handleChange}
              placeholder="A side project using React and Spring Boot..."
              disabled={loading}
              rows={2}
              required
            />
            <TextArea
              label="Fun fact about you"
              name="storyPrompt3"
              value={formData.storyPrompt3}
              onChange={handleChange}
              placeholder="I can solve a Rubik's cube in under a minute..."
              disabled={loading}
              rows={2}
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
