import type { ChatContext, ChatService } from './types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function reply(last: string, ctx: ChatContext): string {
  const anchor = ctx.title
    ? `You're looking at "${ctx.title}", so I'd ground my answer in that document. `
    : 'Open a file and I can ground my answer in it. ';
  return (
    `${anchor}This is a mock assistant behind a clean ChatService interface — ` +
    `point it at the real API (VITE_ATLAS_URL) and this same UI streams live answers with citations. ` +
    `You asked: "${last.trim() || '…'}".`
  );
}

/** In-process mock: streams a canned reply word-by-word, grounded on the selected file. */
export const mockChat: ChatService = {
  async *stream(history, ctx) {
    if (ctx.docId) yield { type: 'sources', sources: [{ docId: ctx.docId, title: ctx.title ?? ctx.docId, snippet: '' }] };
    const last = history[history.length - 1]?.content ?? '';
    for (const word of reply(last, ctx).split(' ')) {
      await sleep(18);
      yield { type: 'delta', content: word + ' ' };
    }
    yield { type: 'done' };
  },
};

/** Swap for a wire client when the backend lands; the UI never changes. */
export const chat: ChatService = mockChat;
