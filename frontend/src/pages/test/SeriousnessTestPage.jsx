import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Timer, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useTestStore } from '../../store/useTestStore';

export default function SeriousnessTestPage() {
  const navigate = useNavigate();
  const { session, eligibility, result, startSession, fetchCurrentSession, submitAnswer, submitTest, loading } = useTestStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Load active session or start a new one
  useEffect(() => {
    const init = async () => {
      try {
        let activeSession = await fetchCurrentSession();
        if (!activeSession) {
          activeSession = await startSession();
        }
        
        // Find first unanswered question
        const nextUnanswered = activeSession.questions.findIndex(q => q.selectedOptionIndex === null);
        if (nextUnanswered !== -1) {
          setCurrentQuestionIndex(nextUnanswered);
        } else {
          setCurrentQuestionIndex(activeSession.questions.length - 1);
        }

        // Setup timer
        const expiryTime = new Date(activeSession.expiresAt).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((expiryTime - now) / 1000)));

      } catch (error) {
        toast.error("Failed to load test session");
        navigate('/onboarding');
      }
    };
    init();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!session || result) return;
    
    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, session, result]);

  const handleTimeUp = async () => {
    if (session) {
      toast.error("Time's up! Submitting your test automatically.");
      try {
        await submitTest(session.id);
      } catch (e) {
        console.error("Auto submit failed", e);
      }
    }
  };

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleNext = async () => {
    if (selectedOption === null || !session) return;
    
    const currentQ = session.questions[currentQuestionIndex];
    
    try {
      // Optimistic local update could go here, but we'll wait for API for simplicity
      await submitAnswer(session.id, currentQ.id, selectedOption);
      
      // Update local session object manually since submitAnswer returns { answeredCount, totalQuestions }
      session.questions[currentQuestionIndex].selectedOptionIndex = selectedOption;

      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(session.questions[currentQuestionIndex + 1].selectedOptionIndex); // pre-select if already answered
      } else {
        // Last question
        await submitTest(session.id);
      }
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Render Result Screen
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Test Complete!</h2>
            <p className="mt-2 text-lg text-gray-600">Your overall level is:</p>
            <div className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-xl font-medium rounded-full shadow-sm text-white bg-brand-600">
              {result.overallLevel}
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Breakdown by Interest</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.breakdowns.map((b) => (
                <div key={b.interestId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold text-gray-900">{b.interestName}</h4>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Score: {b.score} / {b.totalQuestions}</p>
                    <p>Level: <span className="font-medium text-brand-600">{b.level}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-10 flex justify-center">
            <Button onClick={() => navigate('/onboarding')} size="lg">
              Continue Onboarding
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading test session...</p>
      </div>
    );
  }

  const currentQ = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const progressPercent = ((currentQuestionIndex) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header / Progress */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex-1 mr-8">
            <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
              <span>Question {currentQuestionIndex + 1} of {session.questions.length}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          <div className={`flex items-center font-mono font-medium text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
            <Timer className="w-5 h-5 mr-2" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <Badge className="mb-4">{currentQ.interestName}</Badge>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {currentQ.questionText}
            </h3>
          </div>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedOption === index 
                    ? 'border-brand-500 bg-brand-50' 
                    : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                    selectedOption === index ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                  }`}>
                    {selectedOption === index && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-base ${selectedOption === index ? 'text-brand-900 font-medium' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm text-gray-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              You cannot return to previous questions
            </div>
            <Button 
              onClick={handleNext} 
              disabled={selectedOption === null || loading}
              loading={loading}
              size="lg"
            >
              {isLastQuestion ? 'Submit Test' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}