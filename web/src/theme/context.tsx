import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppTheme, ThemeDefinition } from './types';
import { DEFAULT_THEME_ID, THEMES, THEMES_BY_ID } from './themes.data';
import { deriveTheme } from './derive';
import { applyVars, themeToVars } from './vars';
import { startAccentCycle } from './accentCycle';
import { loadTheme, saveTheme } from './persistence';

interface ThemeContextValue {
  theme: AppTheme;
  themeId: string;
  themes: ThemeDefinition[];
  setTheme: (id: string) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolve(id: string): AppTheme {
  const def = THEMES_BY_ID[id] ?? THEMES_BY_ID[DEFAULT_THEME_ID]!;
  return deriveTheme(def);
}

function paint(theme: AppTheme): void {
  applyVars(themeToVars(theme));
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.dataset.appearance = theme.appearance;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => loadTheme()?.id ?? DEFAULT_THEME_ID);
  const theme = useMemo(() => resolve(themeId), [themeId]);

  // Idempotent re-apply (the pre-paint boot script already painted a persisted theme).
  // Persists the STATIC vars — an animated theme boots on its base accent, then
  // the cycle below takes over.
  useEffect(() => {
    paint(theme);
    saveTheme({ version: 1, id: theme.id, vars: themeToVars(theme) });
  }, [theme]);

  // Declared after the paint effect so the cycle's first frame lands on top of it.
  useEffect(() => startAccentCycle(theme.animation), [theme]);

  const setTheme = useCallback((id: string) => {
    setThemeId(THEMES_BY_ID[id] ? id : DEFAULT_THEME_ID);
  }, []);
  const resetTheme = useCallback(() => setThemeId(DEFAULT_THEME_ID), []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themeId, themes: THEMES, setTheme, resetTheme }),
    [theme, themeId, setTheme, resetTheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
