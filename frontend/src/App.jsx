import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import { useThemeStore } from './store/useThemeStore';
import LandingPage from './pages/landing/LandingPage';

// Layouts & Guards
import PublicLayout from './components/layout/PublicLayout';
import AppShell from './components/layout/AppShell';
import OnboardingLayout from './components/layout/OnboardingLayout';
import AdminLayout from './components/layout/AdminLayout';
import AuthGuard from './components/guards/AuthGuard';
import OnboardingGuard from './components/guards/OnboardingGuard';
import AdminGuard from './components/guards/AdminGuard';
import Spinner from './components/ui/Spinner';

// Pages (Lazy Loaded)
// LandingPage is imported eagerly above, not lazily — it's the one route
// Google actually needs to index, and its <Helmet> robots override
// (index,follow) must be present in the very first render alongside this
// file's own default (noindex,nofollow) Helmet. A lazy chunk load opens a
// window, between first paint and the chunk resolving, where only the
// noindex default exists — Google's live-render check can (and did) snapshot
// the page during exactly that window and reject indexing.
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'));

const OnboardingPage = lazy(() => import('./pages/onboarding/OnboardingPage'));

const HomePage = lazy(() => import('./pages/home/HomePage'));
const ChatListPage = lazy(() => import('./pages/chat/ChatListPage'));
const ChatRoomPage = lazy(() => import('./pages/chat/ChatRoomPage'));
const MatchesPage = lazy(() => import('./pages/matches/MatchesPage'));
const GroupDetailPage = lazy(() => import('./pages/matches/GroupDetailPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const PeerProfilePage = lazy(() => import('./pages/profile/PeerProfilePage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const FeedbackPage = lazy(() => import('./pages/feedback/FeedbackPage'));
const SeriousnessTestPage = lazy(() => import('./pages/test/SeriousnessTestPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminVerificationsPage = lazy(() => import('./pages/admin/AdminVerificationsPage'));
const AdminMatchesPage = lazy(() => import('./pages/admin/AdminMatchesPage'));
const AdminQueuePage = lazy(() => import('./pages/admin/AdminQueuePage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminFeedbackPage = lazy(() => import('./pages/admin/AdminFeedbackPage'));
const AdminCollegesPage = lazy(() => import('./pages/admin/AdminCollegesPage'));
const AdminInterestsPage = lazy(() => import('./pages/admin/AdminInterestsPage'));
const AdminQuestionsPage = lazy(() => import('./pages/admin/AdminQuestionsPage'));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Global Suspense Fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-paper text-accent-500">
    <Spinner size="lg" />
  </div>
);

// The one and only place `<meta name="robots">` is ever rendered. It used to
// be split across this file's own default and each public page's Helmet
// override, on the assumption that react-helmet-async would dedupe same-name
// meta tags and let the page-level one win. In practice both tags land in
// the DOM simultaneously (confirmed via Google Search Console's live test:
// "noindex" and "index, follow" both present), and Google's own rule for
// conflicting robots directives is to apply the most restrictive one — so
// the noindex always won, and the homepage silently failed indexing.
// Computing it once, here, from the path guarantees exactly one tag exists.
const INDEXABLE_PATHS = new Set(['/', '/login', '/signup']);
const NOINDEX_FOLLOW_PATHS = new Set(['/forgot-password']);

function robotsFor(pathname) {
  if (INDEXABLE_PATHS.has(pathname)) return 'index, follow';
  if (NOINDEX_FOLLOW_PATHS.has(pathname)) return 'noindex, follow';
  return 'noindex, nofollow';
}

function App() {
  const location = useLocation();

  // The inline script in index.html already applied the class before paint;
  // this keeps React's copy in sync if storage changed in another tab.
  useEffect(() => {
    useThemeStore.getState().syncTheme();
  }, []);

  return (
    <ErrorBoundary>
      <Helmet>
        <title>CollZap | Connect with your peers</title>
        <meta name="robots" content={robotsFor(location.pathname)} />
      </Helmet>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public marketing landing. AuthGuard treats "/" as public and
              bounces signed-in users to /home (or /admin). */}
          <Route element={<AuthGuard />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Public Routes (Login/Signup) */}
          <Route element={<AuthGuard />}>
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>
          </Route>

          {/* Onboarding Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<OnboardingGuard />}>
              <Route element={<OnboardingLayout />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>
            </Route>
          </Route>

          {/* Focused Assessment Route (No Sidebar) */}
          <Route element={<AuthGuard />}>
            <Route element={<OnboardingGuard />}>
              <Route path="/test" element={<SeriousnessTestPage />} />
            </Route>
          </Route>

          {/* Authenticated App Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<OnboardingGuard />}>
              <Route element={<AppShell />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/chat" element={<ChatListPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/matches/:groupId" element={<GroupDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<PeerProfilePage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
                <Route path="/admin/matches" element={<AdminMatchesPage />} />
                <Route path="/admin/queue" element={<AdminQueuePage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
                <Route path="/admin/colleges" element={<AdminCollegesPage />} />
                <Route path="/admin/interests" element={<AdminInterestsPage />} />
                <Route path="/admin/questions" element={<AdminQuestionsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
