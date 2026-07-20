import { useWorkspaceStore } from '../store';
import { workspace } from '../controller';

const TREE = [
  '📁 src',
  '  📄 index.tsx',
  '  📁 workspace',
  '    📄 controller.ts',
  '    📄 drag.ts',
  '    📄 store.ts',
  '📁 public',
  '📄 README.md',
];

const TERM_LINES = [
  '$ workspace --status',
  'dockview: ready · panels: live',
  '$ echo "drag a tab out to float it"',
  'drag a tab out to float it',
  '$ _',
];

/**
 * Placeholder, per-type content for the debug workspace (/workspace). Notes text
 * is lifted to the store so it survives tabbed↔floating remounts; buttons/inputs
 * stay independently interactive. Kept here as an archive of the debug surface.
 */
export function DebugPanelContent({ panelId }: { panelId: string }) {
  const p = useWorkspaceStore((s) => s.panels[panelId]);
  const text = useWorkspaceStore((s) => (s.panels[panelId]?.data?.text as string) ?? '');
  if (!p) return null;

  switch (p.type) {
    case 'notes':
      return (
        <textarea
          className="wp-notes"
          value={text}
          onChange={(e) => workspace.setData(panelId, 'text', e.target.value)}
          placeholder="Scratch notes… (persisted per panel; survives dragging out to float)"
          spellCheck={false}
        />
      );
    case 'file-browser':
      return (
        <ul className="wp-tree">
          {TREE.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      );
    case 'preview':
      return (
        <div className="wp-preview">
          <span>preview surface</span>
        </div>
      );
    case 'terminal':
      return <pre className="wp-term">{TERM_LINES.join('\n')}</pre>;
    case 'settings':
      return (
        <div className="wp-settings">
          {['Wallpaper', 'Snap zones', 'Autosave layout'].map((label, i) => (
            <label key={label} className="wp-setting">
              <span>{label}</span>
              <span className={`wp-switch ${i !== 1 ? 'on' : ''}`} aria-hidden="true" />
            </label>
          ))}
        </div>
      );
    default:
      return null;
  }
}
