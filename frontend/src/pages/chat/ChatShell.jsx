import { Outlet, useParams } from 'react-router-dom';
import { cn } from '../../lib/utils';
import ChatSidebar from './ChatSidebar';

/**
 * The split view: a persistent thread rail plus whichever room is open,
 * side by side — the layout `/chat` and `/chat/:roomId` both mount into.
 * Opening a thread swaps the right pane through the router; the rail never
 * unmounts, so it never has to re-fetch or re-scroll itself.
 *
 * Below `lg` there is only room for one pane, so it toggles on whether a
 * room is open instead of showing both: the rail is the whole screen with
 * nothing open, the room is the whole screen once one is.
 */
export default function ChatShell() {
  const { roomId } = useParams();

  return (
    <div className="flex h-[calc(100dvh-var(--app-chrome,9rem))] gap-4">
      <aside
        className={cn(
          'min-h-0 shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-surface',
          'lg:flex lg:w-[340px]',
          roomId ? 'hidden' : 'flex w-full'
        )}
      >
        <ChatSidebar />
      </aside>

      <div className={cn('min-h-0 min-w-0 flex-1 flex-col', roomId ? 'flex' : 'hidden lg:flex')}>
        <Outlet />
      </div>
    </div>
  );
}
