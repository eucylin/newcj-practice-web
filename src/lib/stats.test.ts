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
