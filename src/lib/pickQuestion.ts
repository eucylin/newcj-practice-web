import type { CharStat } from './storage'

const WEAK_THRESHOLD_ATTEMPTS = 3

export function weakCharsFromStats(
  stats: Record<string, CharStat>,
  topRatio: number = 0.2,
): string[] {
  const eligible = Object.entries(stats).filter(([, s]) => s.attempts >= WEAK_THRESHOLD_ATTEMPTS)
  const sorted = eligible
    .map(([ch, s]) => [ch, s.errors / s.attempts] as const)
    .sort((a, b) => b[1] - a[1])
  const cutoff = Math.max(1, Math.ceil(sorted.length * topRatio))
  return sorted.slice(0, cutoff).map(([ch]) => ch)
}

export function pickQuestions(
  pool: string[],
  count: number,
  weakChars: string[],
  weakWeight: number = 2,
  random: () => number = Math.random,
): string[] {
  const target = Math.min(count, pool.length)
  const weakSet = new Set(weakChars)
  const weights = pool.map(ch => (weakSet.has(ch) ? weakWeight : 1))
  const selected: string[] = []
  const remainingPool = [...pool]
  const remainingWeights = [...weights]

  while (selected.length < target && remainingPool.length > 0) {
    const total = remainingWeights.reduce((s, w) => s + w, 0)
    let r = random() * total
    let idx = 0
    for (; idx < remainingWeights.length; idx++) {
      r -= remainingWeights[idx]
      if (r <= 0) break
    }
    if (idx >= remainingPool.length) idx = remainingPool.length - 1
    selected.push(remainingPool[idx])
    remainingPool.splice(idx, 1)
    remainingWeights.splice(idx, 1)
  }

  return selected
}
