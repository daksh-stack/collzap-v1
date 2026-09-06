import { cn } from '../../lib/utils';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel, onAction, className }) {
  // Callers pass either a ready-made `action` node or an actionLabel/onAction pair.
  const actionNode = action || (actionLabel && onAction
    ? <Button variant="secondary" size="sm" onClick={onAction}>{actionLabel}</Button>
    : null);

  return (
    <div
      className={cn(
        'text-center py-14 px-6 rounded-lg border border-dashed border-line bg-ink/[0.015]',
        className
      )}
    >
      {Icon && (
        <Icon className="mx-auto w-6 h-6 text-mute/60 mb-4" strokeWidth={1.5} />
      )}
      <h3 className="font-display text-base font-semibold text-ink tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-mute max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {actionNode && <div className="mt-6">{actionNode}</div>}
    </div>
  );
}
