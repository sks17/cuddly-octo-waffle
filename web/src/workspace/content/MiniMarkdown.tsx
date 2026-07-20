import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface MarkdownProps {
  source: string;
  /** Called when an internal (non-http) link — a bare document id — is clicked. */
  onDocLink?: (docId: string) => void;
}

const isExternal = (href: string) => /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('#');

/** Inline spans: `code`, **bold**, *italic* / _italic_, [label](url|docId), bare URLs. */
function inline(text: string, onDocLink?: (id: string) => void): ReactNode[] {
  const nodes: ReactNode[] = [];
  // The bare-URL branch is last: an explicit [label](href) always wins at the same position.
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<>()]+)/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) {
      nodes.push(<code key={k++} className="md-ic">{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith('**')) {
      nodes.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('*') || tok.startsWith('_')) {
      nodes.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith('http')) {
      // Sentence punctuation that trails a bare URL belongs to the sentence.
      const url = tok.replace(/[.,;:!?'"]+$/, '');
      nodes.push(
        <a key={k++} href={url} target="_blank" rel="noreferrer" className="md-a">
          {url}
        </a>,
      );
      last = m.index + url.length;
      continue;
    } else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      const label = lm[1];
      const href = lm[2];
      if (href.startsWith('/')) {
        // An in-app route (e.g. `/contact`) — the Atlas can point at site pages.
        nodes.push(
          <Link key={k++} to={href} className="md-a">
            {label}
          </Link>,
        );
      } else if (!isExternal(href) && onDocLink) {
        const id = href.replace(/^\.?\//, '');
        nodes.push(
          <button key={k++} type="button" className="md-a md-doclink" onClick={() => onDocLink(id)}>
            {label}
          </button>,
        );
      } else {
        nodes.push(
          <a key={k++} href={href} target="_blank" rel="noreferrer" className="md-a">
            {label}
          </a>,
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/**
 * A deliberately tiny Markdown renderer — headings, unordered lists, fenced code
 * and paragraphs (inline code/bold/italic/links). Internal links open in-workspace.
 */
export function MiniMarkdown({ source, onDocLink }: MarkdownProps) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.startsWith('```')) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith('```')) buf.push(lines[i++]!);
      i++; // closing fence
      blocks.push(
        <pre key={key++} className="md-code">
          {buf.join('\n')}
        </pre>,
      );
      continue;
    }

    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const Tag = `h${Math.min(h[1].length + 1, 6)}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <Tag key={key++} className="md-h">
          {inline(h[2], onDocLink)}
        </Tag>,
      );
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]!)) items.push(lines[i++]!.replace(/^\s*[-*]\s+/, ''));
      blocks.push(
        <ul key={key++} className="md-ul">
          {items.map((t, j) => (
            <li key={j}>{inline(t, onDocLink)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !lines[i]!.startsWith('#') &&
      !lines[i]!.startsWith('```') &&
      !/^\s*[-*]\s+/.test(lines[i]!)
    ) {
      para.push(lines[i++]!);
    }
    blocks.push(
      <p key={key++} className="md-p">
        {inline(para.join(' '), onDocLink)}
      </p>,
    );
  }

  return <>{blocks}</>;
}
