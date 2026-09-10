/** @type {import('tailwindcss').Config} */

// CollZap brand system.
//
// Every colour resolves through a CSS custom property defined in index.css,
// in "R G B" channel form so Tailwind's <alpha-value> keeps working. That is
// what lets `bg-accent-500`, `text-ink/70` and `border-line` flip between
// light and dark without a single `dark:` class at the call sites.
//
// The accent ramp is *re-pointed* in dark mode, not merely darkened: the tint
// end (50-200) becomes deep navy-blues and the ink end (700-900) becomes light
// blues, so the `bg-accent-50` + `text-accent-700` idiom stays legible in both
// themes. See index.css.

const channel = (name) => `rgb(var(${name}) / <alpha-value>)`;

const ramp = (prefix) =>
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].reduce((out, step) => {
    out[step] = channel(`--c-${prefix}-${step}`);
    return out;
  }, {});

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: channel('--c-paper'),
        surface: channel('--c-surface'),
        'surface-2': channel('--c-surface-2'),
        ink: channel('--c-ink'),
        mute: channel('--c-mute'),
        line: channel('--c-line'),

        accent: ramp('accent'),
        teal: ramp('teal'),

        // The wordmark navy, straight off the artwork. Fixed in both themes —
        // it is a brand constant, not a surface.
        navy: '#072B5F',

        'accent-ink': channel('--c-accent-700'),
        good: channel('--c-good'),
        wait: channel('--c-wait'),
        bad: channel('--c-bad'),

        // `brand` stays an alias of accent so legacy brand-* classes resolve
        // to the brand blue rather than Tailwind's default palette.
        brand: ramp('accent'),
      },

      fontFamily: {
        // Plus Jakarta Sans carries the wordmark's geometric, slightly rounded
        // character; Inter does the small-size UI work it is built for.
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        'none': '0',
        'sm': '6px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
        '3xl': '32px',
      },

      boxShadow: {
        // Defined as CSS variables so dark mode can deepen them. Key names are
        // unchanged from the previous system, so no call site breaks.
        'hairline': 'var(--sh-hairline)',
        'sm': 'var(--sh-sm)',
        DEFAULT: 'var(--sh-md)',
        'soft': 'var(--sh-soft)',
        'md': 'var(--sh-md)',
        'lg': 'var(--sh-lg)',
        'xl': 'var(--sh-xl)',
        'glow-accent': 'var(--sh-glow-accent)',
        'glow-teal': 'var(--sh-glow-teal)',
        'rim': 'var(--sh-rim)',
        'none': 'none',
      },

      letterSpacing: {
        tightest: '-0.04em',
      },

      keyframes: {
        'brand-drift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },

      animation: {
        // Slow gradient drift for large brand surfaces.
        'brand-drift': 'brand-drift 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
