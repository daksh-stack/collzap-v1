import { create } from 'zustand';

const STORAGE_KEY = 'collzap-theme';
const THEME_COLOR = { light: '#F4F7FB', dark: '#0A1428' };

/**
 * Read the stored preference. Deliberately a plain string rather than a
 * Zustand `persist` envelope, so the pre-paint script in index.html can read
 * it in one line without parsing JSON.
 *
 * Default is light: first visit is always the light theme, regardless of OS.
 */
function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function apply(theme) {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLOR[theme]);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode: the class is still applied, the choice just won't persist.
  }
}

export const useThemeStore = create((set, get) => ({
  theme: readStored(),

  setTheme: (theme) => {
    const next = theme === 'dark' ? 'dark' : 'light';
    apply(next);
    set({ theme: next });
  },

  toggleTheme: () => {
    get().setTheme(get().theme === 'dark' ? 'light' : 'dark');
  },

  /**
   * Re-assert the class on boot. The inline script already did this, but this
   * keeps React's state and the DOM in sync if storage changed in another tab.
   */
  syncTheme: () => {
    const stored = readStored();
    apply(stored);
    set({ theme: stored });
  },
}));

export default useThemeStore;
