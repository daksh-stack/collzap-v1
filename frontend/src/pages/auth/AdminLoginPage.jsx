import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { adminLogin, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    try {
      await adminLogin(username, password);
      toast.success("Welcome back, Admin");
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || "Invalid credentials");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-900 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center">
          Admin Portal
        </h3>
        <p className="mt-1 text-sm text-gray-500 text-center">
          Enter your operator credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          placeholder="admin"
          icon={<User className="h-5 w-5" />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          disabled={loading}
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />

        <Button
          type="submit"
          className="w-full mt-2 bg-gray-900 hover:bg-gray-800 focus-visible:ring-gray-900"
          loading={loading}
        >
          Secure Login
        </Button>
      </form>
    </div>
  );
}