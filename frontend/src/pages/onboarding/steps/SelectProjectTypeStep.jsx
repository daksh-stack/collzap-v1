import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Target, Zap } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { useInterestStore } from '../../../../store/useInterestStore';

export default function SelectProjectTypeStep() {
  const { projectTypes: storeProjectTypes, selectProjectTypes, loading, fetchProjectTypes } = useInterestStore();
  const [selectedTypes, setSelectedTypes] = useState(new Set());

  // Initially load available options and pre-select if any exist in store
  useEffect(() => {
    fetchProjectTypes().catch(console.error);
    if (storeProjectTypes && storeProjectTypes.size > 0) {
      setSelectedTypes(new Set(storeProjectTypes));
    }
  }, []);

  const toggleType = (type) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const handleSubmit = async () => {
    if (selectedTypes.size === 0) {
      toast.error('Please select at least one project type');
      return;
    }

    try {
      await selectProjectTypes(selectedTypes);
      // useInterestStore already calls fetchOnboarding internally on success
    } catch (error) {
      toast.error(error.message || 'Failed to save project types');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What kind of projects interest you?</h2>
        <p className="mt-2 text-sm text-gray-500">
          Select one or both. This helps us tailor your match recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Long Term Card */}
        <div 
          onClick={() => toggleType('LONG_TERM')}
          className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
            selectedTypes.has('LONG_TERM') 
              ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${selectedTypes.has('LONG_TERM') ? 'bg-brand-100' : 'bg-gray-100'}`}>
              <Target className={`w-6 h-6 ${selectedTypes.has('LONG_TERM') ? 'text-brand-600' : 'text-gray-500'}`} />
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedTypes.has('LONG_TERM') ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
            }`}>
              {selectedTypes.has('LONG_TERM') && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
          <h3 className={`text-lg font-bold mb-2 ${selectedTypes.has('LONG_TERM') ? 'text-brand-900' : 'text-gray-900'}`}>
            Long-Term
          </h3>
          <p className={`text-sm ${selectedTypes.has('LONG_TERM') ? 'text-brand-700' : 'text-gray-500'}`}>
            Ongoing projects, deep collaboration, and building lasting connections over months or years.
          </p>
        </div>

        {/* Short Term Card */}
        <div 
          onClick={() => toggleType('SHORT_TERM')}
          className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
            selectedTypes.has('SHORT_TERM') 
              ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${selectedTypes.has('SHORT_TERM') ? 'bg-brand-100' : 'bg-gray-100'}`}>
              <Zap className={`w-6 h-6 ${selectedTypes.has('SHORT_TERM') ? 'text-brand-600' : 'text-gray-500'}`} />
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedTypes.has('SHORT_TERM') ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
            }`}>
              {selectedTypes.has('SHORT_TERM') && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </div>
          <h3 className={`text-lg font-bold mb-2 ${selectedTypes.has('SHORT_TERM') ? 'text-brand-900' : 'text-gray-900'}`}>
            Short-Term
          </h3>
          <p className={`text-sm ${selectedTypes.has('SHORT_TERM') ? 'text-brand-700' : 'text-gray-500'}`}>
            Quick projects, weekend hackathons, and fast-paced one-time collaborations.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit} 
          loading={loading}
          disabled={selectedTypes.size === 0}
          className="w-full md:w-auto md:min-w-[200px]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
