import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'

interface Props {
  codes: string[]
}

export function CodesReveal({ codes }: Props) {
  const sorted = sortCodesByLength(codes)
  const minLen = sorted[0]?.length ?? 0
  const maxLen = sorted[sorted.length - 1]?.length ?? 0
  const hasShortest = minLen !== maxLen

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {sorted.map(code => {
        const isShortest = hasShortest && code.length === minLen
        return (
          <div
            key={code}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md border ${
              isShortest
                ? 'border-vermilion bg-vermilion-soft/30 dark:bg-vermilion-soft/40'
                : 'border-border bg-card'
            }`}
          >
            {isShortest && (
              <span className="font-mono text-[10px] tracking-[0.15em] px-1.5 py-0.5 rounded border border-vermilion text-vermilion font-medium leading-none">
                最短
              </span>
            )}
            <span className="font-serif text-lg tracking-[0.25em] leading-none">
              {codeToRadicalString(code)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
