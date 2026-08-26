import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/useAuthStore';

export default function OtpVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(state?.expiresInSeconds || 300);
  
  const { verifyOtp, requestOtp, loading } = useAuthStore();

  useEffect(() => {
    if (!state?.email) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [state?.email]);

  // If no state (e.g., direct navigation to /verify-otp), redirect to login
  if (!state?.email) {
    return <Navigate to="/login" replace />;
  }

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!code || code.length < 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await verifyOtp(state.email, code, state.name);
      
      toast.success("Successfully verified!");
      
      // Determine where to go based on nextStep
      if (response.nextStep === 'READY') {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      toast.error(error.message || "Invalid code");
      setCode('');
    }
  };

  const handleResend = async () => {
    try {
      const response = await requestOtp(state.email, state.name);
      setTimeLeft(response.expiresInSeconds || 300);
      toast.success(`New code sent to ${state.email}`);
    } catch (error) {
      toast.error(error.message || "Failed to resend code");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <button 
        onClick={() => navigate('/login')}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="mb-6 text-center">
        {state.collegeName && (
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {state.collegeName}
          </h2>
        )}
        <p className="text-sm text-gray-500">
          Enter the code sent to <br/>
          <span className="font-medium text-gray-900">{state.email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <Input
          label="Verification Code"
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(val);
          }}
          className="text-center text-2xl tracking-widest"
          autoFocus
          disabled={loading}
          maxLength={6}
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={code.length !== 6}
        >
          Verify
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {timeLeft > 0 ? (
          <p className="text-gray-500">
            Resend code in <span className="font-medium text-gray-900">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="font-medium text-brand-600 hover:text-brand-500"
          >
            Resend Code
          </button>
        )}
      </div>
    </div>
  );
}