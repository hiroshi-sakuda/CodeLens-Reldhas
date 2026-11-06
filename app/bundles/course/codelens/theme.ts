import { useSyncExternalStore } from 'react';
// One theme for the whole app, shared by the shell and the Lens Review screen.
export type Theme = 'light' | 'dark';
const key = 'codelens-theme';
const listeners = new Set<() => void>();
function read(): Theme {
  try { return localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
}
let current: Theme = read();
function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f3f5f4' : '#0e1211');
}
apply(current);
export function setTheme(theme: Theme) {
  current = theme;
  try { localStorage.setItem(key, theme); } catch { /* The theme still applies for this visit. */ }
  apply(theme);
  listeners.forEach(l => l());
}
export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(l => { listeners.add(l); return () => listeners.delete(l); }, () => current);
  return [theme, () => setTheme(theme === 'light' ? 'dark' : 'light')];
}
