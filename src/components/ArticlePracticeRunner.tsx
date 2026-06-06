import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  initSession,
  submitCode,
  type ArticleSessionState,
  type Cell,
} from '@/lib/articleSession'
import { shortestCode } from '@/lib/codingJudge'
import { recordCharAttempt, appendSession } from '@/lib/storage'
import { calcCPM, calcAccuracy, formatElapsed } from '@/lib/stats'
import { codeToRadicalString, isRadicalKey } from '@/lib/codeMap'
import { cn } from '@/lib/utils'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

interface Props {
  text: string
  onFinish: () => void
}

export function ArticlePracticeRunner({ text, onFinish }: Props) {
  const [session, setSession] = useState<ArticleSessionState>(() =>
    initSession(text, dict),
  )
  const [input, setInput] = useState('')
  const [wrongInput, setWrongInput] = useState('')
  const [startTs, setStartTs] = useState<number | null>(null)
  const [endTs, setEndTs] = useState<number | null>(null)
  const [tick, setTick] = useState(0)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentCellRef = useRef<HTMLDivElement>(null)
  const savedRef = useRef(false)

  const typableTotal = useMemo(
    () => session.cells.filter(c => c.typable).length,
    [session.cells],
  )
  const finished = session.idx >= session.cells.length

  useEffect(() => {
    if (!finished) inputRef.current?.focus()
  }, [finished])

  // 答錯紅閃後清除
  useEffect(() => {
    if (!wrongInput) return
    const t = setTimeout(() => setWrongInput(''), 600)
    return () => clearTimeout(t)
  }, [wrongInput])

  // 計時 tick（讓經過時間與 CPM 即時更新）
  useEffect(() => {
    if (startTs === null || endTs !== null) return
    const id = setInterval(() => setTick(t => t + 1), 250)
    return () => clearInterval(id)
  }, [startTs, endTs])

  // 當前字自動捲入視野
  useEffect(() => {
    currentCellRef.current?.scrollIntoView({ block: 'nearest' })
  }, [session.idx])

  // 完成後記錄 session
  useEffect(() => {
    if (endTs === null || startTs === null || savedRef.current) return
    savedRef.current = true
    const durationMs = endTs - startTs
    appendSession({
      type: 'article',
      cpm: calcCPM(session.typedCount, durationMs),
      accuracy: calcAccuracy(
        session.totalAttempts - session.totalErrors,
        session.totalAttempts,
      ),
      durationMs,
      questionCount: session.typedCount,
      ts: endTs,
    })
  }, [endTs, startTs, session])

  function handleSubmit() {
    if (finished || !input) return
    const currentChar = session.cells[session.idx].char
    const { state, outcome } = submitCode(session, input, dict)
    recordCharAttempt(currentChar, outcome === 'correct')
    setSession(state)
    setInput('')
    if (outcome === 'wrong') setWrongInput(input)
    if (state.idx >= state.cells.length) setEndTs(Date.now())
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ' ') {
      e.preventDefault()
      handleSubmit()
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      setInput(v => v.slice(0, -1))
      return
    }
    if (e.key.length === 1) {
      e.preventDefault()
      const k = e.key.toLowerCase()
      if (isRadicalKey(k)) {
        if (startTs === null) setStartTs(Date.now())
        setInput(v => v + k)
      }
    }
  }

  // 整篇沒有可練習的字
  if (typableTotal === 0) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-16 space-y-6 text-center">
        <p className="text-muted-foreground">這篇文章沒有可練習的字。</p>
        <Button
          onClick={onFinish}
          className="bg-vermilion hover:bg-vermilion-deep text-primary-foreground px-8"
        >
          回主畫面
        </Button>
      </div>
    )
  }

  // 結算畫面
  if (endTs !== null && startTs !== null) {
    const durationMs = endTs - startTs
    const cpm = calcCPM(session.typedCount, durationMs)
    const accuracy = calcAccuracy(
      session.totalAttempts - session.totalErrors,
      session.totalAttempts,
    )
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
          <Stat value={formatElapsed(durationMs)} label="用時" />
        </div>
        {session.errorChars.length > 0 && (
          <div className="paper-card p-6 max-w-md mx-auto text-left space-y-3">
            <h3 className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">
              錯字一覽
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {session.errorChars.map(ch => (
                <li key={ch} className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-2xl">{ch}</span>
                  <span className="text-sm text-vermilion tracking-wider">
                    {codeToRadicalString(shortestCode(dict[ch] ?? []) ?? '')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button
          onClick={onFinish}
          className="bg-vermilion hover:bg-vermilion-deep text-primary-foreground px-8"
        >
          回主畫面
        </Button>
      </div>
    )
  }

  const elapsedMs = startTs !== null ? Date.now() - startTs : 0
  const liveCpm =
    elapsedMs > 0 ? ((session.typedCount / elapsedMs) * 60_000).toFixed(1) : '0.0'
  void tick

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-4">
      {/* 隱形輸入框：吃所有鍵盤輸入 */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute opacity-0 w-1 h-1 pointer-events-none"
        aria-label="字根輸入"
      />

      {/* 文章字格 */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="paper-card p-6 sm:p-8 select-none cursor-text"
      >
        <div className="flex flex-wrap gap-x-1 gap-y-4">
          {session.cells.map((cell, i) => (
            <CharCell
              key={i}
              index={i}
              cell={cell}
              isCurrent={i === session.idx}
              inputCode={input}
              wrongCode={wrongInput}
              focused={focused}
              cellRef={i === session.idx ? currentCellRef : undefined}
            />
          ))}
        </div>
      </div>

      {/* 即時統計列 */}
      <div className="sticky bottom-0 paper-card px-4 py-2.5 font-mono text-xs text-muted-foreground flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span>
          經過時間 <span className="text-foreground font-semibold">{formatElapsed(elapsedMs)}</span>
        </span>
        <span>已輸入 {session.typedCount} / {typableTotal} 字</span>
        <span>
          每分鐘 <span className="text-foreground font-semibold">{liveCpm}</span> 字
        </span>
        <span className={cn(session.errorChars.length > 0 && 'text-destructive')}>
          錯誤 {session.errorChars.length} 字
        </span>
      </div>
    </div>
  )
}

interface CharCellProps {
  index: number
  cell: Cell
  isCurrent: boolean
  /** 輸入中的編碼（僅當前字顯示） */
  inputCode: string
  /** 剛答錯的編碼（紅閃顯示） */
  wrongCode: string
  focused: boolean
  cellRef?: React.Ref<HTMLDivElement>
}

function CharCell({ index, cell, isCurrent, inputCode, wrongCode, focused, cellRef }: CharCellProps) {
  let codeText = ''
  let codeCls = 'text-muted-foreground'
  if (cell.status === 'done') {
    codeText = codeToRadicalString(cell.code)
  } else if (cell.status === 'skipped') {
    codeText = codeToRadicalString(cell.code)
    codeCls = 'text-destructive font-semibold'
  } else if (isCurrent) {
    if (inputCode) {
      codeText = codeToRadicalString(inputCode)
      codeCls = 'text-foreground'
    } else if (wrongCode) {
      codeText = codeToRadicalString(wrongCode)
      codeCls = 'text-destructive'
    }
  }

  const charCls =
    cell.status !== 'pending'
      ? 'text-muted-foreground/50'
      : isCurrent
        ? 'text-foreground'
        : cell.typable
          ? 'text-foreground'
          : 'text-muted-foreground/70'

  return (
    <div
      ref={cellRef}
      data-testid={`cell-${index}`}
      data-status={cell.status}
      {...(isCurrent ? { 'data-current': 'true' } : {})}
      className={cn(
        'flex w-14 flex-col items-center rounded-md pt-1',
        isCurrent && 'bg-vermilion/15 ring-1 ring-vermilion',
      )}
    >
      <span className={cn('font-serif text-2xl leading-snug', charCls)}>
        {cell.char}
      </span>
      <span
        className={cn(
          'flex h-4 items-center text-[10px] leading-4 tracking-wide whitespace-nowrap',
          codeCls,
        )}
      >
        {codeText}
        {isCurrent && focused && (
          <span className="ml-px inline-block w-px h-3 bg-foreground/80 caret-blink" />
        )}
      </span>
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
