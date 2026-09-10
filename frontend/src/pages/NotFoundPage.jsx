import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../components/ui/Button';
import Logo from '../components/brand/Logo';
import { useAuthStore } from '../store/useAuthStore';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Signed-in students land on their desk, admins on the console, visitors on
  // the marketing page.
  const home = !isAuthenticated ? '/' : user?.isAdmin ? '/admin' : '/home';

  return (
    <div className="relative mesh flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-16">
      <Helmet><title>Not found · CollZap</title></Helmet>

      <div className="relative w-full max-w-md text-center">
        <Logo className="mx-auto h-8" />

        <p className="text-grad mt-10 font-display text-8xl font-extrabold leading-none tracking-tightest tnum">
          404
        </p>

        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">
          Nothing here.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mute">
          That page has moved or never existed. No harm done.
        </p>

        <Button onClick={() => navigate(home)} size="lg" className="mt-8">
          Take me back
        </Button>
      </div>
    </div>
  );
}
