import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoot from './AppRoot.jsx';
import './index.css';

// `createRoot`, not `hydrateRoot`, even though the public routes ship
// prerendered HTML (see scripts/prerender.mjs). This is deliberate: four things
// legitimately differ between the prerender and the first client render —
// usePrimaryCta() (CTA text and href change once signed in), ThemeToggle (the
// server always renders the light branch), useReducedMotion() (flips `initial`
// on every animated element), and AuthGuard redirecting a signed-in user away
// from /login. React recovers from text mismatches by re-rendering the root
// anyway, so hydration would pay its cost and frequently land where createRoot
// starts. Discarding the server DOM also leaves the prerender free to rewrite
// the HTML string, which the first-paint work depends on.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoot />
    </BrowserRouter>
  </React.StrictMode>
);
