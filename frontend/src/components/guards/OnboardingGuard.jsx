import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function OnboardingGuard() {
  const { nextStep } = useAuthStore((state) => state);
  const location = useLocation();

  const isStrictOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isTestRoute = location.pathname.startsWith('/test');
  const isReady = nextStep === 'READY' || nextStep === null;

  if (!isReady && !isStrictOnboardingRoute && !isTestRoute) {
    // Needs onboarding but is trying to access app
    return <Navigate to="/onboarding" replace />;
  }

  if (isReady && isStrictOnboardingRoute) {
    // Done with onboarding but trying to access strict onboarding
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
