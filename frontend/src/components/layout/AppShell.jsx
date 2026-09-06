import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUserStore } from '../../store/useUserStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { webSocketService } from '../../services/websocket';
import { page, useReducedMotion, transition } from '../../lib/motion';

const UNREAD_POLL_MS = 30_000;

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, fetchMe } = useUserStore();
  const { fetchUnreadCount } = useNotificationStore();
  const location = useLocation();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!profile) fetchMe().catch(console.error);
  }, []);

  // Unread badge: poll on mount and every 30s, plus a live push subscription.
  useEffect(() => {
    fetchUnreadCount().catch(() => {});
    const id = setInterval(() => fetchUnreadCount().catch(() => {}), UNREAD_POLL_MS);

    // NotificationResponse arrives on the personal queue and feeds
    // addIncomingNotification. Subscribed once here, torn down on unmount;
    // logout also disconnects the socket entirely.
    webSocketService.connect();
    webSocketService.subscribeNotifications();

    return () => {
      clearInterval(id);
      webSocketService.unsubscribeNotifications();
    };
  }, []);

  const isPendingVerification = profile && profile.verificationStatus !== 'APPROVED';

  // Chat room owns its own scroll and should not fade on every message route.
  const isChatRoom = /^\/chat\/[^/]+$/.test(location.pathname);

  return (
    <div className="h-screen flex overflow-hidden bg-paper">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-col flex-1 w-0 overflow-hidden md:pl-56">
        <Topbar setMobileOpen={setMobileOpen} />

        {isPendingVerification && (
          <div className="flex-shrink-0 border-b border-wait/30 bg-wait/[0.08]">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-2">
              <p className="truncate text-xs text-ink">
                <span className="font-mono text-[10px] uppercase tracking-widest text-wait">
                  With a human
                </span>
                <span className="mx-2 text-line">/</span>
                Matching stays locked until someone checks your ID.
              </p>
              <Link
                to="/onboarding"
                className="shrink-0 text-xs text-accent-700 underline decoration-accent-300 underline-offset-4 hover:text-accent-800 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                Status
              </Link>
            </div>
          </div>
        )}

        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          {isChatRoom ? (
            // No page fade: the message list is already scrolling.
            <div className="mx-auto max-w-5xl px-5 py-6">
              <Outlet />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={transition(page, reduced)}
                className="mx-auto max-w-5xl px-5 py-8 sm:px-8"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
