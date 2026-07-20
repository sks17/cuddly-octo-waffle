import { useState } from 'react';
import { runCommand } from '../cli';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Line {
  kind: 'input' | 'ok' | 'err';
  text: string;
}

/**
 * Persistent frontend command line — always mounted (survives panel focus/mode
 * changes), with history (↑/↓), validation, error messages and a `help` command.
 * Debug-only: the content workspace does not mount this (see [[Workspace]]).
 */
export function CommandLine() {
  const [log, setLog] = useState<Line[]>([{ kind: 'ok', text: 'workspace console — type "help" for commands' }]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      const v = document.querySelector<HTMLElement>('.wp-cli__log .wp-scroll__viewport');
      if (v) v.scrollTop = v.scrollHeight;
    });
  };

  const submit = () => {
    const cmd = value.trim();
    if (!cmd) return;
    const result = runCommand(cmd);
    setLog((l) => [
      ...l,
      { kind: 'input', text: `› ${cmd}` },
      ...result.lines.map((text) => ({ kind: result.ok ? 'ok' : 'err', text }) as Line),
    ]);
    setHistory((h) => [...h, cmd]);
    setHistIdx(-1);
    setValue('');
    scrollToEnd();
  };

  const navHistory = (dir: -1 | 1) => {
    if (history.length === 0) return;
    const base = histIdx === -1 ? history.length : histIdx;
    const idx = Math.max(0, Math.min(history.length, base + dir));
    setHistIdx(idx);
    setValue(idx >= history.length ? '' : history[idx]!);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navHistory(1);
    }
  };

  return (
    <div className="wp-cli" aria-label="Workspace command line">
      <ScrollArea className="wp-cli__log">
        {log.map((l, i) => (
          <div key={i} className={`wp-cli__line wp-cli__line--${l.kind}`}>
            {l.text}
          </div>
        ))}
      </ScrollArea>
      <div className="wp-cli__prompt">
        <span className="wp-cli__caret">›</span>
        <input
          className="wp-cli__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='e.g. open notes · list · snap notes-1 bottom-right · maximize notes-1'
          spellCheck={false}
          autoComplete="off"
          aria-label="command input"
        />
      </div>
    </div>
  );
}
