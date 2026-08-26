import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminGuard() {
  const { user } = useAuthStore((state) => state);

  // We set isAdmin to true when admin logs in via AdminLogin
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
