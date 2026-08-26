import { cn } from '../../lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("text-center py-12 px-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50", className)}>
      {Icon && (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 mb-4">
          <Icon className="w-6 h-6 text-brand-600" />
        </div>
      )}
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
