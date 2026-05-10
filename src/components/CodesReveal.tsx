import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'

interface Props {
  codes: string[]
}

export function CodesReveal({ codes }: Props) {
  const sorted = sortCodesByLength(codes)
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {sorted.map((code, i) => {
        const label = i === 0 ? '簡碼' : code.length >= 4 ? '完整／容錯' : '其他'
        const isPrimary = i === 0
        return (
          <div
            key={code}
            className={`flex flex-col items-center gap-2 px-5 py-3 rounded-md border-2 transition-colors ${
              isPrimary
                ? 'border-vermilion bg-vermilion-soft/30 dark:bg-vermilion-soft/20'
                : 'border-border bg-card'
            }`}
          >
            <span
              className={`font-mono text-[10px] tracking-[0.25em] uppercase ${
                isPrimary ? 'text-vermilion font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
            <span className="font-serif text-xl tracking-[0.3em] leading-none">
              {codeToRadicalString(code)}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70">
              {code}
            </span>
          </div>
        )
      })}
    </div>
  )
}
