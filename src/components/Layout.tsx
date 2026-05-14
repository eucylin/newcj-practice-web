import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadSettings, type Theme } from '@/lib/storage'
import { setTheme } from '@/lib/theme'
import { RadicalsProvider, RadicalsSheet } from './RadicalsSheet'

const navItems = [
  { to: '/', label: '首頁' },
  { to: '/practice/character', label: '單字練習' },
  { to: '/practice/article', label: '文章練習' },
  { to: '/stats', label: '個人紀錄' },
  { to: '/about', label: '關於本站' },
]

function ThemeToggle() {
  const [theme, setLocal] = useState<Theme>('light')
  useEffect(() => setLocal(loadSettings().theme), [])
  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setLocal(next)
    setTheme(next)
  }
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full border border-border bg-card hover:border-vermilion hover:text-vermilion transition-colors flex items-center justify-center text-base cursor-pointer"
      title={theme === 'dark' ? '切換為亮色' : '切換為暗色'}
      aria-label={theme === 'dark' ? '切換為亮色' : '切換為暗色'}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
      )}
    </button>
  )
}

export default function Layout() {
  const [radicalsOpen, setRadicalsOpen] = useState(false)
  const openRadicals = () => setRadicalsOpen(true)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '?') return
      const target = e.target as HTMLElement | null
      if (target?.tagName === 'TEXTAREA') return
      e.preventDefault()
      setRadicalsOpen(true)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  return (
    <RadicalsProvider value={openRadicals}>
      <div className="min-h-screen min-w-[1024px]">
        <nav className="sticky top-0 z-30 backdrop-blur-md bg-background/85 border-b border-border">
          <div className="max-w-6xl mx-auto px-8 py-3 flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <span className="seal-stamp text-base leading-none">大</span>
              <span className="font-serif font-semibold text-lg tracking-wide group-hover:text-vermilion transition-colors">
                大新倉頡練習網
              </span>
            </NavLink>
            <div className="flex items-center gap-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-3 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'text-vermilion font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                  end={item.to === '/'}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className="absolute left-3 right-3 -bottom-[13px] h-[2px] bg-vermilion rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={openRadicals}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card hover:border-vermilion hover:text-vermilion transition-colors text-sm cursor-pointer"
                title="開啟字根表（按 ? 鍵）"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>字根表</span>
                <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">?</kbd>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <main className="animate-fade-up"><Outlet /></main>
        <RadicalsSheet open={radicalsOpen} onClose={() => setRadicalsOpen(false)} />
      </div>
    </RadicalsProvider>
  )
}
