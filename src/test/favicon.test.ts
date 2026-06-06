import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// favicon 以 image/svg+xml 提供，瀏覽器用「嚴格」XML 解析器讀取，
// 任何解析錯誤（例如註解中含 "--"）都會讓分頁圖示完全無法顯示。
describe('public/favicon.svg', () => {
  it('是合法的 XML，瀏覽器才能渲染為分頁圖示', () => {
    const svg = readFileSync(
      path.resolve(__dirname, '../../public/favicon.svg'),
      'utf8'
    )
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const parserError = doc.querySelector('parsererror')
    expect(parserError?.textContent ?? '').toBe('')
  })
})
