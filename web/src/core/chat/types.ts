export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  pending?: boolean;
}

/** Anchor document that grounds the answer (RAG). */
export interface ChatContext {
  docId?: string;
  title?: string;
}

export interface ChatSource {
  docId: string;
  title: string;
  snippet: string;
}

export type ChatChunk =
  | { type: 'sources'; sources: ChatSource[] }
  | { type: 'delta'; content: string }
  | { type: 'done' };

/**
 * The chat port. A streaming interface so the mock and a real SSE backend are
 * interchangeable — the UI only consumes the async chunk stream.
 */
export interface ChatService {
  stream(history: ChatMessage[], ctx: ChatContext, signal?: AbortSignal): AsyncIterable<ChatChunk>;
}
