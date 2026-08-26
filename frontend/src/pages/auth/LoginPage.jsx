import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  const { requestOtp, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your college email");
      return;
    }
    if (isSignup && !name) {
      toast.error("Please enter your name");
      return;
    }

    try {
      const response = await requestOtp(email, isSignup ? name : null, isSignup);
      
      toast.success(`Code sent to ${email}`);
      navigate('/verify-otp', {
        state: { 
          email,
          name: isSignup ? name : null,
          collegeName: response.collegeName,
          existingAccount: response.existingAccount,
          expiresInSeconds: response.expiresInSeconds
        }
      });
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 text-center">
          {isSignup ? 'Create Account' : 'Welcome back'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 text-center">
          {isSignup ? 'Sign up with your college email' : 'Login with your college email'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <Input
            label="Full Name"
            placeholder="John Doe"
            icon={<User className="h-5 w-5" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
          />
        )}
        
        <Input
          label="College Email"
          type="email"
          placeholder="yourname@college.edu"
          icon={<Mail className="h-5 w-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          loading={loading}
        >
          Send Code
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-sm font-medium text-brand-600 hover:text-brand-500"
          onClick={() => {
            setIsSignup(!isSignup);
            // Clear errors/state if needed
          }}
          disabled={loading}
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}