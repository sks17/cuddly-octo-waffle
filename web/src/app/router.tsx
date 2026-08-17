import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkspaceRoute } from '@/app/WorkspaceRoute';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { WorkspacePage } from '@/pages/WorkspacePage';

// Every content route resolves into a state of the ONE shared workspace, so they
// all render <WorkspaceRoute/> (which syncs the route → destination). The debug
// workspace stays standalone (outside AppLayout) so the two never coexist.
export const router = createBrowserRouter([
  { path: '/workspace', element: <WorkspacePage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <WorkspaceRoute /> },
      { path: 'projects', element: <WorkspaceRoute /> },
      { path: 'experiences', element: <WorkspaceRoute /> },
      { path: 'research', element: <WorkspaceRoute /> },
      { path: 'links', element: <WorkspaceRoute /> },
      { path: 'drafts', element: <WorkspaceRoute /> },
      { path: 'contact', element: <WorkspaceRoute /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
