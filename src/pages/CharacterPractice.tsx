import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CharacterPracticeRunner } from '@/components/CharacterPracticeRunner'
import { pickQuestions, weakCharsFromStats } from '@/lib/pickQuestion'
import { ALL_LEVELS, loadAllCharStats, loadSettings, saveSettings, type Level } from '@/lib/storage'
import levelsData from '@/data/levels.json'

const levels = levelsData as Record<Level, string[]>

export default function CharacterPractice() {
  const [selected, setSelected] = useState<Level[]>(loadSettings().defaultLevels)
  const [questions, setQuestions] = useState<string[] | null>(null)

  function toggle(key: Level) {
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
  }

  function start() {
    saveSettings({ ...loadSettings(), defaultLevels: selected })
    const pool = ALL_LEVELS.filter(k => selected.includes(k)).flatMap(k => levels[k])
    const weak = weakCharsFromStats(loadAllCharStats(), 0.2)
    const picked = pickQuestions(pool, 100, weak, 2)
    setQuestions(picked)
  }

  if (questions) {
    return <CharacterPracticeRunner questions={questions} onFinish={() => setQuestions(null)} />
  }

  const bLen = levels.beginner.length
  const iLen = levels.intermediate.length
  const aLen = levels.advanced.length
  const total = bLen + iLen + aLen

  const options: { key: Level; label: string; range: string; desc: string; numeral: string }[] = [
    { key: 'beginner', label: '入門', numeral: '壹', range: `第 1 – ${bLen} 名`, desc: `最常用 ${bLen} 字` },
    { key: 'intermediate', label: '進階', numeral: '貳', range: `第 ${bLen + 1} – ${bLen + iLen} 名`, desc: `次常用 ${iLen} 字` },
    { key: 'advanced', label: '精通', numeral: '參', range: `第 ${bLen + iLen + 1} – ${total} 名`, desc: `其餘 ${aLen} 字` },
  ]

  const selectedCount = ALL_LEVELS.filter(k => selected.includes(k)).reduce((sum, k) => sum + levels[k].length, 0)

  return (
    <div className="max-w-2xl mx-auto px-8 py-12 space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs tracking-[0.4em] text-muted-foreground uppercase">
          <span className="w-10 h-px bg-vermilion" />
          其一 · 單字練習
        </div>
        <h1 className="font-serif font-black text-5xl tracking-tight leading-tight">
          勾選<span className="text-vermilion">題庫</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          題目取自<span className="text-foreground font-medium">教育部常用國字標準字體表</span>
          共 {total} 字，依詞頻語料庫統計後依出現次數高低排序，分為三級，可自由組合。
          每回合 100 題，弱點字會優先出現。
        </p>
        <div className="brush-rule w-24" />
      </header>

      <div className="space-y-3">
        {options.map(o => {
          const active = selected.includes(o.key)
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => toggle(o.key)}
              aria-pressed={active}
              className={`paper-card group w-full text-left p-5 flex items-center gap-5 cursor-pointer transition-all ${
                active
                  ? 'border-vermilion ring-2 ring-vermilion/20 shadow-seal'
                  : 'hover:border-foreground/40 hover:-translate-y-0.5'
              }`}
            >
              <div
                className={`flex-shrink-0 w-14 h-14 rounded flex items-center justify-center font-serif text-2xl font-bold border-2 ${
                  active
                    ? 'bg-vermilion text-primary-foreground border-vermilion'
                    : 'bg-card text-muted-foreground border-border group-hover:border-foreground'
                }`}
              >
                {o.numeral}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className={`font-serif text-2xl font-semibold ${active ? 'text-vermilion' : ''}`}>
                    {o.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{o.range}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{o.desc}</div>
              </div>
              <div
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                  active ? 'border-vermilion bg-vermilion' : 'border-border'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>

      <Button
        onClick={start}
        disabled={selected.length === 0}
        className="w-full h-14 text-base font-medium bg-vermilion hover:bg-vermilion-deep text-primary-foreground tracking-wider shadow-seal disabled:opacity-40"
      >
        {selected.length === 0 ? '請至少勾選一個題庫' : `開始 100 題（題庫共 ${selectedCount} 字）→`}
      </Button>
    </div>
  )
}
