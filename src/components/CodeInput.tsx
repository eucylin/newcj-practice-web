import { useEffect, useRef } from 'react'
import { codeToRadicalString, isRadicalKey } from '@/lib/codeMap'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled?: boolean
  status?: 'idle' | 'correct' | 'wrong'
  className?: string
}

export function CodeInput({ value, onChange, onSubmit, disabled, status = 'idle', className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const radicals = codeToRadicalString(value)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === ' ') {
      e.preventDefault()
      onSubmit(value)
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      onChange(value.slice(0, -1))
      return
    }
    if (e.key.length === 1) {
      const k = e.key.toLowerCase()
      if (isRadicalKey(k)) {
        e.preventDefault()
        onChange(value + k)
      } else {
        e.preventDefault()
      }
    }
  }

  const ringColor = {
    idle: 'border-border',
    correct: 'border-green-500',
    wrong: 'border-red-500',
  }[status]

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="absolute opacity-0 w-1 h-1 pointer-events-none"
      />
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'min-w-[280px] min-h-[64px] flex items-center justify-center rounded-lg border-2 px-6 py-3',
          'text-3xl tracking-[0.4em] font-medium cursor-text bg-muted/30',
          ringColor,
        )}
      >
        {radicals || <span className="text-muted-foreground text-base tracking-normal">點此後開始輸入</span>}
        {!disabled && <span className="ml-1 inline-block w-[2px] h-7 bg-foreground animate-pulse" />}
      </div>
    </div>
  )
}
