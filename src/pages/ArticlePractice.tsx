import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArticlePracticeRunner } from '@/components/ArticlePracticeRunner'
import { ARTICLES } from '@/data/articles'

const categoryColor: Record<string, string> = {
  潮文: 'text-amber-600 dark:text-amber-400',
  新聞: 'text-blue-700 dark:text-blue-400',
  商業: 'text-emerald-700 dark:text-emerald-400',
  百科: 'text-violet-700 dark:text-violet-400',
  現代詩: 'text-pink-700 dark:text-pink-400',
  散文: 'text-teal-700 dark:text-teal-400',
}

export default function ArticlePractice() {
  const [text, setText] = useState<string | null>(null)
  const [pasted, setPasted] = useState('')

  if (text) {
    return <ArticlePracticeRunner text={text} onFinish={() => setText(null)} />
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs tracking-[0.4em] text-muted-foreground uppercase">
          <span className="w-10 h-px bg-vermilion" />
          其二 · 文章練習
        </div>
        <h1 className="font-serif font-black text-5xl tracking-tight leading-tight">
          挑一篇<span className="text-vermilion">文章</span>來練手
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          每個 CJK 字符空白送出即可，答對自動跳到下一字、計算每分鐘字數（CPM）與正確率。
        </p>
        <div className="brush-rule w-24" />
      </header>

      <section>
        <h2 className="font-serif text-xl font-semibold mb-4 flex items-baseline gap-3">
          內建文章
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-muted-foreground">
            {ARTICLES.length} 篇
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {ARTICLES.map((a, i) => {
            const wordCount = Array.from(a.content).filter(c => /[一-鿿]/.test(c)).length
            return (
              <button
                key={a.id}
                onClick={() => setText(a.content)}
                className="paper-card group text-left p-5 cursor-pointer hover:border-vermilion hover:-translate-y-0.5 transition-all"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className={`font-mono text-[10px] tracking-[0.3em] uppercase font-medium ${
                      categoryColor[a.category] ?? 'text-muted-foreground'
                    }`}
                  >
                    {a.category}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                    {wordCount} 字
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-vermilion transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {a.content}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold mb-4">
          貼上自己的文章
        </h2>
        <div className="paper-card p-5 space-y-3">
          <textarea
            className="w-full min-h-[140px] p-4 rounded-md border border-border bg-background font-serif text-base leading-relaxed focus:outline-none focus:border-vermilion transition-colors resize-y"
            placeholder="把要練的文字貼上來……"
            value={pasted}
            onChange={e => setPasted(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
              {Array.from(pasted).filter(c => /[一-鿿]/.test(c)).length} 字
            </span>
            <Button
              disabled={pasted.trim().length < 10}
              onClick={() => setText(pasted.trim())}
              className="bg-vermilion hover:bg-vermilion-deep text-primary-foreground"
            >
              開始練習 →
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
