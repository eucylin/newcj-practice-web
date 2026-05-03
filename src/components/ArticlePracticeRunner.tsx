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

  if (endTs !== null && startTs !== null) {
    const durationMs = endTs - startTs
    const cpm = calcCPM(cjkCount, durationMs)
    const accuracy = calcAccuracy(totalAttempts - errors, totalAttempts)
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-6 text-center">
        <h2 className="text-2xl font-bold">完成！</h2>
        <div className="grid grid-cols-3 gap-4">
          <div><div className="text-3xl font-bold">{cpm}</div><div className="text-sm text-muted-foreground">CPM</div></div>
          <div><div className="text-3xl font-bold">{Math.round(accuracy * 100)}%</div><div className="text-sm text-muted-foreground">正確率</div></div>
          <div><div className="text-3xl font-bold">{Math.round(durationMs / 1000)}s</div><div className="text-sm text-muted-foreground">用時</div></div>
        </div>
        <Button onClick={onFinish}>回主畫面</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="text-sm text-muted-foreground">
        進度 {completedCjk} / {cjkCount}{startTs !== null && ` · 已用 ${Math.round((Date.now() - startTs) / 1000)}s`}
      </div>

      <div className="text-2xl leading-relaxed select-none">
        {chars.map((c, i) => {
          const cls =
            i < idx ? 'text-muted-foreground/50' :
            i === idx ? 'bg-yellow-200 dark:bg-yellow-900/40 px-0.5 rounded' :
            ''
          return <span key={i} className={cls}>{c}</span>
        })}
      </div>

      <CodeInput value={input} onChange={setInput} onSubmit={handleSubmit} status={status} />
    </div>
  )
}
