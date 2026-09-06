import { Suspense, useState, useEffect, lazy } from 'react';
import { useReducedMotion } from '../../lib/motion';

// R3F pulls in three; keep it out of the initial bundle.
const IdCardScene = lazy(() => import('./IdCardScene'));

/**
 * A plastic college ID on a lanyard, idling behind the form.
 *
 * Guards, in order of importance:
 *  - prefers-reduced-motion    -> CSS card, no WebGL at all
 *  - no WebGL / context lost   -> CSS card
 *  - sustained low FPS         -> CSS card
 *  - tab hidden                -> frameloop paused
 * It is aria-hidden and never focusable, so it cannot steal the form's focus.
 */
export default function IdCardCanvas({ className = '' }) {
  const reduced = useReducedMotion();
  const [degraded, setDegraded] = useState(false);

  const supportsWebGL = useWebGLSupport();

  if (reduced || degraded || supportsWebGL === false) {
    return <CssIdCard className={className} />;
  }

  // Still probing for WebGL — render the static card so there is no flash of nothing.
  if (supportsWebGL === null) {
    return <CssIdCard className={className} />;
  }

  return (
    <div className={className} aria-hidden="true">
      <Suspense fallback={<CssIdCard />}>
        <IdCardScene onDegrade={() => setDegraded(true)} />
      </Suspense>
    </div>
  );
}

function useWebGLSupport() {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setOk(!!gl);
      // Release the probe context immediately.
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/**
 * The fallback, and the thing most users on reduced-motion will see.
 * It is a real design, not a grey box.
 */
export function CssIdCard({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <div className="relative">
        {/* lanyard */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-16 h-16 w-1.5 bg-accent-700/80 rounded-sm" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-2 h-4 w-4 rounded-full border-2 border-mute/40 bg-paper" />

        <div className="w-[13.5rem] rounded-lg border border-line bg-[#FBF8F2] p-4 shadow-soft rotate-[-3deg]">
          <div className="flex items-start gap-3">
            <div className="h-14 w-11 rounded-sm bg-accent-100 border border-line" />
            <div className="flex-1 pt-0.5">
              <div className="h-2 w-full rounded-sm bg-ink/15" />
              <div className="mt-1.5 h-2 w-2/3 rounded-sm bg-ink/10" />
              <div className="mt-3 h-1.5 w-1/2 rounded-sm bg-accent-500/45" />
            </div>
          </div>
          <div className="mt-4 border-t border-line pt-2.5 flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-widest text-mute">STUDENT</span>
            <span className="font-mono text-[9px] tracking-widest text-mute tnum">2K26</span>
          </div>
        </div>
      </div>
    </div>
  );
}
