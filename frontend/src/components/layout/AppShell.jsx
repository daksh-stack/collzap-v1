import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUserStore } from '../../store/useUserStore';

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, fetchMe } = useUserStore();

  useEffect(() => {
    if (!profile) {
      fetchMe().catch(console.error);
    }
  }, []);

  const isPendingVerification = profile && profile.verificationStatus !== 'APPROVED';

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden md:pl-64">
        <Topbar setMobileOpen={setMobileOpen} />
        
        {isPendingVerification && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-2 truncate">
              <Clock className="w-4 h-4 flex-shrink-0 text-amber-200" />
              <span className="truncate">
                <strong className="font-semibold">Student Verification In Progress:</strong> Matchmaking unlocks as soon as an admin approves your document.
              </span>
            </div>
            <Link 
              to="/onboarding" 
              className="ml-3 underline hover:text-amber-100 flex-shrink-0 text-xs font-bold uppercase tracking-wider"
            >
              Details &rarr;
            </Link>
          </div>
        )}

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

