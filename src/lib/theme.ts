import { loadSettings, saveSettings, isThemeStored, type Theme } from './storage'

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function detectSystemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function initTheme() {
  if (!isThemeStored()) {
    saveSettings({ ...loadSettings(), theme: detectSystemTheme() })
  }
  applyTheme(loadSettings().theme)
}

export function setTheme(theme: Theme) {
  saveSettings({ ...loadSettings(), theme })
  applyTheme(theme)
}
