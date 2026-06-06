import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import * as fontkit from 'fontkit'

// 產生 public/favicon.svg：
// 把「新」字從 Noto Serif TC Bold（導覽列 .seal-stamp 同款字型）轉成向量 path，
// 依字形外框（bbox）數學置中，避免 <text> 的基準線與系統字型回退造成偏移。
//
// 用法：npm run build:favicon

const FONT_URL =
  'https://github.com/notofonts/noto-cjk/raw/main/Serif/OTF/TraditionalChinese/NotoSerifCJKtc-Bold.otf'
const FONT_CACHE = join(tmpdir(), 'NotoSerifCJKtc-Bold.otf')
const OUT_PATH = resolve(import.meta.dirname, '../public/favicon.svg')

const CHAR = '新'
const VIEWBOX = 64 // viewBox 為 64x64，幾何中心 (32, 32)
const CENTER = VIEWBOX / 2
const GLYPH_SIZE = 34 // 字形最長邊的目標尺寸，比例對齊導覽列印章

async function ensureFont(): Promise<Buffer> {
  if (!existsSync(FONT_CACHE)) {
    console.log(`下載字型：${FONT_URL}`)
    const res = await fetch(FONT_URL)
    if (!res.ok) throw new Error(`字型下載失敗：HTTP ${res.status}`)
    writeFileSync(FONT_CACHE, Buffer.from(await res.arrayBuffer()))
  }
  return readFileSync(FONT_CACHE)
}

function round(n: number, digits: number): number {
  return Number(n.toFixed(digits))
}

const font = fontkit.create(await ensureFont()) as fontkit.Font
const glyph = font.layout(CHAR).glyphs[0]
const { minX, minY, maxX, maxY } = glyph.bbox
const width = maxX - minX
const height = maxY - minY

// 字型座標 y 軸朝上，轉成 SVG 座標需以 scale(s, -s) 翻轉，
// 並把 bbox 中心平移到 viewBox 中心。
const s = GLYPH_SIZE / Math.max(width, height)
const tx = round(CENTER - s * (minX + maxX) / 2, 3)
const ty = round(CENTER + s * (minY + maxY) / 2, 3)

const d = glyph.path.toSVG()

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">
  <!-- 由 scripts/build-favicon.ts 產生，勿手動編輯。
       對應 .seal-stamp 印章樣式：亮色用朱紅，暗色用金（CSS 變數 vermilion）。 -->
  <style>
    .seal { stroke: #b62020; }
    .char { fill: #b62020; }
    @media (prefers-color-scheme: dark) {
      .seal { stroke: #d1a861; }
      .char { fill: #d1a861; }
    }
  </style>
  <rect class="seal" x="4" y="4" width="56" height="56" rx="10" fill="none" stroke-width="4.5" />
  <path class="char" transform="translate(${tx} ${ty}) scale(${round(s, 6)} ${round(-s, 6)})" d="${d}" />
</svg>
`

writeFileSync(OUT_PATH, svg)
console.log(
  `已輸出 ${OUT_PATH}\n` +
    `字形 bbox：x ${minX}..${maxX}，y ${minY}..${maxY}（${width}x${height} font units）\n` +
    `縮放 ${round(s, 6)}，平移 (${tx}, ${ty})，bbox 中心對齊 (${CENTER}, ${CENTER})`
)
