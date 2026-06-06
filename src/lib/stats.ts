export function calcCPM(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return Math.round((correctChars / durationMs) * 60_000)
}

export function calcAccuracy(correct: number, total: number): number {
  if (total <= 0) return 1
  return correct / total
}

/** 將毫秒格式化為 m:ss（例如 0:27、12:05） */
export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}
