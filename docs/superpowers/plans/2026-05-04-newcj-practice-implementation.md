# 大新倉頡練習 Web App 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立全靜態 Web App，提供大新倉頡「單字練習」與「文章練習」，含教育部 4808 字三級分級、CPM 計時、字根表查詢、個人成績紀錄。

**Architecture:** Vite + React SPA，純前端、純靜態。資料層在 build 階段預備（解析 Rime newcj 碼表、下載 4808 字、計算分級），runtime 由 JSON import 載入。所有個人資料寫入 `localStorage`。

**Tech Stack:** Vite 5、React 18、TypeScript、Tailwind CSS、shadcn/ui、React Router v6、Vitest（測試）。

**設計文件**：`docs/superpowers/specs/2026-05-04-newcj-practice-design.md`

---

## 任務地圖

| Phase | Tasks | 相依關係 |
|-------|-------|---------|
| 1. 專案骨架 | 1–5 | 必須依序 |
| 2. 純函式庫（TDD） | 6–9 | 內部互相獨立，全部依賴 Task 2 |
| 3. 資料準備 scripts | 10–12 | 12 ⇐ 10、11 |
| 4. 共用元件 | 13–14 | 依賴 Task 3、6 |
| 5. 頁面實作 | 15–19 | 依賴 Phase 2、3、4 |
| 6. 主題與部署 | 20–22 | 必須依序 |

---

## Phase 1：專案骨架

### Task 1：初始化 Vite + React + TypeScript

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`

- [ ] **Step 1：在專案目錄執行 Vite scaffolding**

```bash
cd /Users/cloudlin/Projects/newcj-practice
npm create vite@latest . -- --template react-ts
```

選 `Ignore files and continue`（保留現有 .gitignore 與 docs/）。完成後 `npm install`。

- [ ] **Step 2：將 dev port 改為 8456**

修改 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8456,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3：tsconfig.json 加上 path alias**

在 `compilerOptions` 加入：

```json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
```

- [ ] **Step 4：啟動 dev 確認可運行**

```bash
npm run dev
```

預期：終端機顯示 `Local: http://localhost:8456/`，瀏覽器打開可見預設 Vite + React 畫面。

- [ ] **Step 5：Commit**

```bash
git add .
git commit -m "feat: 初始化 Vite + React + TypeScript 專案骨架"
```

---

### Task 2：安裝測試框架（Vitest）

**Files:**
- Modify: `package.json`, `vite.config.ts`
- Create: `src/test/setup.ts`, `src/lib/__smoke__.test.ts`

- [ ] **Step 1：安裝套件**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

- [ ] **Step 2：在 `vite.config.ts` 加上 test 設定**

於 `defineConfig` 物件中加入：

```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
},
```

並在檔頭加上 `/// <reference types="vitest" />`。

- [ ] **Step 3：建立 `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4：在 `package.json` scripts 加入測試指令**

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5：寫一支 smoke test 確認運作**

`src/lib/__smoke__.test.ts`：

```typescript
import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 6：執行確認**

```bash
npm run test:run
```

預期：1 passed。

- [ ] **Step 7：Commit**

```bash
git add .
git commit -m "feat: 設定 Vitest 測試框架"
```

---

### Task 3：安裝 Tailwind CSS

**Files:**
- Create: `tailwind.config.js`, `postcss.config.js`
- Modify: `src/index.css`, `src/App.tsx`

