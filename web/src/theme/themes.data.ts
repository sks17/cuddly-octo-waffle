import type { ThemeDefinition } from './types';

/** The site's bespoke default (today's "Ink" look), first in the list. */
export const DEFAULT_THEME_ID = 'ink';

/**
 * `ink` is the house theme; the rest are Monkeytype-inspired palettes ported
 * from the authoritative Monkeytype theme definitions. The 13 semantic colors
 * are derived from these four/five values (see derive.ts).
 */
export const THEMES: ThemeDefinition[] = [
  { id: 'ink', name: 'ink', appearance: 'dark', palette: { bg: '#08080b', main: '#8b8cf7', sub: '#9aa0ac', text: '#fafafa', error: '#ef4444' } },
  { id: 'serika-dark', name: 'serika dark', appearance: 'dark', palette: { bg: '#323437', main: '#e2b714', sub: '#646669', text: '#d1d0c5', error: '#ca4754' } },
  { id: 'serika', name: 'serika', appearance: 'light', palette: { bg: '#e1e1e3', main: '#e2b714', sub: '#aaaeb3', text: '#323437', error: '#da3333' } },
  { id: 'dracula', name: 'dracula', appearance: 'dark', palette: { bg: '#282a36', main: '#bd93f9', sub: '#6272a4', text: '#f8f8f2', error: '#ff5555' } },
  { id: 'nord', name: 'nord', appearance: 'dark', palette: { bg: '#242933', main: '#88c0d0', sub: '#929aaa', text: '#d8dee9', error: '#bf616a' } },
  { id: 'nord-light', name: 'nord light', appearance: 'light', palette: { bg: '#eceff4', main: '#8fbcbb', sub: '#6a7791', text: '#4c566a', error: '#bf616a' } },
  { id: 'gruvbox-dark', name: 'gruvbox dark', appearance: 'dark', palette: { bg: '#282828', main: '#d79921', sub: '#665c54', text: '#ebdbb2', error: '#fb4934' } },
  { id: 'gruvbox-light', name: 'gruvbox light', appearance: 'light', palette: { bg: '#fbf1c7', main: '#689d6a', sub: '#a89984', text: '#3c3836', error: '#cc241d' } },
  { id: 'catppuccin', name: 'catppuccin', appearance: 'dark', palette: { bg: '#1e1e2e', main: '#cba6f7', sub: '#7f849c', text: '#cdd6f4', error: '#f38ba8' } },
  { id: 'solarized-dark', name: 'solarized dark', appearance: 'dark', palette: { bg: '#002b36', main: '#859900', sub: '#657b83', text: '#93a1a1', error: '#d33682' } },
  { id: 'solarized-light', name: 'solarized light', appearance: 'light', palette: { bg: '#fdf6e3', main: '#859900', sub: '#93a1a1', text: '#586e75', error: '#d33682' } },
  { id: 'solarized-osaka', name: 'solarized osaka', appearance: 'dark', palette: { bg: '#00141a', main: '#859900', sub: '#2aa198', text: '#eee8d5', error: '#dc322f' } },
  { id: 'rose-pine', name: 'rose pine', appearance: 'dark', palette: { bg: '#1f1d27', main: '#9ccfd8', sub: '#6e6a86', text: '#e0def4', error: '#eb6f92' } },
  { id: 'rose-pine-moon', name: 'rose pine moon', appearance: 'dark', palette: { bg: '#2a273f', main: '#9ccfd8', sub: '#6e6a86', text: '#e0def4', error: '#eb6f92' } },
  { id: 'rose-pine-dawn', name: 'rose pine dawn', appearance: 'light', palette: { bg: '#fffaf3', main: '#56949f', sub: '#9893a5', text: '#575279', error: '#b4637a' } },
  { id: 'monokai', name: 'monokai', appearance: 'dark', palette: { bg: '#272822', main: '#a6e22e', sub: '#75715e', text: '#e2e2dc', error: '#f92672' } },
  { id: 'sonokai', name: 'sonokai', appearance: 'dark', palette: { bg: '#2c2e34', main: '#9ed072', sub: '#7f8490', text: '#e2e2e3', error: '#fc5d7c' } },
  { id: 'onedark', name: 'onedark', appearance: 'dark', palette: { bg: '#2f343f', main: '#61afef', sub: '#545862', text: '#abb2bf', error: '#e06c75' } },
  { id: 'iceberg-dark', name: 'iceberg dark', appearance: 'dark', palette: { bg: '#161821', main: '#84a0c6', sub: '#595e76', text: '#c6c8d1', error: '#e27878' } },
  { id: 'iceberg-light', name: 'iceberg light', appearance: 'light', palette: { bg: '#e8e9ec', main: '#2d539e', sub: '#8389a3', text: '#33374c', error: '#cc517a' } },
  { id: 'vscode', name: 'vscode', appearance: 'dark', palette: { bg: '#1e1e1e', main: '#007acc', sub: '#808080', text: '#d4d4d4', error: '#f44747' } },
  { id: 'github-dark', name: 'github dark', appearance: 'dark', palette: { bg: '#212830', main: '#41ce5c', sub: '#788386', text: '#ccdae6', error: '#c23e3a' } },
  { id: 'matrix', name: 'matrix', appearance: 'dark', palette: { bg: '#000000', main: '#15ff00', sub: '#006500', text: '#d1ffcd', error: '#da3333' } },
  { id: 'horizon', name: 'horizon', appearance: 'dark', palette: { bg: '#1c1e26', main: '#c4a88a', sub: '#6c6f93', text: '#d5d8da', error: '#d55170' } },
  { id: 'material', name: 'material', appearance: 'dark', palette: { bg: '#263238', main: '#80cbc4', sub: '#4c6772', text: '#e6edf3', error: '#ff5370' } },
  { id: 'carbon', name: 'carbon', appearance: 'dark', palette: { bg: '#313131', main: '#f66e0d', sub: '#616161', text: '#f5e6c8', error: '#e72d2d' } },
  { id: 'future-funk', name: 'future funk', appearance: 'dark', palette: { bg: '#2e1a47', main: '#f7f2ea', sub: '#c18fff', text: '#f7f2ea', error: '#f04e98' } },
  { id: 'miami', name: 'miami', appearance: 'dark', palette: { bg: '#e4609b', main: '#05dfd7', sub: '#f199c6', text: '#0e2439', error: '#fff591' } },
  { id: 'miami-nights', name: 'miami nights', appearance: 'dark', palette: { bg: '#18181a', main: '#e4609b', sub: '#47bac0', text: '#f2f2f2', error: '#fff591' } },
  { id: 'bento', name: 'bento', appearance: 'dark', palette: { bg: '#2d394d', main: '#ff7a90', sub: '#4a768d', text: '#fffaf8', error: '#ee2a3a' } },
  { id: 'bushido', name: 'bushido', appearance: 'dark', palette: { bg: '#242933', main: '#ec4c56', sub: '#596172', text: '#f6f0e9', error: '#ec4c56' } },
  { id: 'aether', name: 'aether', appearance: 'dark', palette: { bg: '#101820', main: '#eedaea', sub: '#cf6bdd', text: '#eedaea', error: '#ff5253' } },
  { id: 'arch', name: 'arch', appearance: 'dark', palette: { bg: '#0c0d11', main: '#7ebab5', sub: '#454864', text: '#f6f5f5', error: '#ff4754' } },
  { id: 'alduin', name: 'alduin', appearance: 'dark', palette: { bg: '#1c1c1c', main: '#dfd7af', sub: '#666666', text: '#f5f3ed', error: '#af5f5f' } },
  { id: 'terminal', name: 'terminal', appearance: 'dark', palette: { bg: '#191a1b', main: '#79a617', sub: '#48494b', text: '#e7eae0', error: '#a61717' } },
  { id: 'vesper', name: 'vesper', appearance: 'dark', palette: { bg: '#101010', main: '#ffc799', sub: '#a0a0a0', text: '#ffffff', error: '#ff8080' } },
  { id: 'midnight', name: 'midnight', appearance: 'dark', palette: { bg: '#0b0e13', main: '#60759f', sub: '#394760', text: '#9fadc6', error: '#c27070' } },
  { id: 'modern-dolch', name: 'modern dolch', appearance: 'dark', palette: { bg: '#2d2e30', main: '#7eddd3', sub: '#54585c', text: '#e3e6eb', error: '#d36a7b' } },
  { id: 'modern-dolch-light', name: 'modern dolch light', appearance: 'light', palette: { bg: '#dbdbdb', main: '#8fd1c3', sub: '#7d7c7c', text: '#454545', error: '#ea8a9a' } },
  { id: 'oblivion', name: 'oblivion', appearance: 'dark', palette: { bg: '#313231', main: '#a5a096', sub: '#5d6263', text: '#f7f5f1', error: '#dd452e' } },
  { id: 'red-dragon', name: 'red dragon', appearance: 'dark', palette: { bg: '#1a0b0c', main: '#ff3a32', sub: '#8a6d3b', text: '#d3c0a9', error: '#771b1f' } },
  { id: 'everblush', name: 'everblush', appearance: 'dark', palette: { bg: '#141b1e', main: '#8ccf7e', sub: '#838887', text: '#dadada', error: '#e57474' } },
  { id: 'moonlight', name: 'moonlight', appearance: 'dark', palette: { bg: '#191f28', main: '#c69f68', sub: '#4b5975', text: '#ccccb5', error: '#b81b2c' } },
  { id: 'blueberry-dark', name: 'blueberry dark', appearance: 'dark', palette: { bg: '#212b42', main: '#add7ff', sub: '#5c7da5', text: '#a2b5d0', error: '#df4576' } },
  { id: 'blueberry-light', name: 'blueberry light', appearance: 'light', palette: { bg: '#dae0f5', main: '#506477', sub: '#7f92ab', text: '#3c4759', error: '#df4576' } },
  { id: 'camping', name: 'camping', appearance: 'light', palette: { bg: '#faf1e4', main: '#618c56', sub: '#c2b8aa', text: '#3c403b', error: '#ad4f4e' } },
  { id: 'beach', name: 'beach', appearance: 'light', palette: { bg: '#ffeead', main: '#679d71', sub: '#c8a951', text: '#41684a', error: '#ff6f69' } },
  { id: 'lavender', name: 'lavender', appearance: 'light', palette: { bg: '#ada6c2', main: '#6c5b9e', sub: '#8f88a5', text: '#2f2a41', error: '#ca4754' } },
  { id: 'paper', name: 'paper', appearance: 'light', palette: { bg: '#eeeeee', main: '#444444', sub: '#b2b2b2', text: '#444444', error: '#d70000' } },
  { id: 'cheesecake', name: 'cheesecake', appearance: 'light', palette: { bg: '#fdf0d5', main: '#8e2949', sub: '#a88f7f', text: '#3a3335', error: '#c9184a' } },
  { id: 'olivia', name: 'olivia', appearance: 'dark', palette: { bg: '#100e0d', main: '#f3d295', sub: '#635c58', text: '#e6e0dc', error: '#df6a6f' } },
  { id: 'tokyo-night', name: 'tokyo night', appearance: 'dark', palette: { bg: '#1a1b26', main: '#7aa2f7', sub: '#565f89', text: '#c0caf5', error: '#f7768e' } },
];

export const THEMES_BY_ID: Record<string, ThemeDefinition> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
);
