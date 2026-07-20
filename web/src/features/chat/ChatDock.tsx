import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useShellStore } from '@/workspace/shell/store';
import type { ChatMessage } from '@/core/chat/types';
import { chatCtl, useChatStore } from './store';

function Bubble({ m }: { m: ChatMessage }) {
  const user = m.role === 'user';
  const typing = m.pending && !m.content;
  return (
    <div className={cn('flex', user ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
          user ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface text-foreground',
        )}
      >
        {typing ? <span className="inline-flex gap-1 py-0.5 [&>span]:size-1.5 [&>span]:animate-pulse [&>span]:rounded-full [&>span]:bg-current"><span /><span /><span /></span> : m.content}
      </div>
    </div>
  );
}

/**
 * Persistent chat dock, bottom-right. Expands upward from its button, grounded on
 * the currently selected file. Mock service now; swap for the real API later.
 */
export function ChatDock() {
  const open = useChatStore((s) => s.open);
  const messages = useChatStore((s) => s.messages);
  const streaming = useChatStore((s) => s.streaming);
  const selectedDoc = useShellStore((s) => s.selectedDoc);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Stick to the bottom as tokens stream in.
  useEffect(() => {
    if (!open) return;
    const v = listRef.current?.querySelector<HTMLElement>('.wp-scroll__viewport');
    if (v) requestAnimationFrame(() => (v.scrollTop = v.scrollHeight));
  }, [messages, open]);

  const submit = () => {
    const text = draft;
    if (!text.trim() || streaming) return;
    setDraft('');
    void chatCtl.send(text, selectedDoc ? { docId: selectedDoc.id, title: selectedDoc.title } : {});
  };

  const panelStyle: CSSProperties = { height: 'min(32rem, calc(100dvh - 8rem))' };

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2"
      style={{ right: 'max(1rem, env(safe-area-inset-right))', bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {open && (
        <div
          className="flex w-[min(24rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated text-foreground shadow-[0_24px_70px_-18px_var(--panel-shadow)]"
          style={panelStyle}
          role="dialog"
          aria-label="Assistant"
        >
          <header className="flex items-center gap-2 border-b border-border px-3.5 py-2.5">
            <Sparkles size={15} className="flex-none text-brand" />
            <span className="text-[13px] font-semibold">Assistant</span>
            {selectedDoc && (
              <span className="ml-1 max-w-[42%] truncate rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                {selectedDoc.title}
              </span>
            )}
            <button
              onClick={chatCtl.close}
              className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close chat"
            >
              <X size={15} />
            </button>
          </header>

          <div ref={listRef} className="min-h-0 flex-1">
            <ScrollArea className="h-full" viewportClassName="flex flex-col gap-2.5 p-3">
              {messages.length === 0 && (
                <p className="m-auto max-w-[80%] text-center text-[12.5px] text-muted-foreground">
                  Ask about anything in the workspace{selectedDoc ? ` — I'm grounded on “${selectedDoc.title}”.` : '.'}
                </p>
              )}
              {messages.map((m) => (
                <Bubble key={m.id} m={m} />
              ))}
            </ScrollArea>
          </div>

          <div className="border-t border-border p-2.5">
            <div className="flex items-end gap-2 rounded-lg border border-border bg-background/50 px-2 py-1.5 focus-within:border-brand/50">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder="Ask about this workspace…"
                spellCheck={false}
                className="max-h-28 flex-1 resize-none bg-transparent text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={submit}
                disabled={!draft.trim() || streaming}
                className="flex size-7 flex-none items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={chatCtl.toggle}
        className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_-8px_var(--panel-shadow)] transition-transform hover:scale-105"
        aria-label={open ? 'Close chat' : 'Open chat'}
        title="Assistant"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}
