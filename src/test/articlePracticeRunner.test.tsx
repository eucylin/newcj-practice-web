import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticlePracticeRunner } from '@/components/ArticlePracticeRunner'
import { codeToRadicalString } from '@/lib/codeMap'
import { shortestCode } from '@/lib/codingJudge'
import dictData from '@/data/newcj.json'

const dict = dictData as Record<string, string[]>

// 測試使用真實字典中的字；先驗證前提成立
const CH_A = '我'
const CH_B = '好'
const WRONG = 'zzzzz'

beforeAll(() => {
  // jsdom 沒有 scrollIntoView
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {})
})

function codeOf(ch: string): string {
  const code = dict[ch][0]
  expect(code).toMatch(/^[a-z;]+$/) // 確保能用鍵盤模擬輸入
  return code
}

describe('前提：測試字存在於字典', () => {
  it(`${CH_A}、${CH_B} 有編碼，且 ${WRONG} 不是它們的合法編碼`, () => {
    expect(dict[CH_A]?.length).toBeGreaterThan(0)
    expect(dict[CH_B]?.length).toBeGreaterThan(0)
    expect(dict[CH_A]).not.toContain(WRONG)
    expect(dict[CH_B]).not.toContain(WRONG)
  })
})

describe('ArticlePracticeRunner（嘸蝦米模式）', () => {
  it('答對：cell 標 done、編碼列顯示輸入的字根、前進到下一字', async () => {
    const user = userEvent.setup()
    render(<ArticlePracticeRunner text={`${CH_A}${CH_B}`} onFinish={() => {}} />)

    expect(screen.getByTestId('cell-0')).toHaveAttribute('data-current', 'true')

    const code = codeOf(CH_A)
    await user.keyboard(`${code} `)

    const cell0 = screen.getByTestId('cell-0')
    expect(cell0).toHaveAttribute('data-status', 'done')
    expect(cell0).toHaveTextContent(codeToRadicalString(code))
    expect(screen.getByTestId('cell-1')).toHaveAttribute('data-current', 'true')
  })

  it('標點符號不需輸入，答對後直接跳到下一個可輸入字', async () => {
    const user = userEvent.setup()
    render(<ArticlePracticeRunner text={`${CH_A}，${CH_B}`} onFinish={() => {}} />)

    await user.keyboard(`${codeOf(CH_A)} `)

    expect(screen.getByTestId('cell-1')).not.toHaveAttribute('data-current')
    expect(screen.getByTestId('cell-2')).toHaveAttribute('data-current', 'true')
  })

  it('錯三次：cell 標 skipped、編碼列顯示最短碼字根、前進下一字', async () => {
    const user = userEvent.setup()
    render(<ArticlePracticeRunner text={`${CH_A}${CH_B}`} onFinish={() => {}} />)

    await user.keyboard(`${WRONG} ${WRONG} ${WRONG} `)

    const cell0 = screen.getByTestId('cell-0')
    expect(cell0).toHaveAttribute('data-status', 'skipped')
    expect(cell0).toHaveTextContent(codeToRadicalString(shortestCode(dict[CH_A])!))
    expect(screen.getByTestId('cell-1')).toHaveAttribute('data-current', 'true')
  })

  it('底部統計列即時顯示已輸入與錯誤字數', async () => {
    const user = userEvent.setup()
    render(<ArticlePracticeRunner text={`${CH_A}${CH_B}`} onFinish={() => {}} />)

    await user.keyboard(`${WRONG} ${WRONG} ${WRONG} `) // 我 → 跳過（算已輸入、算錯字）

    expect(screen.getByText('已輸入 1 / 2 字')).toBeInTheDocument()
    expect(screen.getByText('錯誤 1 字')).toBeInTheDocument()
    expect(screen.getByText(/經過時間/)).toBeInTheDocument()
    expect(screen.getByText(/每分鐘/)).toBeInTheDocument()
  })

  it('全部完成後顯示結算畫面與錯字一覽', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<ArticlePracticeRunner text={`${CH_A}${CH_B}`} onFinish={onFinish} />)

    await user.keyboard(`${WRONG} ${WRONG} ${WRONG} `) // 我 → 跳過
    await user.keyboard(`${codeOf(CH_B)} `) // 好 → 答對

    expect(screen.getByText('完成練習')).toBeInTheDocument()
    expect(screen.getByText('錯字一覽')).toBeInTheDocument()
    // 錯字一覽列出被跳過的字與其最短碼字根
    expect(screen.getByText(CH_A)).toBeInTheDocument()
    expect(
      screen.getByText(codeToRadicalString(shortestCode(dict[CH_A])!)),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '回主畫面' }))
    expect(onFinish).toHaveBeenCalledOnce()
  })

  it('沒打過字根鍵前不開始計時', () => {
    render(<ArticlePracticeRunner text={`${CH_A}${CH_B}`} onFinish={() => {}} />)
    expect(screen.getByText(/經過時間/)).toHaveTextContent('0:00')
  })

  it('整篇沒有可練習的字時顯示提示', () => {
    render(<ArticlePracticeRunner text="，。！" onFinish={() => {}} />)
    expect(screen.getByText(/沒有可練習的字/)).toBeInTheDocument()
  })
})
