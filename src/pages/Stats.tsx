import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { loadSessions, loadAllCharStats, clearAll } from '@/lib/storage'
import dictData from '@/data/newcj.json'
import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'

const dict = dictData as Record<string, string[]>

export default function Stats() {
  const [reloadKey, setReloadKey] = useState(0)

  const sessions = useMemo(() => loadSessions(), [reloadKey])
  const charStats = useMemo(() => loadAllCharStats(), [reloadKey])

  const cpmData = sessions.map((s, i) => ({
    n: i + 1,
    cpm: s.cpm,
    accuracy: Math.round(s.accuracy * 100),
  }))

  const weakChars = Object.entries(charStats)
    .filter(([, s]) => s.attempts >= 3)
    .map(([ch, s]) => ({ ch, rate: s.errors / s.attempts, attempts: s.attempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 20)

  function handleClear() {
    if (!confirm('確定清除所有紀錄？此動作無法復原。')) return
    clearAll()
    setReloadKey(k => k + 1)
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">個人紀錄</h1>
        <Button variant="outline" onClick={handleClear}>清除所有紀錄</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>速度趨勢（最近 {sessions.length} 場）</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">尚無紀錄。完成一回單字或文章練習後會出現。</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={cpmData}>
                <XAxis dataKey="n" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpm" stroke="#4a90e2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>最常錯的 20 字</CardTitle></CardHeader>
        <CardContent>
          {weakChars.length === 0 ? (
            <p className="text-muted-foreground text-sm">尚無資料。</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {weakChars.map(({ ch, rate, attempts }) => {
                const codes = sortCodesByLength(dict[ch] ?? [])
                return (
                  <div key={ch} className="flex items-center gap-3 px-3 py-2 rounded border">
                    <div className="text-3xl font-semibold w-10 text-center">{ch}</div>
                    <div className="flex-1">
                      <div className="text-sm">{codes.map(c => codeToRadicalString(c)).join(' / ')}</div>
                      <div className="text-xs text-muted-foreground">
                        錯誤率 {Math.round(rate * 100)}% · {attempts} 次
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
