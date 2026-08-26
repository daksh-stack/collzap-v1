import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Timer, AlertCircle, X, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useTestStore } from '../../store/useTestStore';

export default function SeriousnessTestPage() {
  const navigate = useNavigate();
  const { session, eligibility, result, startSession, fetchCurrentSession, submitAnswer, submitTest, resetTestState, loading } = useTestStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const submittingRef = useRef(false);

  // Load active session or start a new one
  useEffect(() => {
    submittingRef.current = false;
    useTestStore.setState({ result: null });

    const init = async () => {
      try {
        let activeSession = null;
        try {
          activeSession = await fetchCurrentSession();
        } catch (e) {
          // No in-progress session found, start a new one
          try {
            activeSession = await startSession();
          } catch (startErr) {
            console.error("Start session failed", startErr);
            toast.error(startErr.message || "Cannot start assessment at this time");
            navigate('/onboarding');
            return;
          }
        }

        if (!activeSession || !activeSession.questions || activeSession.questions.length === 0) {
          try {
            activeSession = await startSession();
          } catch (startErr) {
            console.error("Start session retry failed", startErr);
            toast.error(startErr.message || "Failed to load test questions");
            navigate('/onboarding');
            return;
          }
        }
        
        // Find first unanswered question
        if (activeSession && activeSession.questions && activeSession.questions.length > 0) {
          const nextUnanswered = activeSession.questions.findIndex(q => q.selectedOptionIndex === null);
          if (nextUnanswered !== -1) {
            setCurrentQuestionIndex(nextUnanswered);
            setSelectedOption(activeSession.questions[nextUnanswered].selectedOptionIndex);
          } else {
            setCurrentQuestionIndex(0);
            setSelectedOption(activeSession.questions[0].selectedOptionIndex);
          }
        }

        // Setup timer accurately
        let expiryTime = NaN;
        if (activeSession.expiresAt) {
          const val = activeSession.expiresAt;
          if (typeof val === 'number') {
            expiryTime = val < 10000000000 ? val * 1000 : val;
          } else {
            expiryTime = new Date(val).getTime();
          }
        }
        
        if (isNaN(expiryTime)) {
          let startedAtMs = Date.now();
          if (activeSession.startedAt) {
            const parsed = new Date(activeSession.startedAt).getTime();
            if (!isNaN(parsed)) {
              startedAtMs = parsed < 10000000000 ? parsed * 1000 : parsed;
            }
          }
          expiryTime = startedAtMs + (20 * 60 * 1000);
        }
        
        const now = Date.now();
        let remaining = Math.floor((expiryTime - now) / 1000);
        if (remaining <= 0) {
          try {
            activeSession = await startSession();
            remaining = 20 * 60;
          } catch (e) {
            remaining = 60;
          }
        }
        
        setTimeLeft(Math.max(60, remaining));

      } catch (error) {
        console.error(error);
        toast.error("Failed to load test session");
        navigate('/onboarding');
      }
    };
    init();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!session || result || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      if (!submittingRef.current) {
        submittingRef.current = true;
        handleTimeUp();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          if (!submittingRef.current) {
            submittingRef.current = true;
            handleTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft === null, session?.sessionId, result]);

  // Protect against accidental tab closure / navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (session && !result) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session, result]);

  const handleTimeUp = async () => {
    if (session && !result) {
      toast.error("Time's up! Submitting your test automatically.");
      try {
        await submitTest(session.sessionId);
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
      await submitAnswer(session.sessionId, currentQ.questionId, selectedOption);
      session.questions[currentQuestionIndex].selectedOptionIndex = selectedOption;

      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(session.questions[currentQuestionIndex + 1].selectedOptionIndex);
      } else {
        // Last question
        await submitTest(session.sessionId);
      }
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '20:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleContinueOnboarding = () => {
    if (resetTestState) resetTestState();
    navigate('/onboarding');
  };

  // Render Result Screen
  if (result) {
    return (
      <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-200">
              <Shield className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900">Assessment Complete!</h2>
            <p className="mt-2 text-sm text-gray-500">Your commitment level has been evaluated:</p>
            <div className="mt-4 inline-flex items-center justify-center px-6 py-2.5 rounded-full shadow-sm text-lg font-bold text-white bg-brand-600">
              {result.overallLevel}
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Domain Breakdown</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.results?.map((b) => (
                <div key={b.interestId} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-bold text-gray-900">{b.interestName}</h4>
                  <div className="mt-2 text-sm text-gray-500 space-y-1">
                    <p>Score: <span className="font-semibold text-gray-900">{b.score} / {b.totalQuestions}</span></p>
                    <p>Domain Band: <span className="font-bold text-brand-600">{b.level}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-10 flex justify-center">
            <Button onClick={handleContinueOnboarding} size="lg" className="w-full sm:w-auto px-8">
              Continue Onboarding
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent mb-4" />
        <p className="text-gray-300 font-medium">Preparing your assessment paper...</p>
      </div>
    );
  }

  const currentQ = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const progressPercent = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col select-none">
      
      {/* Distraction-Free Exam Header */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700/60 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-black text-white tracking-tight">CollZap</span>
          <span className="text-xs bg-brand-500/20 text-brand-300 font-semibold px-2 py-0.5 rounded border border-brand-400/30">
            Locked Assessment Mode
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`flex items-center font-mono font-bold text-base px-3 py-1.5 rounded-lg border ${
            timeLeft !== null && timeLeft < 300 
              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
              : 'bg-slate-700/50 border-slate-600 text-white'
          }`}>
            <Timer className="w-4 h-4 mr-2 text-brand-400" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              <span>Question {currentQuestionIndex + 1} of {session.questions.length}</span>
              <span>{Math.round(progressPercent)}% Completed</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div 
                className="bg-brand-500 h-2 rounded-full transition-all duration-300 shadow-sm" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3 font-semibold text-brand-700 bg-brand-50 border-brand-200">
                {currentQ.interestName}
              </Badge>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                {currentQ.questionText}
              </h3>
            </div>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ${
                    selectedOption === index 
                      ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-1 ring-brand-500' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    selectedOption === index ? 'border-brand-600 bg-brand-600' : 'border-gray-300'
                  }`}>
                    {selectedOption === index && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm font-medium ${selectedOption === index ? 'text-brand-950 font-semibold' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-gray-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 text-amber-500 flex-shrink-0" />
                Answers cannot be modified once you proceed
              </div>
              <Button 
                onClick={handleNext} 
                disabled={selectedOption === null || loading}
                loading={loading}
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                {isLastQuestion ? 'Submit Assessment' : 'Next Question'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}