export function isCorrectCode(input: string, validCodes: string[]): boolean {
  if (!input) return false
  const normalized = input.toLowerCase()
  return validCodes.some(code => code.toLowerCase() === normalized)
}

export function sortCodesByLength(codes: string[]): string[] {
  return [...codes].sort((a, b) => a.length - b.length || a.localeCompare(b))
}

/** 取最短編碼；同長度時保留字典原始順序（取第一個出現者） */
export function shortestCode(codes: string[]): string | undefined {
  let best: string | undefined
  for (const code of codes) {
    if (best === undefined || code.length < best.length) best = code
  }
  return best
}
