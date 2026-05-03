# 大新倉頡練習 Web App — 設計文件

**日期**：2026-05-04
**狀態**：待審閱
**作者**：透過 brainstorming 協作完成

---

## 1. 專案目標

打造一個**全靜態**的 Web App，幫助使用者**練習與學習「大新倉頡」**輸入法。兩大核心練習模式：

1. **單字拆碼練習**：依詞頻分級隨機抽字，使用者輸入編碼驗證對錯。
2. **文章練習**：選擇內建文章或自貼文章，逐字輸入並計時，量化輸入速度與正確率。

不依賴後端伺服器，所有資料 build 階段準備完畢，runtime 純前端執行。

---

## 2. 技術棧

| 類別 | 選擇 | 理由 |
|------|------|------|
| 建構工具 | Vite 5 | 現代開發體驗，build 出純靜態檔 |
| 框架 | React 18 + TypeScript | 互動量適中，型別系統有助處理「字根對應」「編碼判定」等資料模型 |
| 樣式 | Tailwind CSS + shadcn/ui | 介面美觀現代，shadcn 內建亮/暗主題切換 |
| 路由 | React Router v6 | SPA 多頁切換 |
| 儲存 | `localStorage` | 個人成績、設定，無需後端 |
| 部署 | GitHub Pages | 純靜態，免費，build 後直接 push |
| 平台 | 桌面為主（min-width 1024px） | 練字以實體鍵盤為主，不做手機版 |

埠號（dev server）：依 user 全域規則，從 8300–8999 隨機指定一對偶/奇連號。本專案僅前端，先用 **8456**（偶數，前端）；未來如需 backend 用 8457。

---

## 3. 應用架構

### 3.1 頁面樹

```
/                       首頁（功能入口 + 最近成績摘要）
├ /practice/character   單字練習（選級數 → 隨機 100 題）
├ /practice/article     文章練習（內建 6 篇 + 自貼）
├ /radicals             字根表頁（25 字根對照 + 範例字）
└ /stats                個人紀錄（速度趨勢 + 弱點字）
```

### 3.2 目錄結構（建議）

```
src/
├ data/
│  ├ newcj.json          # 字 → 編碼陣列
│  ├ edu4808.json        # 教育部 4808 字
│  ├ levels.json         # 3 級分布
│  ├ articles.ts         # 內建文章（含類型、長度、分級）
│  └ radicals.ts         # 字根對應與範例字
├ lib/
│  ├ codeMap.ts          # 英鍵 ↔ 字根字符雙向映射
│  ├ codingJudge.ts      # 編碼正確判定（接受任一有效編碼）
│  ├ pickQuestion.ts     # 隨機抽題、弱點字優先
│  ├ stats.ts            # 速度 / 正確率計算
│  └ storage.ts          # localStorage 封裝
├ components/
│  ├ ui/                 # shadcn/ui 生成的元件
│  ├ Keyboard.tsx        # 字根鍵盤輔助顯示
│  ├ CharacterPrompt.tsx # 大字題目顯示
│  ├ CodeInput.tsx       # 輸入框（自動英→字根轉換）
│  └ ResultBadge.tsx     # 對錯狀態提示
├ pages/
│  ├ Home.tsx
│  ├ CharacterPractice.tsx
│  ├ ArticlePractice.tsx
│  ├ Radicals.tsx
│  └ Stats.tsx
├ App.tsx
└ main.tsx

scripts/
├ build-newcj-dict.ts    # 解析 Rime newcj.dict.yaml
├ fetch-edu4808.ts       # 抓教育部 4808 字
└ build-levels.ts        # 計算 3 級分布
```

---

## 4. 資料準備（一次性 build script）

| Script | 輸入 | 輸出 | 說明 |
|--------|------|------|------|
| `build-newcj-dict.ts` | `~/Library/Rime/newcj.dict.yaml` | `src/data/newcj.json` | 結構：`{ "字": ["編碼1", "編碼2", ...] }`；解析規則見下方 |
| `fetch-edu4808.ts` | GitHub gist URL | `src/data/edu4808.json` | 一次性下載教育部 4808 常用字表 |
| `build-levels.ts` | `essay.txt` + `edu4808.json` | `src/data/levels.json` | 計算 4808 字累積詞頻，切 3 級 |

