import { PANEL_TYPES, type PanelType, type SnapRegion } from './types';
import { workspace } from './controller';

export interface CommandResult {
  ok: boolean;
  lines: string[];
}

const SNAP_REGIONS: SnapRegion[] = ['left', 'right', 'bottom-left', 'bottom-right'];

const HELP: [string, string][] = [
  ['help', 'List all commands.'],
  ['open <type> [id]', `Create a panel. type: ${PANEL_TYPES.join(' | ')}.`],
  ['close <id>', 'Close a panel.'],
  ['focus <id>', 'Bring a panel to the front and mark it active.'],
  ['float <id>', 'Convert a tabbed/snapped panel into a floating panel.'],
  ['tab <id>', 'Move a panel into the top tab bar.'],
  ['snap <id> <left|right|bottom-left|bottom-right>', 'Snap a panel to a region.'],
  ['maximize <id>', 'Maximize a panel to fill the workspace.'],
  ['restore <id>', 'Restore a panel from maximized/snapped mode.'],
  ['move <id> <x> <y>', 'Move a floating panel to workspace coordinates.'],
  ['resize <id> <w> <h>', 'Resize a floating panel.'],
  ['list', 'List every open panel and its state.'],
  ['reset-layout', 'Close panels and restore the default layout.'],
  ['save-layout', 'Persist the current layout locally.'],
  ['load-layout', 'Restore the most recently persisted layout.'],
];

const ok = (...lines: string[]): CommandResult => ({ ok: true, lines });
const err = (...lines: string[]): CommandResult => ({ ok: false, lines });

const needId = (id: string | undefined, fn: (id: string) => CommandResult): CommandResult =>
  id ? fn(id) : err('missing panel id');

export function runCommand(input: string): CommandResult {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return ok();
  const [cmd, ...args] = parts;

  try {
    switch (cmd) {
      case 'help':
        return ok('commands:', ...HELP.map(([c, d]) => `  ${c.padEnd(48)} ${d}`));

      case 'open': {
        const type = args[0];
        if (!type) return err('usage: open <type> [id]');
        if (!(PANEL_TYPES as readonly string[]).includes(type))
          return err(`unknown panel type "${type}" — try: ${PANEL_TYPES.join(', ')}`);
        const id = workspace.openPanel(type as PanelType, args[1]);
        return ok(`opened ${id} (${type})`);
      }
      case 'close':
        return needId(args[0], (id) => (workspace.closePanel(id), ok(`closed ${id}`)));
      case 'focus':
        return needId(args[0], (id) => (workspace.focusPanel(id), ok(`focused ${id}`)));
      case 'float':
        return needId(args[0], (id) => (workspace.floatPanel(id), ok(`${id} → floating`)));
      case 'tab':
        return needId(args[0], (id) => (workspace.tabPanel(id), ok(`${id} → tabbed`)));

      case 'snap': {
        if (!args[0]) return err('usage: snap <id> <left|right|bottom-left|bottom-right>');
        const region = args[1];
        if (!region || !SNAP_REGIONS.includes(region as SnapRegion))
          return err(`unsupported snap location — try: ${SNAP_REGIONS.join(', ')}`);
        workspace.snapPanel(args[0], region as SnapRegion);
        return ok(`${args[0]} → snapped-${region}`);
      }
      case 'maximize':
        return needId(args[0], (id) => (workspace.maximizePanel(id), ok(`maximized ${id}`)));
      case 'restore':
        return needId(args[0], (id) => (workspace.restorePanel(id), ok(`restored ${id}`)));

      case 'move': {
        if (args.length < 3) return err('usage: move <id> <x> <y>');
        const x = Number(args[1]);
        const y = Number(args[2]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return err('move: x and y must be numbers');
        workspace.movePanel(args[0]!, x, y);
        return ok(`moved ${args[0]} → (${Math.round(x)}, ${Math.round(y)})`);
      }
      case 'resize': {
        if (args.length < 3) return err('usage: resize <id> <width> <height>');
        const w = Number(args[1]);
        const h = Number(args[2]);
        if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0)
          return err('resize: width and height must be positive numbers');
        workspace.resizePanel(args[0]!, w, h);
        return ok(`resized ${args[0]} → ${Math.round(w)}×${Math.round(h)}`);
      }

      case 'list':
        return listPanels();
      case 'reset-layout':
        return (workspace.resetLayout(), ok('layout reset to default'));
      case 'save-layout':
        return (workspace.saveLayout(), ok('layout saved'));
      case 'load-layout':
        return (workspace.loadLayout(), ok('layout loaded'));

      default:
        return err(`unknown command: "${cmd}" — type "help" for the list`);
    }
  } catch (e) {
    return err((e as Error)?.message ?? String(e));
  }
}

function listPanels(): CommandResult {
  const panels = workspace.listPanels();
  if (panels.length === 0) return ok('no open panels');
  const rows = panels.map((p) => {
    const pos = p.x != null && p.y != null ? `(${p.x},${p.y})` : '—';
    const dim = p.width != null && p.height != null ? `${p.width}×${p.height}` : '—';
    return (
      `  ${p.id.padEnd(14)} ${p.type.padEnd(13)} ${p.mode.padEnd(20)} ` +
      `pos ${pos.padEnd(11)} size ${dim.padEnd(10)} ` +
      `${p.isActive ? 'active' : '      '} ${p.mode === 'maximized' ? '[max]' : ''}`
    );
  });
  return ok(`${panels.length} panel(s):`, ...rows);
}
