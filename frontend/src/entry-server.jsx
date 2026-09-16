import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import AppRoot from './AppRoot.jsx';

// React 19 hoists <title>, <meta>, <link> and <base> to the very front of the
// render output regardless of how deep in the tree they were written — that
// hoisting, not react-helmet-async, is what actually puts head tags in the
// document (HelmetProvider short-circuits to a Fragment on React 19). So
// extracting the head means splitting the leading run of hoistable tags off
// the rendered string.
//
// Deliberately a scan over a closed tag set rather than a fixed-prefix
// assumption, so a change in hoisting order degrades into "head looks short"
// (which prerender.mjs asserts on) instead of silently mis-splitting the body.
//
// <script type="application/ld+json"> is NOT hoisted and correctly stays in the
// body, where Google still reads it.
const VOID_HOISTABLE = /^<(meta|link|base)\b[^>]*>/i;
const PAIRED_HOISTABLE = /^<(title|style)\b[^>]*>/i;

function splitHoistedHead(out) {
  let i = 0;
  for (;;) {
    const rest = out.slice(i);

    const voidMatch = rest.match(VOID_HOISTABLE);
    if (voidMatch) {
      i += voidMatch[0].length;
      continue;
    }

    const pairedMatch = rest.match(PAIRED_HOISTABLE);
    if (pairedMatch) {
      const close = `</${pairedMatch[1].toLowerCase()}>`;
      const end = out.toLowerCase().indexOf(close, i + pairedMatch[0].length);
      if (end === -1) break; // malformed — stop rather than mis-split
      i = end + close.length;
      continue;
    }

    break;
  }
  return { head: out.slice(0, i), html: out.slice(i) };
}

/**
 * Render one route to static HTML.
 *
 * Uses `prerender` from react-dom/static rather than `renderToString`, because
 * renderToString does NOT throw on a suspended React.lazy boundary — it quietly
 * emits the Suspense fallback (App.jsx's spinner) plus React's internal error
 * text, and exits 0. Every public route except "/" is lazy, so that failure
 * mode would ship three spinner pages to production undetected.
 */
export async function render(pathname, { timeoutMs = 20000 } = {}) {
  const errors = [];
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error(`prerender timed out after ${timeoutMs}ms`)),
    timeoutMs
  );

  try {
    const { prelude } = await prerender(
      <StaticRouter location={pathname}>
        <AppRoot />
      </StaticRouter>,
      {
        signal: controller.signal,
        // prerender otherwise swallows render errors into the shell. A build
        // must fail loudly rather than publish a half-rendered page.
        onError(error) {
          errors.push(error);
        },
      }
    );

    const out = await new Response(prelude).text();

    if (errors.length > 0) {
      throw new AggregateError(errors, `prerender failed for ${pathname}`);
    }

    return splitHoistedHead(out);
  } finally {
    clearTimeout(timer);
  }
}
