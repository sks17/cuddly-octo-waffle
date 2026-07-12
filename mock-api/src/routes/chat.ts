/**
 * Chat: OpenAI-style SSE stream. The heavy RAG/context comes from the GraphView
 * side (here: `retrieve.search`), exactly as in prod where the chat backend
 * pulls context from the GraphView API before answering.
 */
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { ChatRequest } from '../types.js';
import { search } from '../retrieve.js';
import { sleep } from '../generators.js';

const chat = new Hono();

function buildReply(question: string, cited: string[]): string {
  const q = question.trim() || 'your question';
  const grounding = cited.length
    ? `I pulled context from the graph — ${cited.join(', ')} — and grounded the answer on those. `
    : `I found no strongly related documents in the graph, so this is a general answer. `;
  return `You asked: "${q}". ${grounding}This is a mock streamed response from the local dev API; wire the real OpenAI-backed endpoint in and the shape stays identical.`;
}

chat.post('/', async (c) => {
  const body = await c.req.json<ChatRequest>().catch(() => ({ messages: [] }) as ChatRequest);
  const lastUser = [...(body.messages ?? [])].reverse().find((m) => m.role === 'user')?.content ?? '';
  const query = body.docId ? `${lastUser} ${body.docId}` : lastUser;
  const hits = search(query, 3);
  const reply = buildReply(lastUser, hits.map((h) => h.title));

  return streamSSE(c, async (stream) => {
    // Announce retrieved context first (a real client can show sources).
    await stream.writeSSE({ event: 'context', data: JSON.stringify({ hits }) });
    for (const token of reply.split(/(\s+)/)) {
      if (!token) continue;
      await stream.writeSSE({ data: JSON.stringify({ choices: [{ delta: { content: token } }] }) });
      await sleep(16);
    }
    await stream.writeSSE({ data: '[DONE]' });
  });
});

export default chat;
