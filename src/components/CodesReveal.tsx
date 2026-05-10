import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'

interface Props {
  codes: string[]
}

export function CodesReveal({ codes }: Props) {
  const sorted = sortCodesByLength(codes)
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {sorted.map((code, i) => {
        const label = i === 0 ? '簡碼' : code.length >= 4 ? '完整／容錯' : '其他'
        const isPrimary = i === 0
        return (
          <div
            key={code}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md border ${
              isPrimary
                ? 'border-vermilion bg-vermilion-soft/30 dark:bg-vermilion-soft/40'
                : 'border-border bg-card'
            }`}
          >
            <span
              className={`font-mono text-[9px] tracking-[0.2em] uppercase ${
                isPrimary ? 'text-vermilion font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
            <span className="font-serif text-lg tracking-[0.25em] leading-none">
              {codeToRadicalString(code)}
            </span>
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-foreground/70">
              {code}
            </span>
          </div>
        )
      })}
    </div>
  )
}
