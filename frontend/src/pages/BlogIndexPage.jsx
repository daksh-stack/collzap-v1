import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import Nav from './landing/sections/Nav';
import Footer from './landing/sections/Footer';
import { POSTS_BY_DATE, BLOG_BASE } from '../content/posts';

const SITE = 'https://collzap.com';

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogIndexPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE}${BLOG_BASE}#blog`,
    name: 'The CollZap Blog',
    url: `${SITE}${BLOG_BASE}`,
    publisher: { '@id': `${SITE}/#organization` },
    blogPost: POSTS_BY_DATE.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE}${BLOG_BASE}/${p.slug}`,
      datePublished: p.date,
      description: p.description,
    })),
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <Helmet>
        <title>The CollZap Blog — finding your people in college</title>
        <meta
          name="description"
          content="Practical guides on finding project teammates, co-founders and study partners in college, and on building a circle that lasts past the first month."
        />
        <link rel="canonical" href={`${SITE}${BLOG_BASE}`} />
        <meta property="og:url" content={`${SITE}${BLOG_BASE}`} />
        <meta property="og:title" content="The CollZap Blog — finding your people in college" />
        <meta
          property="og:description"
          content="Practical guides on finding project teammates, co-founders and study partners in college."
        />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Nav />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">
          <span className="grad-brand h-1 w-6 rounded-full" />
          Blog
        </p>

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink sm:text-5xl">
          Finding your people in college.
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-mute">
          Practical writing on project teams, co-founders, study circles and the campus
          connections that actually go somewhere.
        </p>

        <ul className="mt-14 divide-y divide-line border-y border-line">
          {POSTS_BY_DATE.map((post) => (
            <li key={post.slug}>
              <Link
                to={`${BLOG_BASE}/${post.slug}`}
                className="group block py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-mute">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>

                <h2 className="mt-3 font-display text-2xl font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent-700">
                  {post.title}
                </h2>

                <p className="mt-3 text-base leading-relaxed text-mute">{post.description}</p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700">
                  Read
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
