import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { homedir } from 'node:os'

export type Levels = {
  beginner: string[]
  intermediate: string[]
  advanced: string[]
}

export function computeCharFreq(essayText: string, eduChars: string[]): Record<string, number> {
  const eduSet = new Set(eduChars)
  const freq: Record<string, number> = {}

  for (const line of essayText.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const tabIdx = line.indexOf('\t')
    if (tabIdx < 0) continue
    const word = line.slice(0, tabIdx)
    const f = parseInt(line.slice(tabIdx + 1), 10)
    if (!Number.isFinite(f)) continue

    for (const ch of word) {
      if (eduSet.has(ch)) {
        freq[ch] = (freq[ch] ?? 0) + f
      }
    }
  }

  return freq
}

export function splitLevels(
  eduChars: string[],
  freq: Record<string, number>,
  sizes: [number, number, number] = [1500, 1500, 99999],
): Levels {
  const sorted = [...eduChars].sort((a, b) => (freq[b] ?? 0) - (freq[a] ?? 0))
  const [n1, n2] = sizes
  return {
    beginner: sorted.slice(0, n1),
    intermediate: sorted.slice(n1, n1 + n2),
    advanced: sorted.slice(n1 + n2),
  }
}

function expandPath(p: string): string {
  return p.startsWith('~') ? resolve(homedir(), p.slice(2)) : resolve(p)
}

function main() {
  const [, , essayArg, eduArg, outputArg] = process.argv
  if (!essayArg || !eduArg || !outputArg) {
    console.error('Usage: tsx build-levels.ts <essay.txt> <edu4808.json> <levels.json>')
    process.exit(1)
  }

  const essayText = readFileSync(expandPath(essayArg), 'utf8')
  const eduChars: string[] = JSON.parse(readFileSync(expandPath(eduArg), 'utf8'))

  const freq = computeCharFreq(essayText, eduChars)
  const levels = splitLevels(eduChars, freq, [1500, 1500, 99999])

  const outPath = expandPath(outputArg)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(levels))

  console.log(
    `✓ 寫入 ${outPath}：入門 ${levels.beginner.length}、進階 ${levels.intermediate.length}、精通 ${levels.advanced.length}`
  )
}

const isMain =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('build-levels.ts') ||
  process.argv[1]?.endsWith('build-levels.js')
if (isMain) main()
