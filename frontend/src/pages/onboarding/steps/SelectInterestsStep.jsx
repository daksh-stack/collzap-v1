import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Tabs from '../../../components/ui/Tabs';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import TextArea from '../../../components/ui/TextArea';
import { useInterestStore } from '../../../store/useInterestStore';

export default function SelectInterestsStep() {
  const { catalog, fetchCatalog, projectTypes, fetchProjectTypes, selectInterests, submitFeedback, loading } = useInterestStore();
  
  const [activeTab, setActiveTab] = useState('');
  const [selections, setSelections] = useState({}); // { LONG_TERM: [{interestId, subTag}], SHORT_TERM: [] }
  
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    fetchCatalog().catch(console.error);
    fetchProjectTypes().catch(console.error);
  }, []);

  useEffect(() => {
    if (projectTypes && projectTypes.size > 0 && !activeTab) {
      // Set initial tab to first selected project type
      setActiveTab(Array.from(projectTypes)[0]);
      
      // Initialize selections object
      const initialSelections = {};
      projectTypes.forEach(pt => {
        initialSelections[pt] = [];
      });
      setSelections(initialSelections);
    }
  }, [projectTypes]);

  if (!catalog || !activeTab) return null;

  const currentInterests = activeTab === 'LONG_TERM' ? catalog.longTerm : catalog.shortTerm;
  const maxSelections = activeTab === 'LONG_TERM' ? catalog.maxLongTermSelections : catalog.maxShortTermSelections;
  const currentSelections = selections[activeTab] || [];
  
  const tabs = Array.from(projectTypes).map(pt => ({
    key: pt,
    label: pt === 'LONG_TERM' ? 'Long-Term Interests' : 'Short-Term Interests'
  }));

  const handleToggleInterest = (interest) => {
    const isSelected = currentSelections.some(s => s.interestId === interest.id);
    let newSelections = [...currentSelections];
    
    if (isSelected) {
      newSelections = newSelections.filter(s => s.interestId !== interest.id);
    } else {
      if (newSelections.length >= maxSelections) {
        toast.error(`You can only select up to ${maxSelections} interests here.`);
        return;
      }
      newSelections.push({ interestId: interest.id, subTag: null });
    }
    
    setSelections(prev => ({ ...prev, [activeTab]: newSelections }));
  };

  const handleSubTagChange = (interestId, subTag) => {
    const newSelections = currentSelections.map(s => 
      s.interestId === interestId ? { ...s, subTag } : s
    );
    setSelections(prev => ({ ...prev, [activeTab]: newSelections }));
  };

  const handleSubmit = async () => {
    try {
      // Submit for the current active tab
      await selectInterests(activeTab, currentSelections);
      
      // If there's another tab they haven't submitted yet, switch to it
      const unsubmittedTypes = Array.from(projectTypes).filter(pt => pt !== activeTab && selections[pt].length === 0);
      
      if (unsubmittedTypes.length > 0) {
        setActiveTab(unsubmittedTypes[0]);
        toast.success(`Saved! Now select your ${unsubmittedTypes[0] === 'LONG_TERM' ? 'Long-Term' : 'Short-Term'} interests.`);
      }
      // If all submitted, useInterestStore automatically advances onboarding
    } catch (error) {
      toast.error(error.message || 'Failed to save interests');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    try {
      await submitFeedback(activeTab, feedbackText);
      toast.success('Feedback submitted! Our team will review it.');
      setFeedbackOpen(false);
      setFeedbackText('');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select your interests</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose topics you are passionate about to find relevant peers.
        </p>
      </div>

      {tabs.length > 1 && (
        <Tabs 
          tabs={tabs} 
          active={activeTab} 
          onChange={setActiveTab} 
          className="mb-6"
        />
      )}

      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          Selected: {currentSelections.length} / {maxSelections}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {currentInterests?.map(interest => {
          const selection = currentSelections.find(s => s.interestId === interest.id);
          const isSelected = !!selection;

          return (
            <div 
              key={interest.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                isSelected 
                  ? 'border-brand-500 bg-brand-50' 
                  : 'border-gray-200 bg-white hover:border-brand-200 cursor-pointer'
              }`}
              onClick={!isSelected ? () => handleToggleInterest(interest) : undefined}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className={`font-bold ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>
                    {interest.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {interest.description}
                  </p>
                </div>
                <button 
                  className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ml-2 ${
                    isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
                  }`}
                  onClick={(e) => { e.stopPropagation(); handleToggleInterest(interest); }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              </div>

              {isSelected && interest.allowsSubTag && (
                <div className="mt-3">
                  <Input
                    placeholder="Specific niche (e.g. AI, Crypto)"
                    className="h-8 text-xs"
                    value={selection.subTag || ''}
                    onChange={(e) => handleSubTagChange(interest.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={() => setFeedbackOpen(true)}
          className="text-sm text-brand-600 hover:text-brand-500 font-medium"
        >
          Can't find your interest?
        </button>
        <Button 
          onClick={handleSubmit} 
          loading={loading}
          disabled={currentSelections.length === 0}
        >
          {tabs.length > 1 && tabs[tabs.length-1].key !== activeTab ? 'Next Category' : 'Continue'}
        </Button>
      </div>

      <Modal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="Suggest an Interest"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Tell us what you're working on. We regularly add new topics based on demand!
          </p>
          <TextArea
            placeholder="I am looking for people interested in..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} loading={loading}>Submit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
