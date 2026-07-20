import type { DockviewApi } from 'dockview';

/**
 * Module-level handles that decouple the controller from React/Dockview:
 * the controller talks to Dockview through this ref, and reads the live
 * workspace element for pointer→workspace coordinate mapping during drags.
 */
let dockApi: DockviewApi | null = null;
let workspaceEl: HTMLElement | null = null;
let rootEl: HTMLElement | null = null;

export const setDockApi = (api: DockviewApi | null): void => {
  dockApi = api;
};
export const getDockApi = (): DockviewApi | null => dockApi;

/** The stage (floating layer): pointer→workspace coordinate origin. */
export const setWorkspaceEl = (el: HTMLElement | null): void => {
  workspaceEl = el;
};
export const getWorkspaceEl = (): HTMLElement | null => workspaceEl;

/** The workspace root: used to compute the tab-organizer hitbox (root top → stage top). */
export const setRootEl = (el: HTMLElement | null): void => {
  rootEl = el;
};
export const getRootEl = (): HTMLElement | null => rootEl;

/**
 * An explicit, always-present overlay spanning the tab strip. Used as the
 * tab-dock hit-test geometry (client coords) so docking is precise, works with
 * zero tabs, and — crucially — a document/panel BODY never qualifies as a tab
 * target (only this strip does).
 */
let tabStripEl: HTMLElement | null = null;
export const setTabStripEl = (el: HTMLElement | null): void => {
  tabStripEl = el;
};
export const getTabStripEl = (): HTMLElement | null => tabStripEl;

/**
 * The most recently *clicked* scroll region — wheel scrolling is directed here
 * (focus-follows-click, not hover). Null until the user clicks a panel/CLI.
 */
export type ScrollFocus = { kind: 'panel'; id: string } | { kind: 'cli' } | null;
let scrollFocus: ScrollFocus = null;
export const setScrollFocus = (f: ScrollFocus): void => {
  scrollFocus = f;
};
export const getScrollFocus = (): ScrollFocus => scrollFocus;

/** Chrome level for panels: 'debug' shows the id/mode meta + actions; 'content' is borderless. */
let chrome: 'debug' | 'content' = 'debug';
export const setChrome = (c: 'debug' | 'content'): void => {
  chrome = c;
};
export const getChrome = (): 'debug' | 'content' => chrome;
