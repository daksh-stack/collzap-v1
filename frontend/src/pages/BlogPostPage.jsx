import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Nav from './landing/sections/Nav';
import Footer from './landing/sections/Footer';
import Button from '../components/ui/Button';
import { usePrimaryCta } from './landing/shared';
import NotFoundPage from './NotFoundPage';
import { getPost, POSTS_BY_DATE, BLOG_BASE } from '../content/posts';

const SITE = 'https://collzap.com';

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Blocks come from src/content/posts.js. Rendering them explicitly rather than
 * parsing markdown keeps the semantic output predictable — h2/h3 nesting is the
 * part of a post Google actually reads structurally, so it shouldn't be the
 * output of a regex.
 */
function Block({ block }) {
  switch (block.t) {
    case 'h2':
      return (
        <h2 className="mt-12 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {block.x}
        </h2>
      );
    case 'h3':
      return (
        <h3 className="mt-8 font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
          {block.x}
        </h3>
      );
    case 'quote':
      return (
        <blockquote className="my-8 border-l-2 border-accent-400 pl-5 font-display text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">
          {block.x}
        </blockquote>
      );
    case 'ul':
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-base leading-relaxed text-mute">
              <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="mt-4 space-y-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3 text-base leading-relaxed text-mute">
              <span className="mt-0.5 font-mono text-xs font-semibold text-accent-700 tnum">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    default:
      return <p className="mt-5 text-base leading-relaxed text-mute">{block.x}</p>;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPost(slug);
  const cta = usePrimaryCta();

  // An unknown slug is a 404, not an empty article shell. Rendered in place
  // rather than redirected so the bad URL stays in the address bar.
  if (!post) return <NotFoundPage />;

  const url = `${SITE}${BLOG_BASE}/${post.slug}`;
  const others = POSTS_BY_DATE.filter((p) => p.slug !== post.slug).slice(0, 2);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'en-IN',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@id': `${SITE}/#organization` },
    publisher: { '@id': `${SITE}/#organization` },
    image: `${SITE}/og-image.png`,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      <Helmet>
        <title>{`${post.title} · CollZap`}</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="article:published_time" content={post.date} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Nav />

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <Link
          to={BLOG_BASE}
          className="inline-flex items-center gap-1.5 rounded text-sm text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All posts
        </Link>

        <article className="mt-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-mute">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
            {post.tags?.map((tag) => (
              <span key={tag} className="rounded-full border border-line px-2.5 py-0.5 normal-case tracking-normal">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tightest text-ink sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-mute">{post.description}</p>

          <div className="mt-10 border-t border-line pt-8">
            {post.blocks.map((block, i) => (
              <Block key={`${block.t}-${i}`} block={block} />
            ))}
          </div>
        </article>

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
            Common questions
          </Link>
        </div>

        {others.length > 0 && (
          <section className="mt-16">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-mute">Read next</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`${BLOG_BASE}/${p.slug}`}
                    className="group flex items-baseline justify-between gap-4 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <span className="font-display text-base font-bold tracking-tight text-ink transition-colors group-hover:text-accent-700">
                      {p.title}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
