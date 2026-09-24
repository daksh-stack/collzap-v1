import { MessageSquare } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

/** `/chat` index — shown in the room pane only on desktop, beside the rail. */
export default function ChatEmptySelection() {
  return (
    <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-line bg-surface p-8">
      <EmptyState
        icon={MessageSquare}
        title="No thread open"
        description="Pick one from the list to read it here."
        className="border-none bg-transparent"
      />
    </div>
  );
}
