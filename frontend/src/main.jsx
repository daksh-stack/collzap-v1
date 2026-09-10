import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-center" toastOptions={toastOptions} />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
