import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { loadSessions, loadAllCharStats, clearAll } from '@/lib/storage'
import dictData from '@/data/newcj.json'
import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'

const dict = dictData as Record<string, string[]>

export default function Stats() {
  const [reloadKey, setReloadKey] = useState(0)

  const sessions = useMemo(() => loadSessions(), [reloadKey])
  const charStats = useMemo(() => loadAllCharStats(), [reloadKey])

  const cpmData = sessions.map((s, i) => ({
    n: i + 1,
    cpm: s.cpm,
    accuracy: Math.round(s.accuracy * 100),
  }))

  const weakChars = Object.entries(charStats)
    .filter(([, s]) => s.attempts >= 3)
    .map(([ch, s]) => ({ ch, rate: s.errors / s.attempts, attempts: s.attempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 20)

  const bestCpm = sessions.length > 0 ? Math.max(...sessions.map(s => s.cpm)) : 0
  const avgCpm =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.cpm, 0) / sessions.length)
      : 0
  const avgAcc =
    sessions.length > 0
      ? Math.round((sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length) * 100)
      : 0

  function handleClear() {
    if (!confirm('確定清除所有紀錄？此動作無法復原。')) return
    clearAll()
    setReloadKey(k => k + 1)
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 space-y-10">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs tracking-[0.4em] text-muted-foreground uppercase">
            <span className="w-10 h-px bg-vermilion" />
            其四 · 個人紀錄
          </div>
          <h1 className="font-serif font-black text-5xl tracking-tight leading-tight">
            你的<span className="text-vermilion">軌跡</span>
          </h1>
          <div className="brush-rule w-24" />
        </div>
        <Button
          variant="outline"
          onClick={handleClear}
          className="hover:border-vermilion hover:text-vermilion"
        >
          清除所有紀錄
        </Button>
      </header>

      {/* 摘要卡 */}
      <section className="grid grid-cols-3 gap-4">
        <SummaryCard label="場次" value={sessions.length} />
        <SummaryCard label="最佳 CPM" value={bestCpm} highlight />
        <SummaryCard label="平均正確率" value={avgAcc > 0 ? `${avgAcc}%` : '—'} suffix={avgCpm ? `平均 ${avgCpm} CPM` : ''} />
      </section>

      {/* 速度趨勢圖 */}
      <section className="paper-card p-6">
        <header className="mb-5 flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold">速度趨勢</h2>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
            最近 {sessions.length} 場
          </span>
        </header>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-12 text-center">
            尚無紀錄。完成一回單字或文章練習後會出現。
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cpmData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="n"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                stroke="hsl(var(--border))"
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                stroke="hsl(var(--border))"
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                  fontFamily: 'Noto Sans TC',
                  fontSize: 12,
                }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="cpm"
                stroke="hsl(var(--vermilion))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: 'hsl(var(--vermilion))', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: 'hsl(var(--vermilion))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* 弱點字 */}
      <section className="paper-card p-6">
        <header className="mb-5 flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold">最常錯的 20 字</h2>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">
            {weakChars.length} 字
          </span>
        </header>
        {weakChars.length === 0 ? (
          <p className="text-muted-foreground text-sm py-12 text-center">尚無資料。</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {weakChars.map(({ ch, rate, attempts }) => {
              const codes = sortCodesByLength(dict[ch] ?? [])
              const intensity = Math.min(1, rate)
              return (
                <div
                  key={ch}
                  className="flex items-center gap-4 px-4 py-3 rounded-md border border-border bg-card"
                >
                  <div
                    className="font-serif text-4xl font-semibold w-14 h-14 flex items-center justify-center rounded border-2"
                    style={{
                      borderColor: `hsl(var(--vermilion) / ${0.3 + intensity * 0.6})`,
                      color: `hsl(var(--vermilion))`,
                    }}
                  >
                    {ch}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-base tracking-wide truncate">
                      {codes.map(c => codeToRadicalString(c)).join(' ／ ')}
                    </div>
                    <div className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground mt-1">
                      錯誤率 {Math.round(rate * 100)}%　·　{attempts} 次
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  highlight = false,
  suffix,
}: {
  label: string
  value: string | number
  highlight?: boolean
  suffix?: string
}) {
  return (
    <div className="paper-card p-6">
      <div className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
        {label}
      </div>
      <div
        className={`font-serif font-bold text-5xl leading-none ${highlight ? 'text-vermilion' : ''}`}
      >
        {value}
      </div>
      {suffix && (
        <div className="text-xs text-muted-foreground mt-2">{suffix}</div>
      )}
    </div>
  )
}
