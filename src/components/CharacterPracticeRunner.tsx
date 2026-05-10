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

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-sm text-muted-foreground text-center">
        第 {idx + 1} / {questions.length} 題
      </div>

      <div className="text-center text-[120px] leading-none font-semibold">{currentChar}</div>

      <CodeInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        status={status}
        disabled={revealed && status !== 'correct'}
      />

      <div className="text-center text-sm">
        {status === 'correct' && <span className="text-green-600">✓ 答對！再按空白前進</span>}
        {status === 'wrong' && !revealed && (
          <span className="text-amber-600">已錯 {errors} / {ERRORS_BEFORE_REVEAL} 次</span>
        )}
        {revealed && <span className="text-muted-foreground">按空白前進下一題</span>}
      </div>

      {!revealed && status !== 'correct' && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)}>▸ 揭示解答</Button>
          <Button variant="ghost" onClick={nextQuestion}>⏭ 跳過</Button>
        </div>
      )}

      {(revealed || status === 'correct') && (
        <div className="pt-6 border-t">
          <div className="text-xs text-muted-foreground text-center mb-3">本字所有可行編碼</div>
          <CodesReveal codes={validCodes} />
        </div>
      )}
    </div>
  )
}
