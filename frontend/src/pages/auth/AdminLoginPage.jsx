import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/brand/Logo';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { adminLogin, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!username.trim()) next.username = 'Enter your username';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      await adminLogin(username, password);
      navigate('/admin', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    }
  };

  return (
    <div className="w-full max-w-xs">
      <Helmet>
        <title>Admin · CollZap</title>
        {/* robots meta is owned solely by App.jsx — see its comment for why */}
      </Helmet>

      <div className="mb-8 flex items-center justify-between border-b border-line pb-3">
        <Logo className="h-6" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
          Operator
        </span>
      </div>

      <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight text-ink">
        Operator sign in
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: undefined })); }}
          error={errors.username}
          autoComplete="username"
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
          error={errors.password}
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
