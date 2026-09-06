/**
 * One question per screen: a big Fraunces headline, small helper under it.
 * Every onboarding step opens with this so the rhythm stays identical.
 */
export default function StepHeader({ eyebrow, title, children }) {
  return (
    <header className="mb-12 max-w-xl">
      {eyebrow && (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-accent-700">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tightest text-ink sm:text-5xl">
        {title}
      </h1>
      {children && (
        <p className="mt-5 max-w-md text-sm leading-relaxed text-mute">{children}</p>
      )}
    </header>
  );
}
