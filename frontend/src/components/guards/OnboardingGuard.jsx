import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTestStore } from '../../store/useTestStore';

export default function OnboardingGuard() {
  const { nextStep } = useAuthStore((state) => state);
  const { session, result } = useTestStore((state) => state);
  const location = useLocation();

  const isStrictOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isTestRoute = location.pathname.startsWith('/test');

  // If an active test sitting is currently in progress, strictly lock navigation to /test
  const isTestInProgress = session && session.questions && !result;
  if (isTestInProgress && !isTestRoute) {
    return <Navigate to="/test" replace />;
  }

  // If required onboarding step is TAKE_SERIOUSNESS_TEST and they try to navigate away, redirect straight to /test
  if (nextStep === 'TAKE_SERIOUSNESS_TEST' && !isTestRoute) {
    return <Navigate to="/test" replace />;
  }

  // Allow app access if ready, or if all setup is done and just awaiting document verification review
  const canAccessApp = nextStep === 'READY' || nextStep === 'AWAITING_VERIFICATION' || nextStep === null;

  if (!canAccessApp && !isStrictOnboardingRoute && !isTestRoute) {
    // Missing required profile/interest setup steps
    return <Navigate to="/onboarding" replace />;
  }

  if (nextStep === 'READY' && isStrictOnboardingRoute) {
    // Fully ready user trying to access onboarding
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}


