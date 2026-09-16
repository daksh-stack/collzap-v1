import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';

// Toasts read from the same tokens as the rest of the app, so they follow the
// theme without a second palette.
const toastOptions = {
  duration: 4000,
  style: {
    background: 'rgb(var(--c-surface))',
    color: 'rgb(var(--c-ink))',
    border: '1px solid rgb(var(--c-line))',
    borderRadius: '10px',
    boxShadow: 'var(--sh-lg)',
    fontSize: '13px',
    padding: '10px 14px',
    maxWidth: '420px',
  },
  success: { iconTheme: { primary: '#06C8AD', secondary: '#FFFFFF' } },
  error: { iconTheme: { primary: 'rgb(var(--c-bad))', secondary: '#FFFFFF' } },
};

/**
 * Everything below the router, shared by both entries: `main.jsx` wraps this in
 * a BrowserRouter, `entry-server.jsx` wraps it in a StaticRouter. Keeping the
 * tree in one place is what makes the prerendered HTML match what ships.
 *
 * HelmetProvider is a no-op Fragment on React 19 (the library short-circuits
 * itself), and the head tags actually reach the document through React 19's
 * own metadata hoisting. It stays here only so swapping head libraries later
 * doesn't mean touching two entries.
 */
export default function AppRoot() {
  return (
    <HelmetProvider>
      <App />
      <Toaster position="top-center" toastOptions={toastOptions} />
    </HelmetProvider>
  );
}
