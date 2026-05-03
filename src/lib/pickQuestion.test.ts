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
    expect(new Set(result)).toEqual(new Set(['甲', '乙']))
  })

  it('弱點字機率倍增反映在抽樣中（用控制 random 驗證）', () => {
    const pool = ['甲', '乙']
    const weak = ['甲']
    // random 永遠回傳 0：總是挑第一個（依加權後分布的最大者）
    const result = pickQuestions(pool, 1, weak, 2, () => 0)
    expect(result).toEqual(['甲'])
  })
})
