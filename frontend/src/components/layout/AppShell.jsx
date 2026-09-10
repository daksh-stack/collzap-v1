import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import AppNav from './AppNav';
import { useUserStore } from '../../store/useUserStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { webSocketService } from '../../services/websocket';
import { page, useReducedMotion, transition } from '../../lib/motion';

const UNREAD_POLL_MS = 30_000;

/**
 * Vertical space the floating capsule and page gutters take, published as
 * `--app-chrome` so a full-height child (the chat room) can size itself
 * without hard-coding a magic number that silently rots when the chrome
 * changes. Must stay equal to the sum of PAD's top and bottom values:
 *   mobile  pt-24 (6rem) + pb-28 (7rem)   = 13rem
 *   desktop pt-24 (6rem) + pb-10 (2.5rem) = 8.5rem
 */
const CHROME_VAR = '[--app-chrome:13rem] md:[--app-chrome:8.5rem]';
const PAD = 'pt-24 pb-28 md:pt-24 md:pb-10';

export default function AppShell() {
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-paper">
      <AppNav />

      <main
        id="app-scroll"
        className={`relative flex-1 overflow-y-auto focus:outline-none ${CHROME_VAR}`}
      >
        {isPendingVerification && (
          <div className="mx-auto mb-2 max-w-5xl px-5 sm:px-8">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-wait/30 bg-wait/[0.08] px-4 py-2">
              <p className="truncate text-xs text-ink">
                <span className="font-mono text-[10px] uppercase tracking-widest text-wait">
                  With a human
                </span>
                <span className="mx-2 text-line">/</span>
                Matching stays locked until someone checks your ID.
              </p>
              <Link
                to="/onboarding"
                className="shrink-0 rounded-sm text-xs text-accent-700 underline decoration-accent-300 underline-offset-4 hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                Status
              </Link>
            </div>
          </div>
        )}

        {isChatRoom ? (
          // No page fade: the message list is already scrolling.
          <div className={`mx-auto max-w-5xl px-5 sm:px-8 ${PAD}`}>
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
              className={`mx-auto max-w-5xl px-5 sm:px-8 ${PAD}`}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
