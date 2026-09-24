import { Building2, Users } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { cn } from '../../lib/utils';

// Mirrors the icon language Circles already uses on the landing page for the
// same connection shapes, so "group" and "society" read the same everywhere.
const TYPE_ICON = { GROUP: Users, SOCIETY: Building2 };

const SIZES = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

/**
 * The chat surface's one identity element: the other member's real photo (or
 * initials) for a 1-on-1 room, or a plain type glyph for anything with more
 * than two people. Never a fabricated face standing in for a group — there
 * is no single person a group room could show.
 */
export default function ThreadAvatar({ type, members, size = 'md', className }) {
  if (type === 'ONE_ON_ONE') {
    const other = members?.find((m) => !m.self);
    return (
      <Avatar src={other?.profilePhotoUrl} name={other?.name} size={size} className={className} />
    );
  }

  const Icon = TYPE_ICON[type] || Users;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded border border-line bg-accent-50 text-accent-700',
        SIZES[size] || SIZES.md,
        className
      )}
    >
      <Icon className="h-1/2 w-1/2" strokeWidth={1.8} aria-hidden="true" />
    </div>
  );
}
