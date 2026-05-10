import { useEffect, useMemo, useState } from 'react'
import { CodeInput } from './CodeInput'
import { CodesReveal } from './CodesReveal'
import { Button } from '@/components/ui/button'
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
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-10">
      {/* 進度列 + 計數 */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between font-mono text-xs">
          <span className="tracking-[0.25em] text-muted-foreground uppercase">
            進度 PROGRESS
          </span>
          <span className="text-foreground">
            <span className="text-xl font-semibold font-serif">{idx + 1}</span>
            <span className="text-muted-foreground"> / {questions.length}</span>
          </span>
        </div>
        <div className="h-[3px] w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-vermilion transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 大字字帖框 */}
      <div className="relative">
        <div
          key={currentChar}
          className={`relative aspect-square max-w-[280px] mx-auto rounded-lg border-[3px] ${frameColor} bg-card grid-paper flex items-center justify-center transition-colors duration-300 animate-seal-in`}
        >
          {/* 田字格中心十字虛線 */}
          <span className="absolute left-0 right-0 top-1/2 h-px bg-foreground/[0.08] -translate-y-1/2" />
          <span className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/[0.08] -translate-x-1/2" />
          {/* 字 */}
          <span className="font-serif text-[10rem] leading-none font-medium select-none relative z-10">
            {currentChar}
          </span>
          {/* 答對印章 */}
          {status === 'correct' && (
            <span className="absolute top-3 right-3 seal-stamp text-xs animate-seal-in">正</span>
          )}
          {revealed && status !== 'correct' && (
            <span className="absolute top-3 right-3 seal-stamp text-xs border-[hsl(var(--gold))] text-[hsl(var(--gold))]">
              解
            </span>
          )}
        </div>
      </div>

      {/* 編碼輸入 */}
      <CodeInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        status={status}
        disabled={revealed && status !== 'correct'}
      />

      {/* 狀態提示 */}
      <div className="text-center text-sm font-medium h-6">
        {status === 'correct' && (
          <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            答對！再按空白前進
          </span>
        )}
        {status === 'wrong' && !revealed && (
          <span className="text-destructive">
            已錯 <span className="font-serif font-bold text-lg">{errors}</span> / {ERRORS_BEFORE_REVEAL} 次
          </span>
        )}
        {revealed && <span className="text-muted-foreground">按 <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border bg-card mx-0.5">space</kbd> 前進下一題</span>}
      </div>

      {/* 操作按鈕 */}
      {!revealed && status !== 'correct' && (
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => setRevealed(true)}
            className="border-[hsl(var(--gold))]/40 text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/10 hover:text-[hsl(var(--gold))]"
          >
            揭示解答
          </Button>
          <Button variant="ghost" onClick={nextQuestion} className="text-muted-foreground">
            跳過 →
          </Button>
        </div>
      )}

      {/* 編碼揭示區 */}
      {(revealed || status === 'correct') && (
        <div className="pt-8 border-t border-border">
          <div className="text-xs tracking-[0.3em] text-muted-foreground text-center mb-4 uppercase">
            本字所有可行編碼
          </div>
          <CodesReveal codes={validCodes} />
        </div>
      )}
    </div>
  )
}
