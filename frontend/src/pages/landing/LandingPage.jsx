import { Helmet } from 'react-helmet-async';
import { useLenis } from '../../lib/useLenis';
import Nav from './sections/Nav';
import Hero from './sections/Hero';
import Problem from './sections/Problem';
import WhoItsFor from './sections/WhoItsFor';
import WhyCollZap from './sections/WhyCollZap';
import HowItWorks from './sections/HowItWorks';
import Circles from './sections/Circles';
import Trust from './sections/Trust';
import Footer from './sections/Footer';
import StickyCta from './sections/StickyCta';

/**
 * The public marketing landing at `/`. Reachable signed in or out —
 * `AuthGuard` exempts this route deliberately — so every call to action runs
 * through `usePrimaryCta()` in ./shared rather than hardcoding `/signup`.
 *
 * Each section owns its own file and its own content array. Adding a section
 * means adding a file here and an anchor to `NAV_LINKS` in ./shared, nothing
 * else.
 */
export default function LandingPage() {
  useLenis(true);

  /*
   * `overflow-x-hidden` below is deliberate, not a patch over a broken layout.
   * The page uses rotated decoration — the stamps, and the sticky notes — and a
   * CSS transform still contributes to the *scrollable overflow area* even
   * though it contributes nothing to layout. Without it, a rotated element
   * hanging a few pixels past the right edge gives the whole document a
   * horizontal scrollbar, which on a phone shows as a strip of bare page
   * beside every section.
   *
   * Safe here: the element has `min-h-screen`, not a fixed height, so it never
   * becomes its own scroll container, and neither `Nav` nor `StickyCta` is
   * affected — `position: fixed` ignores an ancestor's overflow unless that
   * ancestor has a transform, and this one has none.
   */
  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <Helmet>
        <title>CollZap — Same campus | Different dreams | One platform</title>
        <meta
          name="description"
          content="CollZap helps students discover like-minded peers for friendships, projects, startups, learning, and growth inside their campus. Verified students only."
        />
      </Helmet>

      <Nav />
      <main>
        <Hero />
        {/* <Problem /> */}
        <WhoItsFor />
        <WhyCollZap />
        <HowItWorks />
        <Circles />
        <Trust />
      </main>
      <Footer />
      <StickyCta />
    </div>
  );
}
