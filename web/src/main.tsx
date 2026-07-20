import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { ThemeProvider } from '@/theme/context';
import '@/styles/globals.css';

// The app owns scroll (workspace expand pins the shell); stop the browser from
// re-applying its own restored scroll position asynchronously after reloads.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
