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
    saveSettings({ theme: 'dark', defaultLevels: ['intermediate', 'advanced'] })
    expect(loadSettings()).toEqual({ theme: 'dark', defaultLevels: ['intermediate', 'advanced'] })
  })

  it('loadSettings: 舊版單選 defaultLevel 遷移為陣列', () => {
    localStorage.setItem('newcj.settings', JSON.stringify({ theme: 'light', defaultLevel: 'intermediate' }))
    expect(loadSettings().defaultLevels).toEqual(['intermediate'])
  })

  it("loadSettings: 舊版 defaultLevel 'all' 展開為三級全選", () => {
    localStorage.setItem('newcj.settings', JSON.stringify({ theme: 'light', defaultLevel: 'all' }))
    expect(loadSettings().defaultLevels).toEqual(['beginner', 'intermediate', 'advanced'])
  })

  it('loadSettings: defaultLevels 含非法值時過濾，全空則回預設', () => {
    localStorage.setItem('newcj.settings', JSON.stringify({ theme: 'light', defaultLevels: ['advanced', 'bogus'] }))
    expect(loadSettings().defaultLevels).toEqual(['advanced'])
    localStorage.setItem('newcj.settings', JSON.stringify({ theme: 'light', defaultLevels: [] }))
    expect(loadSettings().defaultLevels).toEqual(['beginner'])
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
