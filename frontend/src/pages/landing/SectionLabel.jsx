/**
 * The mono kicker above every section heading. One rule, one label.
 *
 * Its own file rather than sitting in ./shared: mixing a component export with
 * the hook and constants there breaks fast refresh (react-refresh/only-export-components).
 */
export default function SectionLabel({ children }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
      <span className="grad-brand h-1 w-6 rounded-full" />
      {children}
    </p>
  );
}
