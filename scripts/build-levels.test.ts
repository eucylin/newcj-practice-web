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
