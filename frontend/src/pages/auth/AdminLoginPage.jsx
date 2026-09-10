import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/brand/Logo';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { adminLogin, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username and password required');
      return;
    }

    try {
      await adminLogin(username, password);
      navigate('/admin', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    }
  };

  return (
    <div className="w-full max-w-xs">
      <div className="mb-8 flex items-center justify-between border-b border-line pb-3">
        <Logo className="h-6" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
          Operator
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
