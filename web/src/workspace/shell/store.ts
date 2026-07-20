import { create } from 'zustand';
import { DEFAULT_EXPLORER_W, type ShellState } from './types';

/**
 * Presentation/destination/explorer state for the shared workspace. Mutations
 * flow through the `shell` controller. Kept separate from the panel-level
 * `useWorkspaceStore` (which owns tabs/floating/snap).
 */
export const useShellStore = create<ShellState>()(() => ({
  presentation: 'centered',
  layout: 'standard',
  destination: null,
  explorer: { openFolders: {}, selectedFileId: null, width: DEFAULT_EXPLORER_W, scrollTop: 0 },
  explorerOpen: false,
  contentScrollTop: 0,
  transitioning: false,
  selectedDoc: null,
}));
