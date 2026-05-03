import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CharacterPracticeRunner } from '@/components/CharacterPracticeRunner'
import { pickQuestions, weakCharsFromStats } from '@/lib/pickQuestion'
import { loadAllCharStats, loadSettings } from '@/lib/storage'
import levelsData from '@/data/levels.json'

const levels = levelsData as { beginner: string[]; intermediate: string[]; advanced: string[] }

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'all'

export default function CharacterPractice() {
  const [level, setLevel] = useState<LevelKey>(loadSettings().defaultLevel)
  const [questions, setQuestions] = useState<string[] | null>(null)

  function start() {
    const pool = level === 'all'
      ? [...levels.beginner, ...levels.intermediate, ...levels.advanced]
      : levels[level]
    const weak = weakCharsFromStats(loadAllCharStats(), 0.2)
    const picked = pickQuestions(pool, 100, weak, 2)
    setQuestions(picked)
  }

  if (questions) {
    return <CharacterPracticeRunner questions={questions} onFinish={() => setQuestions(null)} />
  }

  return (
    <div className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">單字練習</h1>
      <p className="text-muted-foreground">每回合 100 題，弱點字會優先出現。</p>
      <RadioGroup value={level} onValueChange={v => setLevel(v as LevelKey)}>
        {([
          ['beginner', '入門', levels.beginner.length],
          ['intermediate', '進階', levels.intermediate.length],
          ['advanced', '精通', levels.advanced.length],
          ['all', '全部', levels.beginner.length + levels.intermediate.length + levels.advanced.length],
        ] as [LevelKey, string, number][]).map(([k, lab, n]) => (
          <div key={k} className="flex items-center gap-3">
            <RadioGroupItem id={`lvl-${k}`} value={k} />
            <Label htmlFor={`lvl-${k}`} className="cursor-pointer">
              {lab} <span className="text-muted-foreground">（{n} 字）</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={start} className="w-full">開始 100 題</Button>
    </div>
  )
}
