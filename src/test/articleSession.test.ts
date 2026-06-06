import { describe, it, expect } from 'vitest'
import { shortestCode } from '@/lib/codingJudge'
import { formatElapsed } from '@/lib/stats'
import { initSession, submitCode } from '@/lib/articleSession'

// 測試用迷你字典
const dict: Record<string, string[]> = {
  我: ['hqi'],
  你: ['onf'],
  好: ['vnd', 'vn'],
  天: ['mk', 'hk', 'mmk'],
}

describe('shortestCode', () => {
  it('回傳最短的編碼', () => {
    expect(shortestCode(['vnd', 'vn'])).toBe('vn')
  })

  it('同長度時取陣列中第一個', () => {
    expect(shortestCode(['mk', 'hk', 'mmk'])).toBe('mk')
  })

  it('空陣列回傳 undefined', () => {
    expect(shortestCode([])).toBeUndefined()
  })
})

describe('formatElapsed', () => {
  it('0 毫秒顯示 0:00', () => {
    expect(formatElapsed(0)).toBe('0:00')
  })

  it('27 秒顯示 0:27', () => {
    expect(formatElapsed(27_000)).toBe('0:27')
  })

  it('12 分 5 秒顯示 12:05', () => {
    expect(formatElapsed(725_000)).toBe('12:05')
  })
})

describe('initSession', () => {
  it('cells 數量等於字元數，且 idx 指向第一個可輸入字', () => {
    const s = initSession('「我好」', dict)
    expect(s.cells).toHaveLength(4)
    expect(s.cells[0].typable).toBe(false)
    expect(s.idx).toBe(1)
    expect(s.cells[1].typable).toBe(true)
  })

  it('字典查無編碼的 CJK 字視為不可輸入', () => {
    // 「龘」不在測試字典中
    const s = initSession('龘我', dict)
    expect(s.cells[0].typable).toBe(false)
    expect(s.idx).toBe(1)
  })

  it('整篇無可練習字時 idx 直接等於 cells.length（視為完成）', () => {
    const s = initSession('，。！', dict)
    expect(s.idx).toBe(s.cells.length)
  })

  it('初始統計皆為零', () => {
    const s = initSession('我', dict)
    expect(s.typedCount).toBe(0)
    expect(s.totalAttempts).toBe(0)
    expect(s.totalErrors).toBe(0)
    expect(s.errorChars).toEqual([])
    expect(s.strikes).toBe(0)
  })
})

describe('submitCode', () => {
  it('答對：cell 標 done 並記錄輸入編碼、前進、strikes 歸零', () => {
    const s0 = initSession('我你', dict)
    const { state: s1, outcome } = submitCode(s0, 'hqi', dict)
    expect(outcome).toBe('correct')
    expect(s1.cells[0].status).toBe('done')
    expect(s1.cells[0].code).toBe('hqi')
    expect(s1.idx).toBe(1)
    expect(s1.strikes).toBe(0)
    expect(s1.typedCount).toBe(1)
    expect(s1.totalAttempts).toBe(1)
  })

  it('答對時忽略大小寫', () => {
    const s0 = initSession('我', dict)
    const { outcome } = submitCode(s0, 'HQI', dict)
    expect(outcome).toBe('correct')
  })

  it('答對後跳過後續非輸入字元，停在下一個可輸入字', () => {
    const s0 = initSession('我，你', dict)
    const { state: s1 } = submitCode(s0, 'hqi', dict)
    expect(s1.idx).toBe(2)
  })

  it('答錯：strikes +1、errorChars 收錄、idx 不變', () => {
    const s0 = initSession('我你', dict)
    const { state: s1, outcome } = submitCode(s0, 'xxx', dict)
    expect(outcome).toBe('wrong')
    expect(s1.strikes).toBe(1)
    expect(s1.errorChars).toEqual(['我'])
    expect(s1.idx).toBe(0)
    expect(s1.totalErrors).toBe(1)
    expect(s1.cells[0].status).toBe('pending')
  })

  it('錯兩次仍停在原字', () => {
    const s0 = initSession('我', dict)
    const { state: s1 } = submitCode(s0, 'xxx', dict)
    const { state: s2 } = submitCode(s1, 'yyy', dict)
    expect(s2.strikes).toBe(2)
    expect(s2.idx).toBe(0)
  })

  it('第三次答錯：跳過該字、顯示最短碼、前進下一字', () => {
    const s0 = initSession('好你', dict)
    const { state: s1 } = submitCode(s0, 'a', dict)
    const { state: s2 } = submitCode(s1, 'b', dict)
    const { state: s3, outcome } = submitCode(s2, 'c', dict)
    expect(outcome).toBe('skipped')
    expect(s3.cells[0].status).toBe('skipped')
    expect(s3.cells[0].code).toBe('vn') // 最短碼
    expect(s3.idx).toBe(1)
    expect(s3.strikes).toBe(0)
    expect(s3.typedCount).toBe(1) // 跳過也計入已輸入字數
  })

  it('errorChars 對同一字只記一次', () => {
    const s0 = initSession('我我', dict)
    const { state: s1 } = submitCode(s0, 'x', dict)
    const { state: s2 } = submitCode(s1, 'hqi', dict) // 過第一個我
    const { state: s3 } = submitCode(s2, 'x', dict) // 第二個我又錯
    expect(s3.errorChars).toEqual(['我'])
  })

  it('打完最後一個可輸入字後 idx === cells.length（完成）', () => {
    const s0 = initSession('我。', dict)
    const { state: s1 } = submitCode(s0, 'hqi', dict)
    expect(s1.idx).toBe(s1.cells.length)
  })

  it('答對後 strikes 歸零，下一字錯誤從 1 重新計', () => {
    const s0 = initSession('我你', dict)
    const { state: s1 } = submitCode(s0, 'x', dict)
    const { state: s2 } = submitCode(s1, 'hqi', dict)
    const { state: s3 } = submitCode(s2, 'x', dict)
    expect(s3.strikes).toBe(1)
    expect(s3.idx).toBe(1)
  })
})
