import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const SOURCE_URL =
  'https://gist.githubusercontent.com/stakira/6c6b2f0a577661eee713a5b040b7263f/raw/021a57400ba250869276da64e7234b1724174e8e/tc_zhangyong1979.txt'
const OUTPUT = resolve('src/data/edu4808.json')

async function main() {
  console.log(`下載 ${SOURCE_URL} ...`)
  const res = await fetch(SOURCE_URL)
  if (!res.ok) {
    console.error(`下載失敗：${res.status} ${res.statusText}`)
    process.exit(1)
  }
  const text = await res.text()
  const lines = text.split('\n')
  const body = lines.slice(1).join('\n').replace(/\s/g, '')
  const chars = Array.from(body)

  const cjkChars = chars.filter(c => {
    const cp = c.codePointAt(0)!
    return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
  })

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, JSON.stringify(cjkChars))

  console.log(`✓ 寫入 ${OUTPUT}：${cjkChars.length} 字`)
  if (cjkChars.length !== 4808) {
    console.warn(`⚠ 預期 4808 字，實得 ${cjkChars.length}。請檢查來源是否仍正確。`)
  }
}

main()
