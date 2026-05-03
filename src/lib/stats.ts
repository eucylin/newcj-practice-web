export function calcCPM(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return Math.round((correctChars / durationMs) * 60_000)
}

export function calcAccuracy(correct: number, total: number): number {
  if (total <= 0) return 1
  return correct / total
}
