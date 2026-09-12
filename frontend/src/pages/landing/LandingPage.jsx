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

  return (
    <div className="min-h-screen bg-paper">
      <Helmet>
        <title>CollZap — Same campus. Different dreams. One platform.</title>
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
