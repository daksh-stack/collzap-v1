import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';

export default function AuthGuard() {
  const { isAuthenticated, user } = useAuthStore((state) => state);
  const location = useLocation();
  const bootstrapped = useRef(false);

  const isAdmin = !!user?.isAdmin;

  // nextStep is persisted, so it can be stale after (for example) an admin
  // approves a document while the tab was closed. Refresh it once on boot.
  useEffect(() => {
    if (isAuthenticated && !isAdmin && !bootstrapped.current) {
      bootstrapped.current = true;
      useUserStore.getState().fetchOnboarding().catch(console.error);
    }
  }, [isAuthenticated, isAdmin]);

  // The marketing landing. Open to everyone, signed in or not — being logged
  // in is no reason to be barred from your own home page. It adapts its calls
  // to action instead. The student app home is `/home`.
  const isLanding = location.pathname === '/';

  // Screens that only make sense signed out; a signed-in user gets moved on.
  const isAuthOnlyRoute = location.pathname === '/login' ||
                          location.pathname === '/signup' ||
                          location.pathname === '/forgot-password' ||
                          location.pathname === '/admin/login';

  if (!isAuthenticated && !isLanding && !isAuthOnlyRoute) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && isAuthOnlyRoute) {
    // Already signed in: send admins to their console, students to the app.
    return <Navigate to={isAdmin ? '/admin' : '/home'} replace />;
  }

  // An admin session has no student onboarding state, so keep it out of the
  // student app entirely. AdminGuard handles the reverse direction. The
  // landing page is exempt — it is marketing, not app.
  if (isAuthenticated && isAdmin && !isLanding && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
