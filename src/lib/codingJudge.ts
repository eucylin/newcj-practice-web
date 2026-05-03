export function isCorrectCode(input: string, validCodes: string[]): boolean {
  if (!input) return false
  const normalized = input.toLowerCase()
  return validCodes.some(code => code.toLowerCase() === normalized)
}

export function sortCodesByLength(codes: string[]): string[] {
  return [...codes].sort((a, b) => a.length - b.length || a.localeCompare(b))
}
