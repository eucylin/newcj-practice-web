import { useEffect, useMemo, useState } from 'react'
import { CodeInput } from './CodeInput'
import { CodesReveal } from './CodesReveal'
import { isCorrectCode } from '@/lib/codingJudge'
import { recordCharAttempt, appendSession } from '@/lib/storage'
import { calcCPM, calcAccuracy } from '@/lib/stats'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

interface Props {
  questions: string[]
  onFinish: () => void
}

const ERRORS_BEFORE_REVEAL = 3

export function CharacterPracticeRunner({ questions, onFinish }: Props) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [errors, setErrors] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [startTs] = useState(() => Date.now())
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)

  const currentChar = questions[idx]
  const validCodes = useMemo(() => dict[currentChar] ?? [], [currentChar])

  function nextQuestion() {
    if (idx + 1 >= questions.length) {
      const durationMs = Date.now() - startTs
      appendSession({
        type: 'character',
        cpm: calcCPM(totalCorrect + (status === 'correct' ? 1 : 0), durationMs),
        accuracy: calcAccuracy(totalCorrect + (status === 'correct' ? 1 : 0), totalAttempts + 1),
        durationMs,
        questionCount: questions.length,
        ts: Date.now(),
      })
      onFinish()
      return
    }
    setIdx(i => i + 1)
    setInput('')
    setErrors(0)
    setRevealed(false)
    setStatus('idle')
  }

  function handleInputChange(newValue: string) {
    if (status === 'wrong' && newValue.length > input.length) {
      setInput(newValue.slice(input.length))
      setStatus('idle')
      return
    }
    setInput(newValue)
  }

  function handleSubmit(value: string) {
    if (status === 'correct' || revealed) {
      nextQuestion()
      return
    }
    if (!value) return

    const correct = isCorrectCode(value, validCodes)
    setTotalAttempts(n => n + 1)
    recordCharAttempt(currentChar, correct)

    if (correct) {
      setStatus('correct')
      setTotalCorrect(n => n + 1)
    } else {
      setStatus('wrong')
      const newErrors = errors + 1
      setErrors(newErrors)
      if (newErrors >= ERRORS_BEFORE_REVEAL) setRevealed(true)
    }
  }

  useEffect(() => {
    if (status === 'wrong') {
      const t = setTimeout(() => {
        setStatus('idle')
        setInput('')
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [status])

  const progress = ((idx + (status === 'correct' || revealed ? 1 : 0)) / questions.length) * 100
  const frameColor =
    status === 'correct'
      ? 'border-emerald-600'
      : status === 'wrong'
        ? 'border-destructive'
        : revealed
          ? 'border-[hsl(var(--gold))]'
          : 'border-foreground/15'

  return (
    <div className="max-w-3xl mx-auto px-6 py-5 space-y-4">
      {/* 進度列 + 計數 */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between font-mono text-[11px]">
          <span className="tracking-[0.25em] text-muted-foreground uppercase">進度</span>
          <span className="text-foreground">
            <span className="text-base font-semibold font-serif">{idx + 1}</span>
            <span className="text-muted-foreground"> / {questions.length}</span>
          </span>
        </div>
        <div className="h-[2px] w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-vermilion transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 大字字帖框（縮為 180px） */}
      <div
        key={currentChar}
        className={`relative w-[180px] h-[180px] mx-auto rounded-lg border-[3px] ${frameColor} bg-card grid-paper flex items-center justify-center transition-colors duration-300 animate-seal-in`}
      >
        <span className="absolute left-0 right-0 top-1/2 h-px bg-foreground/[0.08] -translate-y-1/2" />
        <span className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.08] -translate-x-1/2" />
        <span className="font-serif text-[7.5rem] leading-none font-medium select-none relative z-10">
          {currentChar}
        </span>
        {status === 'correct' && (
          <span className="absolute top-2 right-2 seal-stamp text-[10px] animate-seal-in">正</span>
        )}
        {revealed && status !== 'correct' && (
          <span className="absolute top-2 right-2 seal-stamp text-[10px] border-[hsl(var(--gold))] text-[hsl(var(--gold))]">
            解
          </span>
        )}
      </div>

      {/* 編碼輸入 */}
      <CodeInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        status={status}
        disabled={revealed && status !== 'correct'}
      />

      {/* 狀態提示與操作合併為一列 */}
      <div className="h-8 flex items-center justify-center gap-3 text-sm">
        {status === 'correct' && (
          <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            答對！再按空白前進
          </span>
        )}
        {status === 'wrong' && !revealed && (
          <span className="text-destructive font-medium">
            已錯 <span className="font-serif font-bold">{errors}</span> / {ERRORS_BEFORE_REVEAL} 次
          </span>
        )}
        {revealed && (
          <span className="text-muted-foreground">
            按 <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded border bg-card mx-0.5">space</kbd> 前進下一題
          </span>
        )}
        {!revealed && status !== 'correct' && (
          <span className="inline-flex items-center gap-1.5 text-xs ml-1">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="px-2.5 py-1 rounded border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/10 transition-colors cursor-pointer"
            >
              揭示
            </button>
            <button
              type="button"
              onClick={nextQuestion}
              className="px-2.5 py-1 rounded text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              跳過
            </button>
          </span>
        )}
      </div>

      {/* 編碼揭示區 */}
      {(revealed || status === 'correct') && (
        <div className="pt-3 border-t border-border">
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground text-center mb-2 uppercase">
            本字所有可行編碼
          </div>
          <CodesReveal codes={validCodes} />
        </div>
      )}
    </div>
  )
}