**`build-newcj-dict.ts` 解析規則**：
- 跳過 YAML 表頭（`---` 之前與 `...` 之後的設定區）、空白行、註解（`#` 開頭）
- 每行格式為 `字\t編碼[\t詞頻]`，TAB 分隔
- 只保留 key 長度 === 1 且為**中文字**（U+4E00–U+9FFF + 擴展區）的行；詞語（多字）一律跳過
- 同一字若有多筆編碼（多行），全部收集為陣列

### 4.1 字根與鍵位對應（從 schema 萃取）

**字根（會出現在編碼中，需在練習介面顯示為字根字符）**：

```
a→日 b→月 c→金 d→木 e→水 f→火 g→土 h→竹 i→戈 j→十
k→大 l→中 m→一 n→弓 o→人 p→心 q→手 r→口 s→尸 t→廿
u→山 v→女 w→田 x→難 y→卜 z→Ｚ ;→；
```

**標點對應**（標點字的編碼，本練習通常不會練到，僅供文章練習中辨識）：

```
'→、  ,→，  .→。  /→／  [→「  ]→」  ?→？
```

`codeMap.ts` 提供雙向轉換函數：`charToRadical(char)` / `radicalToChar(radical)`。
單字練習只練教育部 4808 中文字（不含標點）；文章練習中遇到中文標點自動略過。

---

## 5. 詞頻分級

從 `essay.txt` 統計 4808 字的累積詞頻分布，切 **3 級**：

| 級 | 字數 | 累積覆蓋率（估） |
|----|------|------------------|
| **入門** | ~1500 字（高頻） | ~92% |
| **進階** | ~1500 字（中頻） | ~99% |
| **精通** | ~1808 字（剩餘） | 100% |

UI 上顯示為單選：「入門」「進階」「精通」「全部」。

---

## 6. 編碼判定規則（核心邏輯）

**「正確編碼」** = `newcj.json[字]` 中**任一**字串。

驗證流程：
1. 將使用者輸入字串（已是英鍵）正規化（如忽略大小寫）
2. 比對 `newcj.json[字]` 陣列中的任一元素
3. 完全相符即正確

**所有可行編碼揭示時**：直接顯示 `newcj.json[字]` 陣列全部，依長度排序（簡碼在前）。每個編碼用字根字符顯示。

---

## 7. 單字練習設計

### 7.1 流程

1. 進入 `/practice/character`
2. 選擇練習級數（入門 / 進階 / 精通 / 全部）
3. 系統隨機抽 100 題（弱點字優先：錯誤率高的字機率加倍）
4. 對每題：
   - 顯示大字題目（96px）
   - 使用者打英鍵 → 輸入框即時轉字根字符顯示
   - 按 **SPACE** 驗證
     - **對**：綠色 ✓ → 再按 SPACE 進下一題
     - **錯**：紅色 ✗，錯誤計數 +1，**保留輸入**，使用者可修改後再按 SPACE
       - 達 3 錯：自動揭示「所有可行編碼」，SPACE 前進
   - 任何時候可點「▸ 揭示解答」按鈕主動揭示
5. 100 題完 → 總結頁（CPM、正確率、最常錯字）→ 寫入 localStorage

### 7.2 鍵盤事件設計

| 狀態 | 按鍵 | 行為 |
|------|------|------|
| 輸入中 | a–z, ;, ', ,, ., /, [, ] | 加入輸入字串並轉字根顯示 |
| 輸入中 | Backspace | 刪除最後一字根 |
| 輸入中 | Space | 驗證 |
| 已答對 | Space | 進下一題 |
| 已答對 | 其他鍵 | 忽略 |
| 揭示後 | Space | 進下一題 |

### 7.3 弱點字機制

`storage.charStats[字].errorRate = errors / attempts`。抽題時，前 20% 高錯誤率的字機率加倍（不影響整體分布太多）。

---

## 8. 文章練習設計

### 8.1 流程

1. 進入 `/practice/article`
2. 選擇文章來源：
   - **內建**：6 篇精選文章（散文 2、童話 1、文言文 1、新聞 1、唐詩 1）
   - **貼上**：textarea 接收使用者文章（限 200–2000 字）
3. 進入練習：
   - 全文顯示（淺色文字）
   - 光標字高亮（黃底）
   - 已完成字（綠色）
   - 錯誤字（紅色標記）
4. 計時：使用者按下第一鍵時啟動，最後字驗證完停止
5. 完成 → 顯示 CPM、正確率、用時 → 寫入 localStorage

