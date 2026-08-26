import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Users, Globe } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useInterestStore } from '../../../store/useInterestStore';

export default function SelectConnectionTypeStep() {
  const { projectTypes, fetchProjectTypes, connectionTypes, fetchConnectionTypes, selectConnectionType, loading } = useInterestStore();
  
  // projectTypes is a Set in the store, connectionTypes is an array of responses
  const ptArray = Array.from(projectTypes || []);
  
  // Local state to track selections before submitting them individually
  // Map of projectType -> connectionType string
  const [selections, setSelections] = useState({});

  useEffect(() => {
    fetchConnectionTypes().catch(console.error);
    fetchProjectTypes().catch(console.error);
  }, []);

  // Sync with store state
  useEffect(() => {
    if (connectionTypes && connectionTypes.length > 0) {
      const newSelections = { ...selections };
      connectionTypes.forEach(ct => {
        newSelections[ct.projectType] = ct.connectionType;
      });
      setSelections(newSelections);
    }
  }, [connectionTypes]);

  const handleSelect = (projectType, type) => {
    setSelections(prev => ({ ...prev, [projectType]: type }));
  };

  const handleSubmit = async () => {
    // Validate all required project types have a connection type selected
    const missing = ptArray.filter(pt => !selections[pt]);
    if (missing.length > 0) {
      toast.error(`Please select a connection type for ${missing.join(' and ')}`);
      return;
    }

    try {
      // Need to submit each one sequentially or via Promise.all
      // The store action handles one at a time per the backend API (PUT /connection-types)
      for (const pt of ptArray) {
        await selectConnectionType(pt, selections[pt]);
      }
      toast.success("Setup complete!");
      // useInterestStore automatically fetches onboarding state, which should now be READY
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    }
  };

  const renderOptions = (pt) => {
    const isLongTerm = pt === 'LONG_TERM';
    const selected = selections[pt];

    const options = [
      {
        id: 'ONE_ON_ONE',
        name: '1-on-1',
        desc: 'Pair up with one highly-matched peer.',
        icon: <User className="w-6 h-6" />
      },
      {
        id: 'SHORT_GROUP',
        name: 'Small Group',
        desc: 'Collaborate in a focused group of 2-4 people.',
        icon: <Users className="w-6 h-6" />
      }
    ];

    if (isLongTerm) {
      options.push({
        id: 'SOCIETY',
        name: 'Society',
        desc: 'Join an open, ongoing community for this interest.',
        icon: <Globe className="w-6 h-6" />
      });
    }

    return (
      <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
          For {isLongTerm ? 'Long-Term' : 'Short-Term'} Projects
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => handleSelect(pt, opt.id)}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selected === opt.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`mb-3 p-2 inline-block rounded-lg ${selected === opt.id ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                {opt.icon}
              </div>
              <h4 className={`font-bold mb-1 ${selected === opt.id ? 'text-brand-900' : 'text-gray-900'}`}>
                {opt.name}
              </h4>
              <p className="text-xs text-gray-500">{opt.desc}</p>
              
              <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === opt.id ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
              }`}>
                {selected === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">How do you want to connect?</h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose your preferred collaboration style for each project type you selected.
        </p>
      </div>

      <div className="space-y-6">
        {ptArray.map(pt => renderOptions(pt))}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full sm:w-auto min-w-[200px]">
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
