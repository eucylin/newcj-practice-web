import { loadSettings, saveSettings, type Theme } from './storage'

export function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export function initTheme() {
  applyTheme(loadSettings().theme)
}

export function setTheme(theme: Theme) {
  saveSettings({ ...loadSettings(), theme })
  applyTheme(theme)
}
