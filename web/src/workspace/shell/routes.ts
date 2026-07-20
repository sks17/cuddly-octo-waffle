import type { WorkspaceDestination } from './types';
import { destinationForCollection } from '../content/destination';

interface RouteEntry {
  path: string; // trimmed, no leading/trailing slash
  resolve: () => WorkspaceDestination | null; // null ⇒ centered
}

/**
 * Pure registry mapping a route to a workspace destination. Routes never carry
 * their own explorer logic — they resolve to a destination the shell applies.
 */
export const ROUTE_DESTINATIONS: RouteEntry[] = [
  { path: '', resolve: () => null }, // '/' ⇒ centered
  { path: 'projects', resolve: () => destinationForCollection('projects', 'Projects') },
  { path: 'experiences', resolve: () => destinationForCollection('experiences', 'Experiences') },
  { path: 'links', resolve: () => destinationForCollection('links', 'Links') }, // compiled page
  { path: 'drafts', resolve: () => destinationForCollection('drafts', 'Drafts') },
  { path: 'blogs', resolve: () => destinationForCollection('blogs', 'Blogs') },
  { path: 'contact', resolve: () => ({ type: 'page', component: 'contact', title: 'Contact', layout: 'standard' }) },
];

export function resolveRoute(pathname: string): WorkspaceDestination | null {
  const seg = pathname.replace(/^\/+|\/+$/g, '');
  const entry = ROUTE_DESTINATIONS.find((r) => r.path === seg);
  return entry ? entry.resolve() : null;
}
