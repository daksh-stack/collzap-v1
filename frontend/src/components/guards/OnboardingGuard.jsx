import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function OnboardingGuard() {
  const { nextStep } = useAuthStore((state) => state);
  const location = useLocation();

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isReady = nextStep === 'READY' || nextStep === null;

  if (!isReady && !isOnboardingRoute) {
    // Needs onboarding but is trying to access app
    return <Navigate to="/onboarding" replace />;
  }

  if (isReady && isOnboardingRoute) {
    // Done with onboarding but trying to access onboarding
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
