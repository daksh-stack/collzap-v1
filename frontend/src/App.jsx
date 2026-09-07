import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';

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
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const OtpVerifyPage = lazy(() => import('./pages/auth/OtpVerifyPage'));
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
const AdminQuestionsPage = lazy(() => import('./pages/admin/AdminQuestionsPage'));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Global Suspense Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>CollZap | Connect with your peers</title>
      </Helmet>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes (Login/Signup) */}
          <Route element={<AuthGuard />}>
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify-otp" element={<OtpVerifyPage />} />
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
                <Route path="/" element={<HomePage />} />
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