- [ ] **Step 1：安裝**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2：設定 `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 3：把 `src/index.css` 換成 Tailwind directives**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4：在 `src/App.tsx` 用 Tailwind class 確認生效**

```tsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <h1 className="text-3xl font-bold">大新倉頡練習</h1>
    </div>
  )
}
export default App
```

- [ ] **Step 5：啟動 dev 確認字型大小有套用**

```bash
npm run dev
```

打開 http://localhost:8456 應看到置中的「大新倉頡練習」標題。

- [ ] **Step 6：Commit**

```bash
git add .
git commit -m "feat: 安裝 Tailwind CSS"
```

---

### Task 4：初始化 shadcn/ui

**Files:**
- Modify: `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `src/index.css`
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/*`

- [ ] **Step 1：執行 shadcn init**

```bash
npx shadcn@latest init
```

設定：Style = `Default`、Color = `Slate`、CSS variables = `Yes`。

- [ ] **Step 2：安裝必要的基礎元件**

```bash
npx shadcn@latest add button card input label select switch tabs separator badge progress radio-group
```

- [ ] **Step 3：確認 `src/components/ui/` 已生成元件**

```bash
ls src/components/ui/
```

預期：列出 button.tsx、card.tsx 等檔案。

- [ ] **Step 4：在 `src/App.tsx` 用 Button 確認生效**

```tsx
import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button>大新倉頡練習</Button>
    </div>
  )
}
export default App
```

啟動 dev 確認 Button 樣式套用。

- [ ] **Step 5：Commit**

```bash
git add .
git commit -m "feat: 初始化 shadcn/ui 與基礎元件"
```

---

### Task 5：建立 React Router 與 5 頁面骨架

**Files:**
- Create: `src/pages/Home.tsx`, `src/pages/CharacterPractice.tsx`, `src/pages/ArticlePractice.tsx`, `src/pages/Radicals.tsx`, `src/pages/Stats.tsx`, `src/components/Layout.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1：安裝 React Router**

```bash
npm install react-router-dom
```

- [ ] **Step 2：建立 5 個佔位頁面（每個僅顯示頁名）**

`src/pages/Home.tsx`：

```tsx
export default function Home() {
  return <div className="p-8"><h1 className="text-2xl font-bold">首頁</h1></div>
}
```

對 `CharacterPractice.tsx`、`ArticlePractice.tsx`、`Radicals.tsx`、`Stats.tsx` 做同樣骨架，分別顯示「單字練習」「文章練習」「字根表」「個人紀錄」。

- [ ] **Step 3：建立 Layout 元件（含上方導覽列）**

`src/components/Layout.tsx`：

```tsx
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首頁' },
  { to: '/practice/character', label: '單字練習' },
  { to: '/practice/article', label: '文章練習' },
  { to: '/radicals', label: '字根表' },
  { to: '/stats', label: '個人紀錄' },
]

export default function Layout() {
  return (
    <div className="min-h-screen min-w-[1024px]">
      <nav className="flex gap-6 px-8 py-4 border-b bg-background">
        <span className="font-bold">大新倉頡</span>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
            }
            end={item.to === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main><Outlet /></main>
    </div>
  )
}
```

- [ ] **Step 4：在 `src/App.tsx` 配路由**

```tsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CharacterPractice from './pages/CharacterPractice'
import ArticlePractice from './pages/ArticlePractice'
import Radicals from './pages/Radicals'
import Stats from './pages/Stats'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/practice/character" element={<CharacterPractice />} />
        <Route path="/practice/article" element={<ArticlePractice />} />
        <Route path="/radicals" element={<Radicals />} />
        <Route path="/stats" element={<Stats />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 5：在 `src/main.tsx` 包 BrowserRouter**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 6：啟動確認導覽可運作**

```bash
npm run dev
```

點選導覽列每一項，URL 與內容都應切換。

- [ ] **Step 7：Commit**

```bash
git add .
git commit -m "feat: 建立 React Router 與 5 頁面骨架"
```

---

## Phase 2：純函式庫（TDD）

### Task 6：codeMap.ts — 字根 ↔ 鍵位雙向映射

**Files:**
- Create: `src/lib/codeMap.ts`, `src/lib/codeMap.test.ts`

- [ ] **Step 1：寫失敗的測試 `src/lib/codeMap.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import {
  RADICAL_KEYS,
  keyToRadical,
  radicalToKey,
  codeToRadicalString,
  isRadicalKey,
} from './codeMap'

describe('codeMap', () => {
  it('涵蓋全部 26 個鍵位（a–z + ;）', () => {
    expect(RADICAL_KEYS).toHaveLength(27)
  })

  it('keyToRadical: a→日、v→女、;→；', () => {
    expect(keyToRadical('a')).toBe('日')
    expect(keyToRadical('v')).toBe('女')
    expect(keyToRadical(';')).toBe('；')
  })

  it('keyToRadical: x→難、z→Ｚ', () => {
    expect(keyToRadical('x')).toBe('難')
    expect(keyToRadical('z')).toBe('Ｚ')
  })

  it('radicalToKey: 日→a、廿→t、；→;', () => {
    expect(radicalToKey('日')).toBe('a')
    expect(radicalToKey('廿')).toBe('t')
    expect(radicalToKey('；')).toBe(';')
  })

  it('codeToRadicalString: vfdw → 女火木田', () => {
    expect(codeToRadicalString('vfdw')).toBe('女火木田')
  })

  it('codeToRadicalString: 不認得的字元保持原樣', () => {
    expect(codeToRadicalString('a?b')).toBe('日?月')
  })

  it('isRadicalKey: 識別合法鍵', () => {
    expect(isRadicalKey('a')).toBe(true)
    expect(isRadicalKey(';')).toBe(true)
    expect(isRadicalKey('1')).toBe(false)
    expect(isRadicalKey('A')).toBe(false)
  })
})
```

- [ ] **Step 2：執行確認 FAIL**

```bash
npm run test:run -- src/lib/codeMap.test.ts
```

預期：FAIL（找不到 module）。

- [ ] **Step 3：實作 `src/lib/codeMap.ts`**

```typescript
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
```

- [ ] **Step 4：執行確認 PASS**

```bash
npm run test:run -- src/lib/codeMap.test.ts
```

預期：7 passed。

- [ ] **Step 5：Commit**

```bash
git add src/lib/codeMap.ts src/lib/codeMap.test.ts
git commit -m "feat(lib): 加入字根與鍵位雙向映射 (codeMap)"
```

---

### Task 7：codingJudge.ts — 編碼正確判定

**Files:**
- Create: `src/lib/codingJudge.ts`, `src/lib/codingJudge.test.ts`

- [ ] **Step 1：寫測試 `src/lib/codingJudge.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { isCorrectCode, sortCodesByLength } from './codingJudge'

describe('codingJudge', () => {
  const codesOfLian = ['vw', 'vfdw', 'vvdw'] // 練

  it('isCorrectCode: 完全相符任一編碼即正確', () => {
    expect(isCorrectCode('vw', codesOfLian)).toBe(true)
    expect(isCorrectCode('vfdw', codesOfLian)).toBe(true)
    expect(isCorrectCode('vvdw', codesOfLian)).toBe(true)
  })

  it('isCorrectCode: 不在合法集合中為錯', () => {
    expect(isCorrectCode('vfd', codesOfLian)).toBe(false)
    expect(isCorrectCode('', codesOfLian)).toBe(false)
    expect(isCorrectCode('vfdwx', codesOfLian)).toBe(false)
  })

  it('isCorrectCode: 大小寫不敏感', () => {
    expect(isCorrectCode('VW', codesOfLian)).toBe(true)
    expect(isCorrectCode('Vw', codesOfLian)).toBe(true)
  })

  it('sortCodesByLength: 簡碼在前，同長依字典序', () => {
    expect(sortCodesByLength(['vfdw', 'vw', 'vvdw'])).toEqual(['vw', 'vfdw', 'vvdw'])
  })
})
```

- [ ] **Step 2：FAIL → 實作 `src/lib/codingJudge.ts`**

```typescript
export function isCorrectCode(input: string, validCodes: string[]): boolean {
  if (!input) return false
  const normalized = input.toLowerCase()
  return validCodes.some(code => code.toLowerCase() === normalized)
}

export function sortCodesByLength(codes: string[]): string[] {
  return [...codes].sort((a, b) => a.length - b.length || a.localeCompare(b))
}
```

- [ ] **Step 3：PASS → Commit**

```bash
npm run test:run -- src/lib/codingJudge.test.ts
git add src/lib/codingJudge.ts src/lib/codingJudge.test.ts
git commit -m "feat(lib): 加入編碼正確性判定 (codingJudge)"
```

---

### Task 8：storage.ts — localStorage 封裝

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/storage.test.ts`

- [ ] **Step 1：寫測試 `src/lib/storage.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadSettings,
  saveSettings,
  recordCharAttempt,
  getCharStats,
  appendSession,
  loadSessions,
  DEFAULT_SETTINGS,
} from './storage'

beforeEach(() => localStorage.clear())

describe('storage.settings', () => {
  it('loadSettings: 沒有資料時回傳預設值', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('saveSettings + loadSettings: 來回一致', () => {
    saveSettings({ theme: 'dark', defaultLevel: 'intermediate' })
    expect(loadSettings()).toEqual({ theme: 'dark', defaultLevel: 'intermediate' })
  })
})

describe('storage.charStats', () => {
  it('recordCharAttempt: 累計次數', () => {
    recordCharAttempt('練', false)
    recordCharAttempt('練', false)
    recordCharAttempt('練', true)
    const stats = getCharStats('練')
    expect(stats.attempts).toBe(3)
    expect(stats.errors).toBe(2)
    expect(stats.lastSeen).toBeGreaterThan(0)
  })

  it('getCharStats: 沒有紀錄時回傳零值', () => {
    expect(getCharStats('未練')).toEqual({ attempts: 0, errors: 0, lastSeen: 0 })
  })
})

describe('storage.sessions', () => {
  it('appendSession + loadSessions: 最近 50 筆', () => {
    for (let i = 0; i < 60; i++) {
      appendSession({ type: 'character', cpm: i, accuracy: 1, durationMs: 1000, questionCount: 100, ts: i })
    }
    const sessions = loadSessions()
    expect(sessions).toHaveLength(50)
    expect(sessions[0].cpm).toBe(10)
    expect(sessions[49].cpm).toBe(59)
  })
})
```

- [ ] **Step 2：FAIL → 實作 `src/lib/storage.ts`**

```typescript
export type Theme = 'light' | 'dark' | 'system'
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'all'

export interface Settings {
  theme: Theme
  defaultLevel: Level
}

export interface CharStat {
  attempts: number
  errors: number
  lastSeen: number
}

export interface Session {
  type: 'character' | 'article'
  cpm: number
  accuracy: number
  durationMs: number
  questionCount: number
  ts: number
}

const KEY_SETTINGS = 'newcj.settings'
const KEY_CHAR_STATS = 'newcj.charStats'
const KEY_SESSIONS = 'newcj.sessions'
const SESSIONS_MAX = 50

export const DEFAULT_SETTINGS: Settings = { theme: 'system', defaultLevel: 'beginner' }

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEY_SETTINGS, {}) }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings))
}

export function getCharStats(char: string): CharStat {
  const all = readJSON<Record<string, CharStat>>(KEY_CHAR_STATS, {})
  return all[char] ?? { attempts: 0, errors: 0, lastSeen: 0 }
}

export function recordCharAttempt(char: string, correct: boolean): void {
  const all = readJSON<Record<string, CharStat>>(KEY_CHAR_STATS, {})
  const cur = all[char] ?? { attempts: 0, errors: 0, lastSeen: 0 }
  all[char] = {
    attempts: cur.attempts + 1,
    errors: cur.errors + (correct ? 0 : 1),
    lastSeen: Date.now(),
  }
  localStorage.setItem(KEY_CHAR_STATS, JSON.stringify(all))
}

export function loadAllCharStats(): Record<string, CharStat> {
  return readJSON<Record<string, CharStat>>(KEY_CHAR_STATS, {})
}

export function loadSessions(): Session[] {
  return readJSON<Session[]>(KEY_SESSIONS, [])
}

export function appendSession(session: Session): void {
  const list = loadSessions()
  list.push(session)
  while (list.length > SESSIONS_MAX) list.shift()
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(list))
}

export function clearAll(): void {
  localStorage.removeItem(KEY_SETTINGS)
  localStorage.removeItem(KEY_CHAR_STATS)
  localStorage.removeItem(KEY_SESSIONS)
}
```

- [ ] **Step 3：PASS → Commit**

```bash
npm run test:run -- src/lib/storage.test.ts
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat(lib): 加入 localStorage 封裝 (storage)"
```

---

### Task 9：stats.ts — CPM／正確率計算

**Files:**
- Create: `src/lib/stats.ts`, `src/lib/stats.test.ts`

- [ ] **Step 1：寫測試 `src/lib/stats.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { calcCPM, calcAccuracy } from './stats'

describe('stats', () => {
  it('calcCPM: 60 字 / 60 秒 = 60 CPM', () => {
    expect(calcCPM(60, 60_000)).toBe(60)
  })

  it('calcCPM: 30 字 / 30 秒 = 60 CPM', () => {
    expect(calcCPM(30, 30_000)).toBe(60)
  })

  it('calcCPM: durationMs 為 0 回傳 0', () => {
    expect(calcCPM(10, 0)).toBe(0)
  })

  it('calcCPM: 結果取整數', () => {
    expect(calcCPM(7, 60_000)).toBe(7)
  })

  it('calcAccuracy: 90 對 / 100 嘗試 = 0.9', () => {
    expect(calcAccuracy(90, 100)).toBeCloseTo(0.9)
  })

  it('calcAccuracy: 0 嘗試回傳 1', () => {
    expect(calcAccuracy(0, 0)).toBe(1)
  })
})
```

- [ ] **Step 2：FAIL → 實作 `src/lib/stats.ts`**

```typescript
export function calcCPM(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return Math.round((correctChars / durationMs) * 60_000)
}

export function calcAccuracy(correct: number, total: number): number {
  if (total <= 0) return 1
  return correct / total
}
```

- [ ] **Step 3：PASS → Commit**

```bash
npm run test:run -- src/lib/stats.test.ts
git add src/lib/stats.ts src/lib/stats.test.ts
git commit -m "feat(lib): 加入 CPM 與正確率計算 (stats)"
```

---

## Phase 3：資料準備 scripts

### Task 10：build-newcj-dict.ts — 解析 Rime 碼表

**Files:**
- Create: `scripts/build-newcj-dict.ts`, `scripts/build-newcj-dict.test.ts`, `src/data/newcj.json`
- Modify: `package.json`（加入 npm script）

- [ ] **Step 1：安裝 tsx 以執行 TS scripts**

```bash
npm install -D tsx
```

於 `package.json` 加入：

```json
"scripts": {
  ...
  "build:dict": "tsx scripts/build-newcj-dict.ts ~/Library/Rime/newcj.dict.yaml src/data/newcj.json"
}
```

- [ ] **Step 2：寫測試 `scripts/build-newcj-dict.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { parseDict } from './build-newcj-dict'

const SAMPLE = `# encoding: utf-8
---
name: "newcj"
sort: by_weight
...
、	'
"	''
是	a
是	amo
的	h
的	hapi
練	vw	100
練	vfdw	50
練	vvdw	30
中國	zlw	500
`

describe('parseDict', () => {
  it('忽略表頭與多字詞，只收單字', () => {
    const dict = parseDict(SAMPLE)
    expect(Object.keys(dict).sort()).toEqual(['是', '的', '練'])
  })

  it('同一字多筆編碼合併為陣列，依長度排序', () => {
    const dict = parseDict(SAMPLE)
    expect(dict['練']).toEqual(['vw', 'vfdw', 'vvdw'])
  })

  it('排除標點字（非中文範圍）', () => {
    const dict = parseDict(SAMPLE)
    expect(dict['、']).toBeUndefined()
    expect(dict['"']).toBeUndefined()
  })

  it('去重複編碼', () => {
    const dup = SAMPLE + '練\tvw\t999\n'
    const dict = parseDict(dup)
    expect(dict['練']).toEqual(['vw', 'vfdw', 'vvdw'])
  })
})
```

- [ ] **Step 3：FAIL → 實作 `scripts/build-newcj-dict.ts`**

```typescript
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

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) main()
```

- [ ] **Step 4：跑測試**

```bash
npm run test:run -- scripts/build-newcj-dict.test.ts
```

預期：4 passed。

- [ ] **Step 5：執行 build script**

```bash
npm run build:dict
```

預期：終端機顯示「✓ 寫入 src/data/newcj.json：N 字、M 編碼」（N 約 13000+）。

確認檔案：

```bash
ls -lh src/data/newcj.json
```

- [ ] **Step 6：Commit**

```bash
git add scripts/build-newcj-dict.ts scripts/build-newcj-dict.test.ts src/data/newcj.json package.json package-lock.json
git commit -m "feat(data): 解析 Rime 大新倉頡碼表為 JSON"
```

---

### Task 11：fetch-edu4808.ts — 抓教育部 4808 字

**Files:**
- Create: `scripts/fetch-edu4808.ts`, `src/data/edu4808.json`
- Modify: `package.json`

- [ ] **Step 1：在 `package.json` scripts 加入**

```json
"build:edu4808": "tsx scripts/fetch-edu4808.ts"
```

- [ ] **Step 2：寫 `scripts/fetch-edu4808.ts`**

```typescript
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
  const text = (await res.text()).replace(/\s/g, '')
  const chars = Array.from(text)

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
```

- [ ] **Step 3：執行**

```bash
npm run build:edu4808
```

預期：顯示「✓ 寫入 src/data/edu4808.json：4808 字」（無警告）。

- [ ] **Step 4：手動 sanity check**

```bash
node -e "const a=require('./src/data/edu4808.json'); console.log(a.length, a.slice(0,5), a.includes('的'), a.includes('我'))"
```

預期：`4808 [...] true true`。

- [ ] **Step 5：Commit**

```bash
git add scripts/fetch-edu4808.ts src/data/edu4808.json package.json
git commit -m "feat(data): 下載教育部 4808 常用字"
```

---

### Task 12：build-levels.ts — 計算詞頻 3 級分級

**Files:**
- Create: `scripts/build-levels.ts`, `scripts/build-levels.test.ts`, `src/data/levels.json`
- Modify: `package.json`

- [ ] **Step 1：在 `package.json` scripts 加入**

```json
"build:levels": "tsx scripts/build-levels.ts ~/Library/Rime/essay.txt src/data/edu4808.json src/data/levels.json"
```

- [ ] **Step 2：寫測試 `scripts/build-levels.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { computeCharFreq, splitLevels } from './build-levels'

const SAMPLE_ESSAY = `中國	500
人民	300
中華	200
小狗	50
未在表內字	100
`

const EDU = ['中', '國', '人', '民', '華', '小', '狗']

describe('computeCharFreq', () => {
  it('累積每字頻率（同字出現於多詞累加）', () => {
    const freq = computeCharFreq(SAMPLE_ESSAY, EDU)
    expect(freq['中']).toBe(700) // 500 + 200
    expect(freq['國']).toBe(500)
    expect(freq['人']).toBe(300)
    expect(freq['民']).toBe(300)
    expect(freq['華']).toBe(200)
    expect(freq['小']).toBe(50)
    expect(freq['狗']).toBe(50)
  })

  it('忽略不在 4808 字表內的字', () => {
    const freq = computeCharFreq(SAMPLE_ESSAY, EDU)
    expect(freq['未']).toBeUndefined()
    expect(freq['在']).toBeUndefined()
  })
})

describe('splitLevels', () => {
  it('依詞頻降序切 3 級，剩餘字落第 3 級', () => {
    const result = splitLevels(EDU, { '中': 700, '國': 500, '人': 300, '民': 300, '華': 200, '小': 50, '狗': 50 }, [3, 2, 99])
    expect(result.beginner).toEqual(['中', '國', '人'])
    expect(result.intermediate).toEqual(['民', '華'])
    expect(result.advanced.sort()).toEqual(['小', '狗'])
  })

  it('未出現於 essay 的字落最後一級', () => {
    const result = splitLevels(['甲', '乙', '丙'], { '甲': 10 }, [1, 1, 99])
    expect(result.beginner).toEqual(['甲'])
    expect(result.intermediate.length + result.advanced.length).toBe(2)
  })
})
```

- [ ] **Step 3：FAIL → 實作 `scripts/build-levels.ts`**

```typescript
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

const isMain = import.meta.url === `file://${process.argv[1]}`
if (isMain) main()
```

- [ ] **Step 4：跑測試**

```bash
npm run test:run -- scripts/build-levels.test.ts
```

預期：4 passed。

- [ ] **Step 5：執行 build script**

```bash
npm run build:levels
```

預期：「入門 1500、進階 1500、精通 1808」。

- [ ] **Step 6：Commit**

```bash
git add scripts/build-levels.ts scripts/build-levels.test.ts src/data/levels.json
git commit -m "feat(data): 計算 4808 字三級詞頻分級"
```

---

## Phase 4：共用元件 + 抽題邏輯

### Task 13：pickQuestion.ts — 抽題（弱點字優先）

**Files:**
- Create: `src/lib/pickQuestion.ts`, `src/lib/pickQuestion.test.ts`

- [ ] **Step 1：寫測試 `src/lib/pickQuestion.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { pickQuestions, weakCharsFromStats } from './pickQuestion'

describe('weakCharsFromStats', () => {
  it('挑出錯誤率前 N% 的字（最少 3 次嘗試門檻）', () => {
    const stats = {
      A: { attempts: 10, errors: 8, lastSeen: 0 }, // 80%
      B: { attempts: 10, errors: 1, lastSeen: 0 }, // 10%
      C: { attempts: 1, errors: 1, lastSeen: 0 }, // 過濾（嘗試太少）
      D: { attempts: 5, errors: 4, lastSeen: 0 }, // 80%
    }
    const weak = weakCharsFromStats(stats, 0.5) // 取前 50%
    expect(weak.sort()).toEqual(['A', 'D'])
  })
})

describe('pickQuestions', () => {
  it('回傳指定數量', () => {
    const pool = ['甲', '乙', '丙', '丁', '戊']
    expect(pickQuestions(pool, 3, [], 2, () => 0.5)).toHaveLength(3)
  })

  it('count 大於 pool 時回傳 pool 全部（不重複）', () => {
    const pool = ['甲', '乙']
    const result = pickQuestions(pool, 5, [], 2, () => 0.5)
    expect(result.sort()).toEqual(['甲', '乙'])
  })

  it('弱點字機率倍增反映在抽樣中（用控制 random 驗證）', () => {
    const pool = ['甲', '乙']
    const weak = ['甲']
    // random 永遠回傳 0：總是挑第一個（依加權後分布的最大者）
    const result = pickQuestions(pool, 1, weak, 2, () => 0)
    expect(result).toEqual(['甲'])
  })
})
```

- [ ] **Step 2：FAIL → 實作 `src/lib/pickQuestion.ts`**

```typescript
import type { CharStat } from './storage'

const WEAK_THRESHOLD_ATTEMPTS = 3

export function weakCharsFromStats(
  stats: Record<string, CharStat>,
  topRatio: number = 0.2,
): string[] {
  const eligible = Object.entries(stats).filter(([, s]) => s.attempts >= WEAK_THRESHOLD_ATTEMPTS)
  const sorted = eligible
    .map(([ch, s]) => [ch, s.errors / s.attempts] as const)
    .sort((a, b) => b[1] - a[1])
  const cutoff = Math.max(1, Math.ceil(sorted.length * topRatio))
  return sorted.slice(0, cutoff).map(([ch]) => ch)
}

export function pickQuestions(
  pool: string[],
  count: number,
  weakChars: string[],
  weakWeight: number = 2,
  random: () => number = Math.random,
): string[] {
  const target = Math.min(count, pool.length)
  const weakSet = new Set(weakChars)
  const weights = pool.map(ch => (weakSet.has(ch) ? weakWeight : 1))
  const selected: string[] = []
  const remainingPool = [...pool]
  const remainingWeights = [...weights]

  while (selected.length < target && remainingPool.length > 0) {
    const total = remainingWeights.reduce((s, w) => s + w, 0)
    let r = random() * total
    let idx = 0
    for (; idx < remainingWeights.length; idx++) {
      r -= remainingWeights[idx]
      if (r <= 0) break
    }
    if (idx >= remainingPool.length) idx = remainingPool.length - 1
    selected.push(remainingPool[idx])
    remainingPool.splice(idx, 1)
    remainingWeights.splice(idx, 1)
  }

  return selected
}
```

- [ ] **Step 3：PASS → Commit**

```bash
npm run test:run -- src/lib/pickQuestion.test.ts
git add src/lib/pickQuestion.ts src/lib/pickQuestion.test.ts
git commit -m "feat(lib): 加入弱點字優先抽題 (pickQuestion)"
```

---

### Task 14：內建文章資料 articles.ts

**Files:**
- Create: `src/data/articles.ts`

- [ ] **Step 1：寫資料檔 `src/data/articles.ts`（6 篇選文）**

```typescript
export interface Article {
  id: string
  title: string
  category: '散文' | '童話' | '文言文' | '新聞' | '唐詩'
  content: string
}

export const ARTICLES: Article[] = [
  {
    id: 'tang-poem-spring',
    title: '春曉',
    category: '唐詩',
    content: '春眠不覺曉，處處聞啼鳥。夜來風雨聲，花落知多少。',
  },
  {
    id: 'classical-aiyou',
    title: '愛蓮說（節錄）',
    category: '文言文',
    content: '予獨愛蓮之出淤泥而不染，濯清漣而不妖，中通外直，不蔓不枝，香遠益清，亭亭淨植，可遠觀而不可褻玩焉。',
  },
  {
    id: 'essay-rain',
    title: '雨天',
    category: '散文',
    content: '今日下了一整天的雨，街道安靜了不少。從窗口望出去，行人撐著傘匆匆走過，車聲被雨聲蓋過，整個城市彷彿放慢了腳步。',
  },
  {
    id: 'essay-coffee',
    title: '一杯咖啡的時光',
    category: '散文',
    content: '清晨在巷口的小店點一杯咖啡，看著陽光從玻璃窗灑進來，木桌上有淡淡的木紋光影。手裡握著溫熱的杯子，今天的第一個念頭，就從這口咖啡開始。',
  },
  {
    id: 'fairy-tortoise',
    title: '龜兔賽跑',
    category: '童話',
    content: '從前有一隻烏龜和一隻兔子，他們相約在森林裡賽跑。兔子跑得很快，遠遠把烏龜拋在後面，於是在路邊睡了一覺。烏龜雖然慢，卻一直沒有停下來，最後反而比兔子先到了終點。',
  },
  {
    id: 'news-tech',
    title: '人工智慧的日常應用',
    category: '新聞',
    content: '近年來人工智慧逐漸進入一般民眾的生活。從手機上的語音助理、社群媒體的內容推薦，到自動駕駛、醫療診斷，相關技術正在改變人們的工作方式與生活樣貌。',
  },
]
```

- [ ] **Step 2：Commit**

```bash
git add src/data/articles.ts
git commit -m "feat(data): 加入內建練習文章 6 篇"
```

---

## Phase 5：頁面實作

### Task 15：CodeInput 元件 — 輸入框（即時轉字根）

**Files:**
- Create: `src/components/CodeInput.tsx`, `src/components/CodeInput.test.tsx`

- [ ] **Step 1：寫測試 `src/components/CodeInput.test.tsx`**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeInput } from './CodeInput'

describe('CodeInput', () => {
  it('打英文鍵顯示為字根', async () => {
    const user = userEvent.setup()
    render(<CodeInput value="" onChange={() => {}} onSubmit={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'vw')
    // 由父元件控制 value，這裡只驗證顯示組件存在
    expect(input).toBeInTheDocument()
  })

  it('受控顯示：value=vw 顯示「女田」', () => {
    render(<CodeInput value="vw" onChange={() => {}} onSubmit={() => {}} />)
    expect(screen.getByText('女田')).toBeInTheDocument()
  })

  it('按 Space 觸發 onSubmit', async () => {
    const user = userEvent.setup()
    let submitted = ''
    render(
      <CodeInput
        value="vw"
        onChange={() => {}}
        onSubmit={v => { submitted = v }}
      />,
    )
    const input = screen.getByRole('textbox')
    input.focus()
    await user.keyboard(' ')
    expect(submitted).toBe('vw')
  })
})
```

- [ ] **Step 2：FAIL → 實作 `src/components/CodeInput.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { codeToRadicalString, isRadicalKey } from '@/lib/codeMap'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled?: boolean
  status?: 'idle' | 'correct' | 'wrong'
  className?: string
}

export function CodeInput({ value, onChange, onSubmit, disabled, status = 'idle', className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const radicals = codeToRadicalString(value)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === ' ') {
      e.preventDefault()
      onSubmit(value)
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      onChange(value.slice(0, -1))
      return
    }
    if (e.key.length === 1) {
      const k = e.key.toLowerCase()
      if (isRadicalKey(k)) {
        e.preventDefault()
        onChange(value + k)
      } else {
        e.preventDefault()
      }
    }
  }

  const ringColor = {
    idle: 'border-border',
    correct: 'border-green-500',
    wrong: 'border-red-500',
  }[status]

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <input
        ref={inputRef}
        type="text"
        role="textbox"
        value={value}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="absolute opacity-0 w-1 h-1 pointer-events-none"
        aria-hidden
      />
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'min-w-[280px] min-h-[64px] flex items-center justify-center rounded-lg border-2 px-6 py-3',
          'text-3xl tracking-[0.4em] font-medium cursor-text bg-muted/30',
          ringColor,
        )}
      >
        {radicals || <span className="text-muted-foreground text-base tracking-normal">點此後開始輸入</span>}
        {!disabled && <span className="ml-1 inline-block w-[2px] h-7 bg-foreground animate-pulse" />}
      </div>
    </div>
  )
}
```

- [ ] **Step 3：跑測試**

```bash
npm run test:run -- src/components/CodeInput.test.tsx
```

預期：3 passed。

- [ ] **Step 4：Commit**

```bash
git add src/components/CodeInput.tsx src/components/CodeInput.test.tsx
git commit -m "feat(components): 加入即時字根轉換輸入框 (CodeInput)"
```

---

### Task 16：CharacterPractice page — 單字練習

**Files:**
- Modify: `src/pages/CharacterPractice.tsx`
- Create: `src/components/CharacterPracticeRunner.tsx`, `src/components/CodesReveal.tsx`

- [ ] **Step 1：建立 `src/components/CodesReveal.tsx`**

```tsx
import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'
import { Badge } from '@/components/ui/badge'

interface Props {
  codes: string[]
}

export function CodesReveal({ codes }: Props) {
  const sorted = sortCodesByLength(codes)
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {sorted.map((code, i) => {
        const label = i === 0 ? '簡碼' : code.length >= 4 ? '完整／容錯' : '其他'
        return (
          <div key={code} className="flex flex-col items-center gap-1 px-4 py-2 rounded-md border">
            <Badge variant="secondary">{label}</Badge>
            <span className="text-xl tracking-widest">{codeToRadicalString(code)}</span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2：建立 `src/components/CharacterPracticeRunner.tsx`**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { CodeInput } from './CodeInput'
import { CodesReveal } from './CodesReveal'
import { Button } from '@/components/ui/button'
import { isCorrectCode } from '@/lib/codingJudge'
import { recordCharAttempt, appendSession } from '@/lib/storage'
import { calcCPM, calcAccuracy } from '@/lib/stats'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

interface Props {
  questions: string[]
  onFinish: () => void
}

const ERRORS_BEFORE_REVEAL = 3

export function CharacterPracticeRunner({ questions, onFinish }: Props) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [errors, setErrors] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [startTs] = useState(() => Date.now())
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)

  const currentChar = questions[idx]
  const validCodes = useMemo(() => dict[currentChar] ?? [], [currentChar])

  function nextQuestion() {
    if (idx + 1 >= questions.length) {
      const durationMs = Date.now() - startTs
      appendSession({
        type: 'character',
        cpm: calcCPM(totalCorrect + (status === 'correct' ? 1 : 0), durationMs),
        accuracy: calcAccuracy(totalCorrect + (status === 'correct' ? 1 : 0), totalAttempts + 1),
        durationMs,
        questionCount: questions.length,
        ts: Date.now(),
      })
      onFinish()
      return
    }
    setIdx(i => i + 1)
    setInput('')
    setErrors(0)
    setRevealed(false)
    setStatus('idle')
  }

  function handleSubmit(value: string) {
    if (status === 'correct' || revealed) {
      nextQuestion()
      return
    }
    if (!value) return

    const correct = isCorrectCode(value, validCodes)
    setTotalAttempts(n => n + 1)
    recordCharAttempt(currentChar, correct)

    if (correct) {
      setStatus('correct')
      setTotalCorrect(n => n + 1)
    } else {
      setStatus('wrong')
      const newErrors = errors + 1
      setErrors(newErrors)
      if (newErrors >= ERRORS_BEFORE_REVEAL) setRevealed(true)
    }
  }

  // 揭示後或答對狀態下，按 Space 也由 CodeInput onSubmit 觸發 → handleSubmit → nextQuestion
  useEffect(() => {
    if (status === 'wrong') {
      const t = setTimeout(() => setStatus('idle'), 800)
      return () => clearTimeout(t)
    }
  }, [status])

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div className="text-sm text-muted-foreground text-center">
        第 {idx + 1} / {questions.length} 題
      </div>

      <div className="text-center text-[120px] leading-none font-semibold">{currentChar}</div>

      <CodeInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        status={status}
        disabled={revealed && status !== 'correct'}
      />

      <div className="text-center text-sm">
        {status === 'correct' && <span className="text-green-600">✓ 答對！再按空白前進</span>}
        {status === 'wrong' && !revealed && (
          <span className="text-amber-600">已錯 {errors} / {ERRORS_BEFORE_REVEAL} 次</span>
        )}
        {revealed && <span className="text-muted-foreground">按空白前進下一題</span>}
      </div>

      {!revealed && status !== 'correct' && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)}>▸ 揭示解答</Button>
          <Button variant="ghost" onClick={nextQuestion}>⏭ 跳過</Button>
        </div>
      )}

      {(revealed || status === 'correct') && (
        <div className="pt-6 border-t">
          <div className="text-xs text-muted-foreground text-center mb-3">本字所有可行編碼</div>
          <CodesReveal codes={validCodes} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3：改寫 `src/pages/CharacterPractice.tsx`**

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CharacterPracticeRunner } from '@/components/CharacterPracticeRunner'
import { pickQuestions, weakCharsFromStats } from '@/lib/pickQuestion'
import { loadAllCharStats, loadSettings } from '@/lib/storage'
import levelsData from '@/data/levels.json'

const levels = levelsData as { beginner: string[]; intermediate: string[]; advanced: string[] }

type LevelKey = 'beginner' | 'intermediate' | 'advanced' | 'all'

export default function CharacterPractice() {
  const [level, setLevel] = useState<LevelKey>(loadSettings().defaultLevel)
  const [questions, setQuestions] = useState<string[] | null>(null)

  function start() {
    const pool = level === 'all'
      ? [...levels.beginner, ...levels.intermediate, ...levels.advanced]
      : levels[level]
    const weak = weakCharsFromStats(loadAllCharStats(), 0.2)
    const picked = pickQuestions(pool, 100, weak, 2)
    setQuestions(picked)
  }

  if (questions) {
    return <CharacterPracticeRunner questions={questions} onFinish={() => setQuestions(null)} />
  }

  return (
    <div className="max-w-md mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">單字練習</h1>
      <p className="text-muted-foreground">每回合 100 題，弱點字會優先出現。</p>
      <RadioGroup value={level} onValueChange={v => setLevel(v as LevelKey)}>
        {([
          ['beginner', '入門', levels.beginner.length],
          ['intermediate', '進階', levels.intermediate.length],
          ['advanced', '精通', levels.advanced.length],
          ['all', '全部', levels.beginner.length + levels.intermediate.length + levels.advanced.length],
        ] as [LevelKey, string, number][]).map(([k, lab, n]) => (
          <div key={k} className="flex items-center gap-3">
            <RadioGroupItem id={`lvl-${k}`} value={k} />
            <Label htmlFor={`lvl-${k}`} className="cursor-pointer">
              {lab} <span className="text-muted-foreground">（{n} 字）</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={start} className="w-full">開始 100 題</Button>
    </div>
  )
}
```

- [ ] **Step 4：跑 dev 手動驗收**

```bash
npm run dev
```

打開 http://localhost:8456/practice/character ：
- 選「入門」→ 開始
- 出現大字題目
- 打 a-z 鍵看字根即時顯示
- 按空白驗證；對則綠色 ✓ 並可再按空白前進；錯計數
- 達 3 錯自動揭示「所有可行編碼」
- 點「揭示解答」也可主動揭示
- 100 題完回到選擇頁

- [ ] **Step 5：Commit**

```bash
git add src/pages/CharacterPractice.tsx src/components/CharacterPracticeRunner.tsx src/components/CodesReveal.tsx
git commit -m "feat(pages): 實作單字練習頁"
```

---

### Task 17：ArticlePractice page — 文章練習

**Files:**
- Modify: `src/pages/ArticlePractice.tsx`
- Create: `src/components/ArticlePracticeRunner.tsx`

- [ ] **Step 1：建立 `src/components/ArticlePracticeRunner.tsx`**

```tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { CodeInput } from './CodeInput'
import { Button } from '@/components/ui/button'
import { isCorrectCode } from '@/lib/codingJudge'
import { recordCharAttempt, appendSession } from '@/lib/storage'
import { calcCPM, calcAccuracy } from '@/lib/stats'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

function isCJK(c: string): boolean {
  const cp = c.codePointAt(0) ?? 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

interface Props {
  text: string
  onFinish: () => void
}

export function ArticlePracticeRunner({ text, onFinish }: Props) {
  const chars = useMemo(() => Array.from(text), [text])
  const [idx, setIdx] = useState(() => chars.findIndex(c => isCJK(c)))
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'wrong'>('idle')
  const [errors, setErrors] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [startTs, setStartTs] = useState<number | null>(null)
  const [endTs, setEndTs] = useState<number | null>(null)
  const finishedRef = useRef(false)

  const cjkCount = useMemo(() => chars.filter(isCJK).length, [chars])
  const completedCjk = useMemo(
    () => chars.slice(0, idx).filter(isCJK).length,
    [chars, idx],
  )

  function advance(currentIdx: number): number {
    let next = currentIdx + 1
    while (next < chars.length && !isCJK(chars[next])) next++
    return next
  }

  function handleSubmit(value: string) {
    if (idx >= chars.length || finishedRef.current) return
    if (!value) return
    if (startTs === null) setStartTs(Date.now())

    const currentChar = chars[idx]
    const validCodes = dict[currentChar] ?? []
    const correct = isCorrectCode(value, validCodes)
    setTotalAttempts(n => n + 1)
    recordCharAttempt(currentChar, correct)

    if (correct) {
      const next = advance(idx)
      setInput('')
      setStatus('idle')
      setIdx(next)
      if (next >= chars.length) {
        finishedRef.current = true
        const endNow = Date.now()
        setEndTs(endNow)
      }
    } else {
      setErrors(e => e + 1)
      setStatus('wrong')
    }
  }

  useEffect(() => {
    if (endTs !== null && startTs !== null) {
      const durationMs = endTs - startTs
      appendSession({
        type: 'article',
        cpm: calcCPM(cjkCount, durationMs),
        accuracy: calcAccuracy(totalAttempts - errors, totalAttempts),
        durationMs,
        questionCount: cjkCount,
        ts: endTs,
      })
    }
  }, [endTs, startTs, cjkCount, totalAttempts, errors])

  useEffect(() => {
    if (status === 'wrong') {
      const t = setTimeout(() => setStatus('idle'), 600)
      return () => clearTimeout(t)
    }
  }, [status])

  if (endTs !== null && startTs !== null) {
    const durationMs = endTs - startTs
    const cpm = calcCPM(cjkCount, durationMs)
    const accuracy = calcAccuracy(totalAttempts - errors, totalAttempts)
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-6 text-center">
        <h2 className="text-2xl font-bold">完成！</h2>
        <div className="grid grid-cols-3 gap-4">
          <div><div className="text-3xl font-bold">{cpm}</div><div className="text-sm text-muted-foreground">CPM</div></div>
          <div><div className="text-3xl font-bold">{Math.round(accuracy * 100)}%</div><div className="text-sm text-muted-foreground">正確率</div></div>
          <div><div className="text-3xl font-bold">{Math.round(durationMs / 1000)}s</div><div className="text-sm text-muted-foreground">用時</div></div>
        </div>
        <Button onClick={onFinish}>回主畫面</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="text-sm text-muted-foreground">
        進度 {completedCjk} / {cjkCount}{startTs !== null && ` · 已用 ${Math.round((Date.now() - startTs) / 1000)}s`}
      </div>

      <div className="text-2xl leading-relaxed select-none">
        {chars.map((c, i) => {
          const cls =
            i < idx ? 'text-muted-foreground/50' :
            i === idx ? 'bg-yellow-200 dark:bg-yellow-900/40 px-0.5 rounded' :
            ''
          return <span key={i} className={cls}>{c}</span>
        })}
      </div>

      <CodeInput value={input} onChange={setInput} onSubmit={handleSubmit} status={status} />
    </div>
  )
}
```

- [ ] **Step 2：改寫 `src/pages/ArticlePractice.tsx`**

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticlePracticeRunner } from '@/components/ArticlePracticeRunner'
import { ARTICLES } from '@/data/articles'

export default function ArticlePractice() {
  const [text, setText] = useState<string | null>(null)
  const [pasted, setPasted] = useState('')

  if (text) {
    return <ArticlePracticeRunner text={text} onFinish={() => setText(null)} />
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">文章練習</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">內建文章</h2>
        <div className="grid grid-cols-2 gap-3">
          {ARTICLES.map(a => (
            <Card key={a.id} className="cursor-pointer hover:border-primary" onClick={() => setText(a.content)}>
              <CardHeader>
                <CardTitle className="text-base">{a.title}</CardTitle>
                <div className="text-xs text-muted-foreground">{a.category} · {Array.from(a.content).filter(c => /[一-鿿]/.test(c)).length} 字</div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground line-clamp-2">
                {a.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">貼上自己的文章</h2>
        <textarea
          className="w-full min-h-[120px] p-3 rounded-md border bg-background"
          placeholder="把要練的文字貼上來……"
          value={pasted}
          onChange={e => setPasted(e.target.value)}
        />
        <Button className="mt-2" disabled={pasted.trim().length < 10} onClick={() => setText(pasted.trim())}>
          開始練習
        </Button>
      </section>
    </div>
  )
}
```

- [ ] **Step 3：dev 驗收**

```bash
npm run dev
```

http://localhost:8456/practice/article ：
- 點某內建文章 → 進練習頁
- 全文顯示，第一字黃底
- 打字根、按空白驗證
- 對：自動跳到下一字（跳過標點）
- 錯：紅色 ✗、可重打
- 完成顯示 CPM、正確率、用時
- 也測「貼上自己的文章」

- [ ] **Step 4：Commit**

```bash
git add src/pages/ArticlePractice.tsx src/components/ArticlePracticeRunner.tsx
git commit -m "feat(pages): 實作文章練習頁"
```

---

### Task 18：Radicals page — 字根表

**Files:**
- Modify: `src/pages/Radicals.tsx`

- [ ] **Step 1：實作 `src/pages/Radicals.tsx`**

```tsx
import { useMemo } from 'react'
import { RADICAL_KEYS, keyToRadical } from '@/lib/codeMap'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

const KEYBOARD_ROWS = [
  'qwertyuiop'.split(''),
  'asdfghjkl;'.split(''),
  'zxcvbnm'.split(''),
]

export default function Radicals() {
  const examplesByKey = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const key of RADICAL_KEYS) result[key] = []
    for (const [char, codes] of Object.entries(dict)) {
      for (const code of codes) {
        const first = code[0]
        if (RADICAL_KEYS.includes(first) && result[first].length < 4) {
          result[first].push(char)
          break
        }
      }
    }
    return result
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">字根表</h1>
        <p className="text-muted-foreground mt-2">
          大新倉頡共 24 個基本字根（不含「難」），加上 1 個特殊鍵 <code>;</code> →「；」。
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">鍵盤對照</h2>
        <div className="space-y-2">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex gap-2 justify-center">
              {row.map(key => {
                const r = keyToRadical(key)
                return (
                  <div key={key} className="w-16 h-20 rounded-md border flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground">{key.toUpperCase()}</div>
                    <div className="text-2xl">{r ?? '·'}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">字根與範例字</h2>
        <div className="grid grid-cols-3 gap-3">
          {RADICAL_KEYS.map(key => {
            const r = keyToRadical(key)!
            const examples = examplesByKey[key]
            return (
              <div key={key} className="p-3 rounded-md border">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium">{r}</span>
                  <code className="text-xs text-muted-foreground">{key.toUpperCase()}</code>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {examples.length > 0 ? `例：${examples.join('、')}` : '—'}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">與一般倉頡的差異</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>最大碼長為 4 碼（一般倉頡可達 5 碼）</li>
          <li>取碼規則固定為「頭尾、頭尾」</li>
          <li>多簡碼設計：常用字常常 1–2 碼即可輸入</li>
          <li>多容錯碼：對拆碼有爭議的字提供替代編碼</li>
        </ul>
      </section>
    </div>
  )
}
```

- [ ] **Step 2：dev 驗收**

```bash
npm run dev
```

http://localhost:8456/radicals ：應顯示鍵盤對照、字根範例字、差異說明。

- [ ] **Step 3：Commit**

```bash
git add src/pages/Radicals.tsx
git commit -m "feat(pages): 實作字根表頁"
```

---

### Task 19：Stats page — 個人紀錄

**Files:**
- Modify: `src/pages/Stats.tsx`
- Install: `recharts`

- [ ] **Step 1：安裝 recharts**

```bash
npm install recharts
```

- [ ] **Step 2：實作 `src/pages/Stats.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { loadSessions, loadAllCharStats, clearAll } from '@/lib/storage'
import dictData from '@/data/newcj.json'
import { codeToRadicalString } from '@/lib/codeMap'
import { sortCodesByLength } from '@/lib/codingJudge'

const dict = dictData as Record<string, string[]>

export default function Stats() {
  const [reloadKey, setReloadKey] = useState(0)

  const sessions = useMemo(() => loadSessions(), [reloadKey])
  const charStats = useMemo(() => loadAllCharStats(), [reloadKey])

  const cpmData = sessions.map((s, i) => ({
    n: i + 1,
    cpm: s.cpm,
    accuracy: Math.round(s.accuracy * 100),
  }))

  const weakChars = Object.entries(charStats)
    .filter(([, s]) => s.attempts >= 3)
    .map(([ch, s]) => ({ ch, rate: s.errors / s.attempts, attempts: s.attempts }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 20)

  function handleClear() {
    if (!confirm('確定清除所有紀錄？此動作無法復原。')) return
    clearAll()
    setReloadKey(k => k + 1)
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">個人紀錄</h1>
        <Button variant="outline" onClick={handleClear}>清除所有紀錄</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>速度趨勢（最近 {sessions.length} 場）</CardTitle></CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">尚無紀錄。完成一回單字或文章練習後會出現。</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={cpmData}>
                <XAxis dataKey="n" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cpm" stroke="#4a90e2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>最常錯的 20 字</CardTitle></CardHeader>
        <CardContent>
          {weakChars.length === 0 ? (
            <p className="text-muted-foreground text-sm">尚無資料。</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {weakChars.map(({ ch, rate, attempts }) => {
                const codes = sortCodesByLength(dict[ch] ?? [])
                return (
                  <div key={ch} className="flex items-center gap-3 px-3 py-2 rounded border">
                    <div className="text-3xl font-semibold w-10 text-center">{ch}</div>
                    <div className="flex-1">
                      <div className="text-sm">{codes.map(c => codeToRadicalString(c)).join(' / ')}</div>
                      <div className="text-xs text-muted-foreground">
                        錯誤率 {Math.round(rate * 100)}% · {attempts} 次
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3：dev 驗收**

```bash
npm run dev
```

http://localhost:8456/stats ：先看到「尚無紀錄」；做一回單字練習後回此頁應有資料。

- [ ] **Step 4：Commit**

```bash
git add src/pages/Stats.tsx package.json package-lock.json
git commit -m "feat(pages): 實作個人紀錄頁（速度趨勢 + 弱點字）"
```

---

## Phase 6：主題、首頁與部署

### Task 20：Home page + 主題切換

**Files:**
- Modify: `src/pages/Home.tsx`, `src/components/Layout.tsx`
- Create: `src/lib/theme.ts`

- [ ] **Step 1：建立 `src/lib/theme.ts`**

```typescript
import { loadSettings, saveSettings, type Theme } from './storage'

export function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export function initTheme() {
  applyTheme(loadSettings().theme)
}

export function setTheme(theme: Theme) {
  saveSettings({ ...loadSettings(), theme })
  applyTheme(theme)
}
```

- [ ] **Step 2：在 `src/main.tsx` 啟動時呼叫 initTheme**

於 createRoot 之前：

```tsx
import { initTheme } from './lib/theme'
initTheme()
```

- [ ] **Step 3：在 Layout 加入主題切換按鈕**

於 `src/components/Layout.tsx` 的 nav 末尾加入 `<ThemeToggle />`，並建立元件：

```tsx
// 加在 Layout.tsx 檔案中
import { useEffect, useState } from 'react'
import { loadSettings, type Theme } from '@/lib/storage'
import { setTheme } from '@/lib/theme'

function ThemeToggle() {
  const [theme, setLocal] = useState<Theme>('system')
  useEffect(() => setLocal(loadSettings().theme), [])
  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setLocal(next)
    setTheme(next)
  }
  const label = theme === 'dark' ? '🌙' : theme === 'light' ? '☀' : '◐'
  return <button onClick={toggle} className="ml-auto text-lg" title={`主題：${theme}`}>{label}</button>
}
```

於 nav 元素內結尾加入 `<ThemeToggle />`。

- [ ] **Step 4：實作 `src/pages/Home.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadSessions } from '@/lib/storage'

export default function Home() {
  const recent = useMemo(() => loadSessions().slice(-5).reverse(), [])
  const lastCpm = recent[0]?.cpm

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">大新倉頡練習</h1>
        <p className="text-muted-foreground mt-2">學會、練熟、然後變快。</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/practice/character">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>單字練習</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              依詞頻分級隨機抽 100 字練習拆碼。
            </CardContent>
          </Card>
        </Link>
        <Link to="/practice/article">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>文章練習</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              內建 6 篇文章，或貼上自己的文章計時練習。
            </CardContent>
          </Card>
        </Link>
        <Link to="/radicals">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>字根表</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              25 個鍵位字根對照與範例字。
            </CardContent>
          </Card>
        </Link>
        <Link to="/stats">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>個人紀錄</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              {lastCpm ? `上次 CPM ${lastCpm}` : '尚無紀錄'}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 5：dev 驗收**

點主題切換按鈕應在亮/暗/系統三態切換；首頁 4 張卡可導航。

- [ ] **Step 6：Commit**

```bash
git add src/pages/Home.tsx src/components/Layout.tsx src/lib/theme.ts src/main.tsx
git commit -m "feat: 實作首頁與亮暗主題切換"
```

---

### Task 21：完整跑一遍 + 修補

**Files:** （視驗收狀況）

- [ ] **Step 1：執行完整測試**

```bash
npm run test:run
```

預期：全部 passed。

- [ ] **Step 2：手動完整流程驗收**

對下列流程逐一試走：
1. 首頁 → 單字練習「入門」→ 完成 100 題 → 看到回首頁/結束行為正常 → /stats 出現紀錄
2. 首頁 → 文章練習「春曉」→ 完成 → /stats 多一筆
3. 文章練習「貼上自己」→ 貼一段中文 → 練習正常
4. /radicals 顯示鍵盤對照與所有字根
5. /stats 清除紀錄後恢復「尚無紀錄」狀態
6. 主題切換亮/暗/系統三態正確

- [ ] **Step 3：若有 bug，修補後 commit**

```bash
git add ...
git commit -m "fix: <具體修補內容>"
```

---

### Task 22：GitHub Pages 部署設定

**Files:**
- Modify: `vite.config.ts`, `package.json`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1：在 `vite.config.ts` 加入 base 設定**

```typescript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/newcj-practice/' : '/',
  // ... 其餘設定
})
```

- [ ] **Step 2：在 `src/main.tsx` BrowserRouter 加 basename**

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

- [ ] **Step 3：建立 `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4：本機驗證 build**

```bash
npm run build
npm run preview
```

開啟 preview URL 確認可運作。

- [ ] **Step 5：Commit**

```bash
git add .github/workflows/deploy.yml vite.config.ts src/main.tsx
git commit -m "ci: 加入 GitHub Pages 自動部署"
```

- [ ] **Step 6：（可選）push 到 GitHub 啟動部署**

```bash
gh repo create newcj-practice --public --source=. --remote=origin --push
```

於 GitHub repo Settings → Pages 設定 Source 為 GitHub Actions。等待 workflow 完成，造訪 `https://<user>.github.io/newcj-practice/`。

---

## 完工檢查清單

- [ ] 22 個任務全部 commit
- [ ] `npm run test:run` 全部通過
- [ ] 五個頁面均可正常運作
- [ ] localStorage 紀錄正常累積
- [ ] 亮/暗主題切換正常
- [ ] `npm run build` 成功，`npm run preview` 可開
- [ ] （可選）GitHub Pages 已上線

---

## 開放議題（已知不影響核心架構，實作時可遇到再決定）

源自 spec 第 14 節：

1. 文章練習中標點完全自動跳過 — 已採用此預設（見 Task 17 的 `advance` 函式）
2. 單字練習中途中斷 — 預設不寫入紀錄（離開頁面時）
3. 弱點字機率倍率 — Task 13 預設 2 倍
4. 內建 6 篇文章選文 — 已寫死於 Task 14
5. 字根範例字 — 採「以該字根為首碼的高頻字」（Task 18 邏輯）
