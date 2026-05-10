import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadSettings, type Theme } from '@/lib/storage'
import { setTheme } from '@/lib/theme'

const navItems = [
  { to: '/', label: '首頁' },
  { to: '/practice/character', label: '單字練習' },
  { to: '/practice/article', label: '文章練習' },
  { to: '/radicals', label: '字根表' },
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
  return <button onClick={toggle} className="ml-auto text-lg" title={title}>{label}</button>
}

export default function Layout() {
  return (
    <div className="min-h-screen min-w-[1024px]">
      <nav className="flex gap-6 px-8 py-4 border-b bg-background">
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
        <ThemeToggle />
      </nav>
      <main><Outlet /></main>
    </div>
  )
}
