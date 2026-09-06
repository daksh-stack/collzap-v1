/** @type {import('tailwindcss').Config} */

// Warm paper palette. One ink, one accent, one danger.
const accent = {
  50:  '#FBF1EA',
  100: '#F5DECD',
  200: '#EBBE9F',
  300: '#DE9A6E',
  400: '#D17B47',
  500: '#C45C26', // hostel-bulb orange
  600: '#AC4C1C',
  700: '#8A3510', // accent-ink
  800: '#6E2B0F',
  900: '#57240F',
  950: '#301006',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F4EFE6',
        ink: '#1A1714',
        mute: '#6B645C',
        line: '#DDD4C8',
        accent,
        'accent-ink': '#8A3510',
        good: '#2F6B4F',
        wait: '#B5812F',
        bad: '#A33B2B',
        // `brand` is kept as an alias of accent so existing brand-* classes
        // keep working instead of falling back to the old blue.
        brand: accent,
      },
      fontFamily: {
        // Typography does the branding: display face for headlines,
        // a different face for UI.
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'none': '0',
        'sm': '3px',
        DEFAULT: '6px',
        'md': '6px',
        'lg': '10px',
        // No 24px blobs — anything asking for bigger is capped at 10px.
        'xl': '10px',
        '2xl': '10px',
        '3xl': '10px',
      },
      boxShadow: {
        // One hairline, one soft. No stacked colored shadows.
        'hairline': '0 0 0 1px rgb(26 23 20 / 0.08)',
        'sm': '0 0 0 1px rgb(26 23 20 / 0.06)',
        DEFAULT: '0 1px 2px rgb(26 23 20 / 0.06), 0 0 0 1px rgb(26 23 20 / 0.05)',
        'soft': '0 2px 8px rgb(26 23 20 / 0.07), 0 0 0 1px rgb(26 23 20 / 0.05)',
        'md': '0 2px 8px rgb(26 23 20 / 0.07), 0 0 0 1px rgb(26 23 20 / 0.05)',
        'lg': '0 6px 20px rgb(26 23 20 / 0.09), 0 0 0 1px rgb(26 23 20 / 0.05)',
        'xl': '0 6px 20px rgb(26 23 20 / 0.09), 0 0 0 1px rgb(26 23 20 / 0.05)',
        'none': 'none',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
}
