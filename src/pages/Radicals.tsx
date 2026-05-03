import { useMemo } from 'react'
import { RADICAL_KEYS, keyToRadical } from '@/lib/codeMap'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

const KEYBOARD_ROWS = [
  'qwertyuiop'.split(''),
  'asdfghjkl;'.split(''),
  'zxcvbnm'.split(''),
]

export default function Radicals() {
  const examplesByKey = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const key of RADICAL_KEYS) result[key] = []
    for (const [char, codes] of Object.entries(dict)) {
      for (const code of codes) {
        const first = code[0]
        if (RADICAL_KEYS.includes(first) && result[first].length < 4) {
          result[first].push(char)
          break
        }
      }
    }
    return result
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">字根表</h1>
        <p className="text-muted-foreground mt-2">
          大新倉頡共 24 個基本字根（不含「難」），加上 1 個特殊鍵 <code>;</code> →「；」。
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">鍵盤對照</h2>
        <div className="space-y-2">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex gap-2 justify-center">
              {row.map(key => {
                const r = keyToRadical(key)
                return (
                  <div key={key} className="w-16 h-20 rounded-md border flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground">{key.toUpperCase()}</div>
                    <div className="text-2xl">{r ?? '·'}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">字根與範例字</h2>
        <div className="grid grid-cols-3 gap-3">
          {RADICAL_KEYS.map(key => {
            const r = keyToRadical(key)!
            const examples = examplesByKey[key]
            return (
              <div key={key} className="p-3 rounded-md border">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium">{r}</span>
                  <code className="text-xs text-muted-foreground">{key.toUpperCase()}</code>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {examples.length > 0 ? `例：${examples.join('、')}` : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">與一般倉頡的差異</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>最大碼長為 4 碼（一般倉頡可達 5 碼）</li>
          <li>取碼規則固定為「頭尾、頭尾」</li>
          <li>多簡碼設計：常用字常常 1–2 碼即可輸入</li>
          <li>多容錯碼：對拆碼有爭議的字提供替代編碼</li>
        </ul>
      </section>
    </div>
  )
}
