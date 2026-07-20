import { create } from 'zustand';
import type { ChatContext, ChatMessage } from '@/core/chat/types';
import { chat } from '@/core/chat/mock';
import { loadChat, saveChat } from '@/core/chat/persistence';

interface ChatState {
  open: boolean;
  messages: ChatMessage[];
  streaming: boolean;
}

const persisted = loadChat();
export const useChatStore = create<ChatState>()(() => ({
  open: persisted?.open ?? false,
  messages: persisted?.messages ?? [],
  streaming: false,
}));

// Debounced persistence of open/closed + history.
let saveTimer: ReturnType<typeof setTimeout> | null = null;
useChatStore.subscribe((s) => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveChat({ version: 1, open: s.open, messages: s.messages }), 250);
});

let idc = 0;
const uid = () => `${Date.now().toString(36)}-${++idc}`;

export const chatCtl = {
  toggle: () => useChatStore.setState((s) => ({ open: !s.open })),
  close: () => useChatStore.setState({ open: false }),
  clear: () => useChatStore.setState({ messages: [] }),

  async send(text: string, ctx: ChatContext): Promise<void> {
    const content = text.trim();
    if (!content || useChatStore.getState().streaming) return;
    const user: ChatMessage = { id: uid(), role: 'user', content, createdAt: Date.now() };
    const pendingId = uid();
    const pending: ChatMessage = { id: pendingId, role: 'assistant', content: '', createdAt: Date.now(), pending: true };
    const history = [...useChatStore.getState().messages.filter((m) => !m.pending), user];
    useChatStore.setState((s) => ({ messages: [...s.messages, user, pending], streaming: true }));
    try {
      for await (const chunk of chat.stream(history, ctx)) {
        if (chunk.type === 'delta') {
          useChatStore.setState((s) => ({
            messages: s.messages.map((m) => (m.id === pendingId ? { ...m, content: m.content + chunk.content } : m)),
          }));
        }
      }
    } finally {
      useChatStore.setState((s) => ({
        messages: s.messages.map((m) => (m.id === pendingId ? { ...m, pending: false } : m)),
        streaming: false,
      }));
    }
  },
};