### 8.2 文章練習的鍵盤事件

| 狀態 | 按鍵 | 行為 |
|------|------|------|
| 輸入中 | a–z, ;, etc. | 加入輸入並即時轉字根 |
| 輸入中 | Backspace | 刪除最後一字根 |
| 輸入中 | Space | 驗證該字 |
|        |       | - 對：光標前進下一字（**不需第二次空白**） |
|        |       | - 錯：紅色 ✗，可重打或按 Backspace 修改 |
| 中標點符號 | （自動跳過） | 中文標點不需輸入 |

注意：文章練習與單字練習的差異 —— **文章練習答對後光標自動前進**（流暢感重要），單字練習答對需第二次空白前進（給使用者準備時間）。

### 8.3 CPM 計算

`CPM = (正確字數 / 用時毫秒數) * 60000`。「正確字數」= 全文字數 - 仍處於錯誤狀態的字數。

---

## 9. 個人紀錄頁

`/stats` 顯示：

- **最近 30 天 CPM 趨勢**（折線圖，shadcn/ui chart 或 recharts）
- **單字練習正確率趨勢**
- **最常錯的 20 字**（清單，附編碼）
- **練習次數累計**
- **設定**：清除紀錄按鈕、亮/暗主題切換、預設級數

---

## 10. 字根表頁

`/radicals` 顯示：

- 25 個字根 × 對應英文鍵的網格表
- 每個字根附 2–3 個範例字（從 `newcj.json` 抽取以該字根開頭的高頻字）
- 視覺化鍵盤示意圖（QWERTY 鍵盤上每鍵標出對應字根）
- 大新倉頡簡介、與一般倉頡差異的簡短說明

---

## 11. UI / UX 規範

### 11.1 主題

- 預設跟隨系統（`prefers-color-scheme`）
- 使用者可在 `/stats` 切換亮/暗
- shadcn/ui 預設主題色（slate）為基底

### 11.2 字型

- 中文：系統字型 stack，優先 PingFang TC / Noto Serif TC（題目大字用 serif，內文用 sans）
- 英文：Inter（系統可用時）
- 等寬：JetBrains Mono / SF Mono（編碼字元串顯示）

### 11.3 大字題目規格

- 字級 96–128px
- 字色：主文字色
- 行高 1.0
- 與輸入區距離：32px

### 11.4 輸入框視覺

- 圓角 8px
- 字根字距 letter-spacing: 4–6px（避免擠在一起）
- 字級 28–32px
- 邊框 2px solid（focus 狀態變主色）

---

## 12. localStorage 結構

```ts
// newcj.settings
{
  theme: 'light' | 'dark' | 'system',
  defaultLevel: 'beginner' | 'intermediate' | 'advanced' | 'all',
}

// newcj.charStats
{
  [字: string]: {
    attempts: number,
    errors: number,
    lastSeen: number, // timestamp
  }
}

// newcj.sessions（最近 50 筆環形緩衝）
[
  {
    type: 'character' | 'article',
    cpm: number,
    accuracy: number, // 0-1
    durationMs: number,
    questionCount: number,
    ts: number,
  },
  ...
]
```

版本欄位 `newcj.version: '1'` 預留資料模型遷移。

---

## 13. 部署計劃

1. `npm run build` → `dist/`
2. GitHub repo 開 Pages，source 指向 `gh-pages` 分支
3. 用 `gh-pages` npm 套件或 GitHub Actions 自動部署 `dist/`
4. Vite `base` 設定為 repo 名稱（如 `/newcj-practice/`）

---

## 14. 開放議題（已知不影響核心架構，可在實作時決定）

1. 文章練習中，標點符號是否完全略過？還是需要按空白「跳過」？預設：**完全自動略過**。
2. 單字練習 100 題完成前可否中斷？預設：**可中斷，但成績不計入紀錄**。
3. 弱點字加權倍率：預設 **2 倍**，後期可調。
4. 內建 6 篇文章的具體選文清單。
5. 字根範例字選用「以該字根開頭」還是「該字根代表」的字？預設**前者**。

---

## 15. 範圍外（明確不做）

- 行動裝置版（手機、平板直式）
- 多人對戰、排行榜
- 帳號系統 / 雲端同步
- 詞語、片語練習（聚焦單字 + 文章）
- 自製碼表匯入（直接用本地 `newcj.dict.yaml`）
- 簡體字、其他輸入法支援
