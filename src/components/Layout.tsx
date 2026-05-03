import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首頁' },
  { to: '/practice/character', label: '單字練習' },
  { to: '/practice/article', label: '文章練習' },
  { to: '/radicals', label: '字根表' },
  { to: '/stats', label: '個人紀錄' },
]

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
      </nav>
      <main><Outlet /></main>
    </div>
  )
}
