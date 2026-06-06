# 文章練習改版：嘸蝦米官方模式風格 — 設計文件

日期：2026-06-06

## 目標

把「文章練習」改為類似嘸蝦米官方文章練習的體驗：

1. 明確顯示目前要輸入的字（高亮）
2. 輸入中的字根直接顯示在當前字下方（倉頡字根符號，如「土中」）
3. 同一字錯 3 次 → 跳過該字，編碼列以紅色固定顯示該字「最短碼」，前進下一字
4. 底部統計列即時顯示：經過時間、已輸入字數、每分鐘平均字數、錯誤的字數

## 已確認的設計決策

- 編碼列顯示**倉頡字根符號**（非英文字母碼）
- 輸入**直接顯示在當前字下方**，移除文章練習的底部輸入框
- **不做**「錯字收集」側欄；結算畫面列出錯字（字＋最短碼）
- 「錯誤的字數」＝**打錯過的字數**（同字多次錯誤只算 1，含被跳過的字）
- 「不熟悉的字數」不做
- 計時從**第一次按下字根鍵**開始
- 「已輸入字數」含被跳過的字（與官方一致）

## 檔案與元件架構

```
src/lib/articleSession.ts        （新增）純狀態邏輯：初始化、提交判定、三振跳過
src/lib/codingJudge.ts           （擴充）shortestCode()
src/lib/stats.ts                 （擴充）formatElapsed()（0:27 格式）
src/components/ArticlePracticeRunner.tsx （重寫）格狀排版＋隱形輸入＋統計列
src/test/articleSession.test.ts  （新增）狀態邏輯單元測試
```

`ArticlePracticeRunner` 內以小型函式元件拆分（`CharCell`、`StatusBar`），比照現有 `Stat` 做法放同檔。`CodeInput` 不再被文章練習使用（單字練習照舊）。

## 核心狀態邏輯（articleSession.ts）

```ts
type CellStatus = 'pending' | 'done' | 'skipped'
interface Cell {
  char: string
  typable: boolean      // 是 CJK 且字典查得到編碼
  status: CellStatus
  code: string          // done＝使用者輸入的編碼；skipped＝最短碼；其他＝''
}
interface ArticleSessionState {
  cells: Cell[]
  idx: number           // 當前待輸入 cell；=== cells.length 即完成
  strikes: number       // 當前字連續錯誤數
  typedCount: number    // 已輸入字數（done + skipped）
  errorChars: string[]  // 打錯過的字（去重保序）
  totalAttempts: number
  totalErrors: number
}

initSession(text, dict): ArticleSessionState
submitCode(state, input, dict): { state, outcome: 'correct' | 'wrong' | 'skipped' }
```

提交流程（空白鍵送出 → `isCorrectCode` 判定）：

- 正確：cell 標 `done`（記使用者輸入編碼）、前進到下一個 typable cell、strikes 歸零
- 錯誤：strikes +1、`errorChars` 收錄（去重）、編碼列紅閃並清空輸入
- 第 3 次錯誤：cell 標 `skipped`、`code` 設為 `shortestCode()`（同長取字典第一個）、前進下一字

每次提交照舊呼叫 `recordCharAttempt`；完成後照舊 `appendSession`（storage schema 不變）。

## 排版與視覺

- 文章區：`flex-wrap` 字格流式排列，每格上下兩行——上為字（font-serif 大字）、下為固定高度編碼列（小字）
- 當前字：柔和高亮（`bg-vermilion/15` + ring，沿用本站朱色語言），輸入中字根即時顯示在其編碼列
- 已完成字：字淡化、編碼列灰色顯示使用者輸入的字根
- 被跳過字：編碼列以紅色（destructive）固定顯示最短碼字根
- 非 CJK（標點）：照常顯示、編碼列留空、不需輸入、不計字數
- 當前字自動 `scrollIntoView`
- 底部統計列（sticky）：`經過時間 0:27｜已輸入 20 字｜每分鐘 31.5 字｜錯誤 3 字`，250ms tick 更新
- 結算畫面：保留 CPM／正確率／用時三卡，新增「錯字一覽」（字＋最短碼字根）

## 錯誤處理與邊界

- 字典查無編碼的 CJK 字：視為不可輸入、直接跳過（修掉現有「卡死」問題）
- 空輸入按空白：忽略
- 整篇無可練習字：顯示提示而非空白畫面
- 重複打錯同一字：`errorChars` 只記一次

## 測試（Vitest）

- `articleSession`：跳過非 CJK／正確前進／錯 1–2 次不前進／第 3 次跳過且顯示最短碼／errorChars 去重／無編碼字自動跳過／完成偵測
- `shortestCode`、`formatElapsed` 純函式測試
- Runner 整合測試：模擬鍵盤輸入跑完一小段文章
