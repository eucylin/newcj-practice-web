import { describe, it, expect } from 'vitest'
import {
  RADICAL_KEYS,
  keyToRadical,
  radicalToKey,
  codeToRadicalString,
  isRadicalKey,
} from './codeMap'

describe('codeMap', () => {
  it('涵蓋全部 26 個鍵位（a–z + ;）', () => {
    expect(RADICAL_KEYS).toHaveLength(27)
  })

  it('keyToRadical: a→日、v→女、;→；', () => {
    expect(keyToRadical('a')).toBe('日')
    expect(keyToRadical('v')).toBe('女')
    expect(keyToRadical(';')).toBe('；')
  })

  it('keyToRadical: x→難、z→Ｚ', () => {
    expect(keyToRadical('x')).toBe('難')
    expect(keyToRadical('z')).toBe('Ｚ')
  })

  it('radicalToKey: 日→a、廿→t、；→;', () => {
    expect(radicalToKey('日')).toBe('a')
    expect(radicalToKey('廿')).toBe('t')
    expect(radicalToKey('；')).toBe(';')
  })

  it('codeToRadicalString: vfdw → 女火木田', () => {
    expect(codeToRadicalString('vfdw')).toBe('女火木田')
  })

  it('codeToRadicalString: 不認得的字元保持原樣', () => {
    expect(codeToRadicalString('a?b')).toBe('日?月')
  })

  it('isRadicalKey: 識別合法鍵', () => {
    expect(isRadicalKey('a')).toBe(true)
    expect(isRadicalKey(';')).toBe(true)
    expect(isRadicalKey('1')).toBe(false)
    expect(isRadicalKey('A')).toBe(false)
  })
})
