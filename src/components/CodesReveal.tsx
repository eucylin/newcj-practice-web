import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'
import { Badge } from '@/components/ui/badge'

interface Props {
  codes: string[]
}

export function CodesReveal({ codes }: Props) {
  const sorted = sortCodesByLength(codes)
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {sorted.map((code, i) => {
        const label = i === 0 ? '簡碼' : code.length >= 4 ? '完整／容錯' : '其他'
        return (
          <div key={code} className="flex flex-col items-center gap-1 px-4 py-2 rounded-md border">
            <Badge variant="secondary">{label}</Badge>
            <span className="text-xl tracking-widest">{codeToRadicalString(code)}</span>
          </div>
        )
      })}
    </div>
  )
}
