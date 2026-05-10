import { useEffect, useMemo, useRef, useState } from 'react'
import { CodeInput } from './CodeInput'
import { Button } from '@/components/ui/button'
import { isCorrectCode } from '@/lib/codingJudge'
import { recordCharAttempt, appendSession } from '@/lib/storage'
import { calcCPM, calcAccuracy } from '@/lib/stats'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

function isCJK(c: string): boolean {
  const cp = c.codePointAt(0) ?? 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

interface Props {
  text: string
  onFinish: () => void
}

export function ArticlePracticeRunner({ text, onFinish }: Props) {
  const chars = useMemo(() => Array.from(text), [text])
  const [idx, setIdx] = useState(() => chars.findIndex(c => isCJK(c)))
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'wrong'>('idle')
  const [errors, setErrors] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [startTs, setStartTs] = useState<number | null>(null)
  const [endTs, setEndTs] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const finishedRef = useRef(false)

  const cjkCount = useMemo(() => chars.filter(isCJK).length, [chars])
  const completedCjk = useMemo(
    () => chars.slice(0, idx).filter(isCJK).length,
    [chars, idx],
  )

  function advance(currentIdx: number): number {
    let next = currentIdx + 1
    while (next < chars.length && !isCJK(chars[next])) next++
    return next
  }

  function handleSubmit(value: string) {
    if (idx >= chars.length || finishedRef.current) return
    if (!value) return
    if (startTs === null) setStartTs(Date.now())

    const currentChar = chars[idx]
    const validCodes = dict[currentChar] ?? []
    const correct = isCorrectCode(value, validCodes)
    setTotalAttempts(n => n + 1)
    recordCharAttempt(currentChar, correct)

    if (correct) {
      const next = advance(idx)
      setInput('')
      setStatus('idle')
      setIdx(next)
      if (next >= chars.length) {
        finishedRef.current = true
        const endNow = Date.now()
        setEndTs(endNow)
      }
    } else {
      setErrors(e => e + 1)
      setStatus('wrong')
    }
  }

  useEffect(() => {
    if (endTs !== null && startTs !== null) {
      const durationMs = endTs - startTs
      appendSession({
        type: 'article',
        cpm: calcCPM(cjkCount, durationMs),
        accuracy: calcAccuracy(totalAttempts - errors, totalAttempts),
        durationMs,
        questionCount: cjkCount,
        ts: endTs,
      })
    }
  }, [endTs, startTs, cjkCount, totalAttempts, errors])

  useEffect(() => {
    if (status === 'wrong') {
      const t = setTimeout(() => setStatus('idle'), 600)
      return () => clearTimeout(t)
    }
  }, [status])

  useEffect(() => {
    if (startTs === null || endTs !== null) return
    const id = setInterval(() => setTick(t => t + 1), 250)
    return () => clearInterval(id)
  }, [startTs, endTs])

  if (endTs !== null && startTs !== null) {
    const durationMs = endTs - startTs
    const cpm = calcCPM(cjkCount, durationMs)
    const accuracy = calcAccuracy(totalAttempts - errors, totalAttempts)
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 space-y-10 text-center">
        <div className="space-y-2">
          <div className="seal-stamp text-base inline-flex">畢</div>
          <h2 className="font-serif font-black text-5xl tracking-tight mt-4">完成練習</h2>
          <div className="brush-rule w-24 mx-auto" />
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Stat value={cpm} label="CPM" highlight />
          <Stat value={`${Math.round(accuracy * 100)}%`} label="正確率" />
          <Stat value={`${Math.round(durationMs / 1000)}s`} label="用時" />
        </div>
        <Button
          onClick={onFinish}
          className="bg-vermilion hover:bg-vermilion-deep text-primary-foreground px-8"
        >
          回主畫面
        </Button>
      </div>
    )
  }

  const elapsedSec = startTs !== null ? Math.round((Date.now() - startTs) / 1000) : 0
  void tick

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
      {/* 進度與計時 */}
      <div className="flex items-baseline justify-between font-mono text-xs">
        <div className="tracking-[0.25em] uppercase text-muted-foreground">
          進度
          <span className="text-foreground ml-2 font-serif text-base">
            {completedCjk}
          </span>
          <span className="text-muted-foreground"> / {cjkCount}</span>
        </div>
        <div className="tracking-[0.25em] uppercase text-muted-foreground">
          用時
          <span className="text-foreground ml-2 font-serif text-base">{elapsedSec}s</span>
        </div>
      </div>
      <div className="h-[3px] w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-vermilion transition-all duration-300 ease-out rounded-full"
          style={{ width: `${cjkCount > 0 ? (completedCjk / cjkCount) * 100 : 0}%` }}
        />
      </div>

      {/* 文章框 */}
      <div className="paper-card p-8 font-serif text-2xl leading-[2.2] select-none tracking-wide">
        {chars.map((c, i) => {
          const cls =
            i < idx
              ? 'text-muted-foreground/40'
              : i === idx
                ? 'bg-vermilion text-primary-foreground px-1 rounded animate-pulse'
                : 'text-foreground'
          return <span key={i} className={cls}>{c}</span>
        })}
      </div>

      <CodeInput value={input} onChange={setInput} onSubmit={handleSubmit} status={status} />
    </div>
  )
}

function Stat({ value, label, highlight = false }: { value: string | number; label: string; highlight?: boolean }) {
  return (
    <div className="paper-card p-5">
      <div className={`font-serif font-bold text-4xl leading-none ${highlight ? 'text-vermilion' : ''}`}>
        {value}
      </div>
      <div className="text-xs font-mono tracking-[0.25em] uppercase text-muted-foreground mt-2">
        {label}
      </div>
    </div>
  )
}
