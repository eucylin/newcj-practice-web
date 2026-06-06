import { isCorrectCode, shortestCode } from './codingJudge'

export type CellStatus = 'pending' | 'done' | 'skipped'

export interface Cell {
  char: string
  /** 是 CJK 且字典查得到編碼，需要使用者輸入 */
  typable: boolean
  status: CellStatus
  /** done＝使用者輸入的編碼；skipped＝最短碼；其他＝'' */
  code: string
}

export interface ArticleSessionState {
  cells: Cell[]
  /** 當前待輸入 cell；=== cells.length 即完成 */
  idx: number
  /** 當前字連續錯誤數 */
  strikes: number
  /** 已輸入字數（done + skipped） */
  typedCount: number
  /** 打錯過的字（去重保序） */
  errorChars: string[]
  totalAttempts: number
  totalErrors: number
}

export type SubmitOutcome = 'correct' | 'wrong' | 'skipped'

const MAX_STRIKES = 3

function isCJK(c: string): boolean {
  const cp = c.codePointAt(0) ?? 0
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
}

/** 回傳將第 i 個元素替換後的新陣列（lib 為 ES2020，無法用 Array.prototype.with） */
function replaceAt(cells: Cell[], i: number, cell: Cell): Cell[] {
  const next = [...cells]
  next[i] = cell
  return next
}

/** 從 from 起（含）找下一個可輸入 cell 的 index；找不到回傳 cells.length */
function nextTypable(cells: Cell[], from: number): number {
  let i = from
  while (i < cells.length && !cells[i].typable) i++
  return i
}

export function initSession(
  text: string,
  dict: Record<string, string[]>,
): ArticleSessionState {
  const cells: Cell[] = Array.from(text).map(char => ({
    char,
    typable: isCJK(char) && (dict[char]?.length ?? 0) > 0,
    status: 'pending',
    code: '',
  }))
  return {
    cells,
    idx: nextTypable(cells, 0),
    strikes: 0,
    typedCount: 0,
    errorChars: [],
    totalAttempts: 0,
    totalErrors: 0,
  }
}

export function submitCode(
  state: ArticleSessionState,
  input: string,
  dict: Record<string, string[]>,
): { state: ArticleSessionState; outcome: SubmitOutcome } {
  const cell = state.cells[state.idx]
  const validCodes = dict[cell.char] ?? []
  const correct = isCorrectCode(input, validCodes)

  if (correct) {
    const cells = replaceAt(state.cells, state.idx, {
      ...cell,
      status: 'done',
      code: input.toLowerCase(),
    })
    return {
      state: {
        ...state,
        cells,
        idx: nextTypable(cells, state.idx + 1),
        strikes: 0,
        typedCount: state.typedCount + 1,
        totalAttempts: state.totalAttempts + 1,
      },
      outcome: 'correct',
    }
  }

  const errorChars = state.errorChars.includes(cell.char)
    ? state.errorChars
    : [...state.errorChars, cell.char]
  const strikes = state.strikes + 1

  if (strikes >= MAX_STRIKES) {
    const cells = replaceAt(state.cells, state.idx, {
      ...cell,
      status: 'skipped',
      code: shortestCode(validCodes) ?? '',
    })
    return {
      state: {
        ...state,
        cells,
        idx: nextTypable(cells, state.idx + 1),
        strikes: 0,
        typedCount: state.typedCount + 1,
        errorChars,
        totalAttempts: state.totalAttempts + 1,
        totalErrors: state.totalErrors + 1,
      },
      outcome: 'skipped',
    }
  }

  return {
    state: {
      ...state,
      strikes,
      errorChars,
      totalAttempts: state.totalAttempts + 1,
      totalErrors: state.totalErrors + 1,
    },
    outcome: 'wrong',
  }
}
