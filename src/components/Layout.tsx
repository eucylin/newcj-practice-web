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
]

function ThemeToggle() {
  const [theme, setLocal] = useState<Theme>('light')
  useEffect(() => setLocal(loadSettings().theme), [])
  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setLocal(next)
    setTheme(next)
  }
  const label = theme === 'dark' ? '🌙' : '☀'
  const title = theme === 'dark' ? '切換為亮色' : '切換為暗色'
  return <button onClick={toggle} className="text-lg" title={title}>{label}</button>
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
        <nav className="flex gap-6 px-8 py-4 border-b bg-background items-center">
          <span className="font-bold">大新倉頡</span>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={openRadicals}
            className="ml-auto text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            title="開啟字根表（按 ? 鍵）"
          >
            <span>字根表</span>
            <kbd className="text-xs px-1.5 py-0.5 rounded border bg-muted">?</kbd>
          </button>
          <ThemeToggle />
        </nav>
        <main><Outlet /></main>
        <RadicalsSheet open={radicalsOpen} onClose={() => setRadicalsOpen(false)} />
      </div>
    </RadicalsProvider>
  )
}
