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
    if (e.key === ' ') {
      e.preventDefault()
      onSubmit(value)
      return
    }
    if (disabled) {
      e.preventDefault()
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

  const frame = {
    idle: 'border-border bg-card',
    correct: 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20',
    wrong: 'border-destructive bg-destructive/10',
  }[status]

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 w-1 h-1 pointer-events-none"
      />
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'group relative min-w-[300px] h-[60px] flex items-center justify-center rounded-lg border-2 px-6 transition-colors duration-200',
          'font-serif text-2xl tracking-[0.3em] cursor-text',
          frame,
        )}
      >
        {radicals ? (
          <span className="select-none">{radicals}</span>
        ) : (
          <span className="text-muted-foreground/60 text-sm font-sans tracking-normal">
            打字根鍵後按空白送出
          </span>
        )}
        {!disabled && radicals && (
          <span className="ml-1 inline-block w-[2px] h-6 bg-foreground/70 animate-pulse" />
        )}
      </div>
      {value && (
        <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-muted-foreground/70">
          {value.split('').join(' ')}
        </div>
      )}
    </div>
  )
}
