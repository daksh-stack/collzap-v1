import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Edit2, MapPin, GraduationCap, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useUserStore } from '../../store/useUserStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { profile, fetchMe, updateProfile, loading } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMe().catch(console.error);
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
        storyPrompt3: profile.storyPrompt3 || ''
      });
    }
  }, [profile, isEditing]); // reset on edit toggle

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        ...formData,
        collegeId: user?.collegeId || profile?.collegeId,
        yearOfStudy: parseInt(formData.yearOfStudy, 10)
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (loading && !profile) {
    return <div className="text-center py-20 text-gray-500">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-red-500">Failed to load profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-800"></div>
        
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
              <div className="relative">
                <Avatar src={profile.profilePhotoUrl} name={profile.name} size="xl" className="border-4 border-white shadow-md bg-white" />
                {profile.verified && (
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-brand-500" />
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900 truncate">{profile.name}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-0 flex justify-center sm:justify-end">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} icon={<Edit2 className="w-4 h-4" />}>
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-3 flex">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} loading={loading}>Save</Button>
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Details */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Building2 className="w-5 h-5 mr-3 text-gray-400" />
                      {profile.collegeName}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <GraduationCap className="w-5 h-5 mr-3 text-gray-400" />
                      Year {profile.yearOfStudy} Student
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                      {profile.city}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Verification</h3>
                  {profile.verified ? (
                    <div className="flex items-start text-sm text-brand-800 bg-brand-50 p-3 rounded-lg border border-brand-100">
                      <ShieldCheck className="w-5 h-5 mr-2 text-brand-600 flex-shrink-0" />
                      <p>Your student status is verified by CollZap.</p>
                    </div>
                  ) : (
                    <div className="flex items-start text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <ShieldAlert className="w-5 h-5 mr-2 text-yellow-600 flex-shrink-0" />
                      <p>Your profile is pending verification or was rejected.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Stories */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Icebreakers</h3>
                  <div className="space-y-4">
                    {[
                      { q: "What drives you?", a: profile.storyPrompt1 },
                      { q: "What are you currently working on?", a: profile.storyPrompt2 },
                      { q: "Fun fact about you", a: profile.storyPrompt3 }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <p className="text-xs font-bold text-brand-600 mb-2">{item.q}</p>
                        <p className="text-gray-900 text-sm leading-relaxed">{item.a || <span className="text-gray-400 italic">No answer provided.</span>}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider mt-8">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map(i => (
                        <Badge key={i.interestId} variant="secondary" className="px-3 py-1 text-sm bg-brand-50 text-brand-700 border-brand-200">
                          {i.interestName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <Input label="Full Name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <Input label="City" name="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
                <Select label="Year of Study" name="yearOfStudy" value={formData.yearOfStudy} onChange={(e) => setFormData({...formData, yearOfStudy: e.target.value})} options={[
                  { value: '1', label: '1st Year' }, { value: '2', label: '2nd Year' }, { value: '3', label: '3rd Year' },
                  { value: '4', label: '4th Year' }, { value: '5', label: '5th Year' }, { value: '6', label: '6th+ Year' },
                ]} />
                <Input label="Profile Photo URL" name="profilePhotoUrl" type="url" value={formData.profilePhotoUrl} onChange={(e) => setFormData({...formData, profilePhotoUrl: e.target.value})} />
              </div>
              <div className="space-y-4">
                <TextArea label="What drives you?" name="storyPrompt1" value={formData.storyPrompt1} onChange={(e) => setFormData({...formData, storyPrompt1: e.target.value})} rows={2} />
                <TextArea label="What are you currently working on?" name="storyPrompt2" value={formData.storyPrompt2} onChange={(e) => setFormData({...formData, storyPrompt2: e.target.value})} rows={2} />
                <TextArea label="Fun fact about you" name="storyPrompt3" value={formData.storyPrompt3} onChange={(e) => setFormData({...formData, storyPrompt3: e.target.value})} rows={2} />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}