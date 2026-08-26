import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthGuard() {
  const { isAuthenticated } = useAuthStore((state) => state);
  const location = useLocation();

  const isPublicRoute = location.pathname === '/login' || 
                        location.pathname === '/verify-otp' || 
                        location.pathname === '/admin/login';

  if (!isAuthenticated && !isPublicRoute) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && isPublicRoute) {
    // If they are logged in and try to hit login again
    // In a real app we might check if they are admin to go to /admin
    // Or check onboarding status. But OnboardingGuard will catch them anyway.
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
