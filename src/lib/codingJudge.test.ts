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
