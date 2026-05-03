const RADICAL_TABLE: Record<string, string> = {
  a: '日', b: '月', c: '金', d: '木', e: '水', f: '火', g: '土',
  h: '竹', i: '戈', j: '十', k: '大', l: '中', m: '一', n: '弓',
  o: '人', p: '心', q: '手', r: '口', s: '尸', t: '廿', u: '山',
  v: '女', w: '田', x: '難', y: '卜', z: 'Ｚ', ';': '；',
}

const REVERSE_TABLE: Record<string, string> = Object.fromEntries(
  Object.entries(RADICAL_TABLE).map(([k, v]) => [v, k])
)

export const RADICAL_KEYS = Object.keys(RADICAL_TABLE)

export function keyToRadical(key: string): string | undefined {
  return RADICAL_TABLE[key]
}

export function radicalToKey(radical: string): string | undefined {
  return REVERSE_TABLE[radical]
}

export function codeToRadicalString(code: string): string {
  return Array.from(code).map(c => RADICAL_TABLE[c] ?? c).join('')
}

export function isRadicalKey(key: string): boolean {
  return key in RADICAL_TABLE
}
