import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { homedir } from 'node:os'

export function parseDict(content: string): Record<string, string[]> {
  const lines = content.split('\n')
  const headerEndIdx = lines.findIndex(l => l.trim() === '...')
  const dataStart = headerEndIdx >= 0 ? headerEndIdx + 1 : 0

  const result: Record<string, string[]> = {}

  for (let i = dataStart; i < lines.length; i++) {
    const line = lines[i]
    if (!line || line.startsWith('#')) continue

    const parts = line.split('\t')
    if (parts.length < 2) continue

    const text = parts[0]
    const code = parts[1]
    if (!text || !code) continue

    const chars = Array.from(text)
    if (chars.length !== 1) continue
    const cp = chars[0].codePointAt(0)!
    const isCJK =
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x20000 && cp <= 0x2a6df)
    if (!isCJK) continue

    if (!result[text]) result[text] = []
    if (!result[text].includes(code)) result[text].push(code)
  }

  for (const key of Object.keys(result)) {
    result[key].sort((a, b) => a.length - b.length || a.localeCompare(b))
  }

  return result
}

function expandPath(p: string): string {
  return p.startsWith('~') ? resolve(homedir(), p.slice(2)) : resolve(p)
}

function main() {
  const [, , inputArg, outputArg] = process.argv
  if (!inputArg || !outputArg) {
    console.error('Usage: tsx build-newcj-dict.ts <input.yaml> <output.json>')
    process.exit(1)
  }
  const inputPath = expandPath(inputArg)
  const outputPath = expandPath(outputArg)

  const content = readFileSync(inputPath, 'utf8')
  const dict = parseDict(content)

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, JSON.stringify(dict))

  const charCount = Object.keys(dict).length
  const codeCount = Object.values(dict).reduce((s, a) => s + a.length, 0)
  console.log(`✓ 寫入 ${outputPath}：${charCount} 字、${codeCount} 編碼`)
}

const isMain = process.argv[1]?.endsWith('build-newcj-dict.ts') || process.argv[1]?.endsWith('build-newcj-dict.js')
if (isMain) main()
