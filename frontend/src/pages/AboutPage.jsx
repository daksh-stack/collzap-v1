import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import Nav from './landing/sections/Nav';
import Footer from './landing/sections/Footer';
import Button from '../components/ui/Button';
import { usePrimaryCta } from './landing/shared';

export default function AboutPage() {
  const cta = usePrimaryCta();

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <Helmet>
        <title>About CollZap — campus peer matching for Indian college students</title>
        <meta
          name="description"
          content="CollZap is a campus peer-matching platform for verified college students in India. Find project teammates, startup co-founders and serious study partners inside your own college."
        />
        <link rel="canonical" href="https://collzap.com/about" />
        <meta property="og:url" content="https://collzap.com/about" />
        <meta property="og:title" content="About CollZap — campus peer matching for Indian college students" />
        <meta
          property="og:description"
          content="CollZap is a campus peer-matching platform for verified college students in India."
        />
      </Helmet>

      <Nav />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
          <span className="grad-brand h-1 w-6 rounded-full" />
          About
        </p>

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink sm:text-5xl">
          What CollZap is, and why we built it.
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-mute">
          CollZap is a campus peer-matching platform for college students in India. It connects
          verified students inside the same college who are working towards similar things —
          projects, startups, study goals, or simply meeting people who take the same interests
          seriously.
        </p>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            The problem we set out to solve
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mute">
            Every college already contains the people you need. The person building the exact side
            project you want to join is two buildings away, and you will probably never meet them.
            Talent on a campus rarely discovers itself — introductions happen through luck, hostel
            proximity, or whichever WhatsApp group you happened to be added to.
          </p>
          <p className="mt-4 text-base leading-relaxed text-mute">
            The existing tools do not solve this. Group chats go quiet within a week. Instagram is
            built to keep you scrolling, not to find you a co-founder. LinkedIn is built for
            professional networking across cities, not for the thousand students sharing your
            campus. None of them can tell you who is actually serious about the same thing you are.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            How CollZap works
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mute">
            Students verify that they belong to their college, choose the interests they want to be
            matched on, and — for long-term commitments — sit a short assessment that establishes
            the level they are actually working at. CollZap then matches on four things at once:
            same college, same interest, similar seriousness level, and the same kind of connection
            you asked for.
          </p>
          <p className="mt-4 text-base leading-relaxed text-mute">
            That last part matters. Some people want one focused partner. Some want a small group of
            three to five. Some want an open society around a shared interest. Matching someone who
            wants a co-founder with someone who wants a casual study circle helps nobody, so we
            treat it as part of the match rather than an afterthought.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Who it is for
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mute">
            Founders looking for co-founders. Developers looking for project teammates. Designers
            and creators looking for people to build with. Students who want a study group that
            actually studies. Anyone who would rather spend their college years around people
            moving in the same direction.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Where we are
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mute">
            CollZap is launching first in selected Indian colleges, campus by campus rather than all
            at once — a peer-matching product is only as good as the density of people on it, so
            depth in one college beats a thin presence across a hundred. Every account is tied to a
            verified student identity, and conversations stay private to the people in them.
          </p>
        </section>

        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-line pt-10">
          <Link to={cta.to}>
            <Button size="lg" variant="gradient" icon={<ArrowRight className="h-4 w-4" />}>
              {cta.label}
            </Button>
          </Link>
          <Link
            to="/faq"
            className="rounded text-sm text-accent-700 underline decoration-accent-300 underline-offset-4 transition-colors hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Read the FAQ
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
