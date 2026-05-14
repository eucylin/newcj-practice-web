import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { loadSessions } from '@/lib/storage'
import { useOpenRadicals } from '@/components/RadicalsSheet'

interface TileProps {
  to?: string
  onClick?: () => void
  index: number
  numeral: string
  title: string
  desc: string
  accent?: 'vermilion' | 'ink' | 'gold'
}

function Tile({ to, onClick, index, numeral, title, desc, accent = 'ink' }: TileProps) {
  const accentClass = {
    vermilion: 'group-hover:border-vermilion',
    ink: 'group-hover:border-foreground',
    gold: 'group-hover:border-[hsl(var(--gold))]',
  }[accent]

  const inner = (
    <article
      className={`paper-card group cursor-pointer h-full p-7 transition-all duration-300 hover:-translate-y-1 ${accentClass} relative overflow-hidden`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute -right-2 -top-3 font-serif text-[7rem] leading-none text-vermilion/[0.06] dark:text-vermilion/10 font-bold select-none pointer-events-none">
        {numeral}
      </div>
      <div className="relative">
        <div className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
          其{numeral}
        </div>
        <h2 className="font-serif font-semibold text-2xl mb-2 group-hover:text-vermilion transition-colors">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </article>
  )

  if (to) return <Link to={to} className="block animate-fade-up">{inner}</Link>
  return (
    <button type="button" onClick={onClick} className="text-left block w-full animate-fade-up">
      {inner}
    </button>
  )
}

export default function Home() {
  const recent = useMemo(() => loadSessions().slice(-5).reverse(), [])
  const lastCpm = recent[0]?.cpm
  const totalSessions = useMemo(() => loadSessions().length, [])
  const openRadicals = useOpenRadicals()

  return (
    <div className="max-w-6xl mx-auto px-8 py-16 space-y-14">
      <header className="space-y-6">
        <div className="flex items-center gap-3 text-xs tracking-[0.4em] text-muted-foreground uppercase">
          <span className="w-12 h-px bg-vermilion" />
          DA XIN CANGJIE · 大新倉頡
        </div>
        <h1 className="font-serif font-black text-7xl tracking-tight leading-none">
          學習大新，
          <br />
          <span className="text-vermilion">沒那麼難。</span>
        </h1>
        <p className="font-sans text-lg text-muted-foreground max-w-xl leading-relaxed">
          以教育部 4808 常用字與七篇日常文章為料，從拆碼到 CPM。
          按下 <kbd className="font-mono text-xs px-2 py-1 rounded border border-border bg-card mx-0.5">?</kbd> 隨時呼叫字根表速查。
        </p>
        <div className="brush-rule w-32" />
      </header>

      <section className="grid grid-cols-2 gap-5">
        <Tile
          to="/practice/character"
          index={0}
          numeral="一"
          title="單字練習"
          desc="教育部 4808 字依詞頻分三級，每回 100 題，弱點字優先出現。"
          accent="vermilion"
        />
        <Tile
          to="/practice/article"
          index={1}
          numeral="二"
          title="文章練習"
          desc="七篇 100–440 字現代題材，或貼上自己的文章計時練習。"
          accent="ink"
        />
        <Tile
          onClick={openRadicals}
          index={2}
          numeral="三"
          title="字根速查"
          desc="任何頁面側邊滑出的字根表面板，或按 ? 鍵直接開啟。"
          accent="gold"
        />
        <Tile
          to="/stats"
          index={3}
          numeral="四"
          title="個人紀錄"
          desc={
            lastCpm
              ? `上次 CPM ${lastCpm}．共 ${totalSessions} 回合`
              : '尚無紀錄，先完成一回練習。'
          }
          accent="ink"
        />
      </section>

      <footer className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground/80">
          靈感來自布緯方塊與練字帖．資料：教育部常用國字標準字體表（4808 字）．大新倉頡碼表 by jser.com
        </p>
      </footer>
    </div>
  )
}
