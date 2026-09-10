import { useThemeStore } from '../store/useThemeStore';

/**
 * Brand colours for the places that can't use a Tailwind class: SVG fill and
 * stroke props, and canvas paint calls.
 *
 * These mirror the tokens in index.css. If you change one, change both.
 */

// Sampled from the artwork in /public — these are brand constants and do not
// change with the theme.
export const BRAND = {
  navy: '#072B5F',
  gradient: ['#0B5CC7', '#0093D2', '#00B8BC', '#06C8AD'],
  blue: '#0B5CC7',
  azure: '#0093D2',
  cyan: '#00B8BC',
  teal: '#06C8AD',
};

const LIGHT = {
  paper: '#F4F7FB',
  surface: '#FFFFFF',
  surface2: '#EEF3F9',
  ink: '#0A1F44',
  mute: '#4A5568',
  line: '#DDE6F1',
  accent: '#0B63C9',
  accentSoft: '#B6D4FA',
  good: '#089082',
  wait: '#B0770F',
  bad: '#C0392B',
};

const DARK = {
  paper: '#0A1428',
  surface: '#101E38',
  surface2: '#152845',
  ink: '#E8F0FE',
  mute: '#9FB3D0',
  line: '#1E3355',
  accent: '#2B7FE0',
  accentSoft: '#173257',
  good: '#16C9B0',
  wait: '#E0A83A',
  bad: '#F0705E',
};

export function paletteFor(theme) {
  return theme === 'dark' ? DARK : LIGHT;
}

/** Theme-aware palette for SVG and canvas. Re-renders on theme change. */
export function useThemePalette() {
  const theme = useThemeStore((s) => s.theme);
  return paletteFor(theme);
}

export default useThemePalette;
