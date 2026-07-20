import type { ChatMessage } from './types';

export const CHAT_STORAGE_KEY = 'far-flare:chat:v1';

export interface PersistedChat {
  version: 1;
  open: boolean;
  messages: ChatMessage[];
}

export function saveChat(data: PersistedChat): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function loadChat(): PersistedChat | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PersistedChat;
    if (p && p.version === 1 && Array.isArray(p.messages) && typeof p.open === 'boolean') return p;
    return null;
  } catch {
    return null;
  }
}
