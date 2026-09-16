import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import Nav from './landing/sections/Nav';
import Footer from './landing/sections/Footer';
import Button from '../components/ui/Button';
import { usePrimaryCta } from './landing/shared';

/**
 * Both the visible list and the FAQPage JSON-LD are generated from this array,
 * so the structured data can never drift from what's actually on the page —
 * which is exactly what Google penalises FAQ markup for.
 *
 * Answers are plain strings, not JSX, for the same reason: the schema needs
 * text, and duplicating the copy to get it would guarantee drift.
 */
const FAQS = [
  {
    q: 'What is CollZap?',
    a: 'CollZap is a campus peer-matching platform for college students in India. It connects verified students inside the same college who share an interest and a similar level of commitment — for projects, startups, studying, or just meeting people who take the same things seriously.',
  },
  {
    q: 'Is CollZap only for students of my own college?',
    a: 'Yes. Every match happens inside your own campus. You verify that you belong to your college during setup, and you are only ever matched with other verified students from that same college.',
  },
  {
    q: 'Is CollZap free?',
    a: 'Yes. CollZap is free for students. There is no paid tier and no charge to be matched.',
  },
  {
    q: 'How does the seriousness test work?',
    a: 'For long-term interests you sit a short one-time assessment — about twenty minutes, taken in a single sitting. It establishes the level you are genuinely working at, so you get matched with people at a comparable stage instead of being paired with someone three years ahead of or behind you. Short-term interests do not require it.',
  },
  {
    q: 'What kinds of connections can I choose?',
    a: 'Four: a one-on-one partner, a small group of three to five students, an open college community, or an official student society. You pick the format you want, and it is treated as part of the match rather than something sorted out afterwards.',
  },
  {
    q: 'Can I look for both long-term and short-term things?',
    a: 'Yes. Long-term is for work that runs across semesters — startups, research, sustained projects — and is set once. Short-term covers hackathons, a single paper, or one deadline, and you can pick a new short-term interest any time from your home page.',
  },
  {
    q: 'Who can see my profile?',
    a: 'Only students you are actually matched with. Your profile is not publicly listed, it cannot be browsed by guessing addresses, and you can hide it entirely from your settings. Conversations stay private to the people in them.',
  },
  {
    q: 'How do I get verified?',
    a: 'You confirm your email, then confirm you belong to your college — either through a college email address or by uploading a student ID or fee slip, which a reviewer checks. You can continue setting up your profile while verification is pending; it only gates matching.',
  },
  {
    q: 'Which colleges is CollZap available in?',
    a: 'CollZap is launching in selected Indian colleges first, campus by campus. A peer-matching platform depends on how many students from your own college are on it, so we build depth in one campus at a time rather than spreading thin across many.',
  },
];

export default function FaqPage() {
  const cta = usePrimaryCta();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://collzap.com/faq#faq',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <Helmet>
        <title>CollZap FAQ — how campus peer matching works</title>
        <meta
          name="description"
          content="Answers about how CollZap matches college students: college verification, the seriousness test, connection types, privacy, and which campuses it covers."
        />
        <link rel="canonical" href="https://collzap.com/faq" />
        <meta property="og:url" content="https://collzap.com/faq" />
        <meta property="og:title" content="CollZap FAQ — how campus peer matching works" />
        <meta
          property="og:description"
          content="Answers about how CollZap matches college students inside their own campus."
        />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Nav />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
          <span className="grad-brand h-1 w-6 rounded-full" />
          FAQ
        </p>

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink sm:text-5xl">
          Frequently asked questions
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-mute">
          How CollZap matches students, what gets verified, and what stays private.
        </p>

        <dl className="mt-14 divide-y divide-line border-y border-line">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="py-7">
              <dt className="font-display text-lg font-bold tracking-tight text-ink">{q}</dt>
              <dd className="mt-3 text-base leading-relaxed text-mute">{a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link to={cta.to}>
            <Button size="lg" variant="gradient" icon={<ArrowRight className="h-4 w-4" />}>
              {cta.label}
            </Button>
          </Link>
          <Link
            to="/about"
            className="rounded text-sm text-accent-700 underline decoration-accent-300 underline-offset-4 transition-colors hover:text-accent-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            More about CollZap
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
