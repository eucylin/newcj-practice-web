import { describe, it, expect } from 'vitest'
import { parseDict } from './build-newcj-dict'

const SAMPLE = `# encoding: utf-8
---
name: "newcj"
sort: by_weight
...
、	'
"	''
是	a
是	amo
的	h
的	hapi
練	vw	100
練	vfdw	50
練	vvdw	30
中國	zlw	500
`

describe('parseDict', () => {
  it('忽略表頭與多字詞，只收單字', () => {
    const dict = parseDict(SAMPLE)
    expect(Object.keys(dict).sort()).toEqual(['是', '的', '練'])
  })

  it('同一字多筆編碼合併為陣列，依長度排序', () => {
    const dict = parseDict(SAMPLE)
    expect(dict['練']).toEqual(['vw', 'vfdw', 'vvdw'])
  })

  it('排除標點字（非中文範圍）', () => {
    const dict = parseDict(SAMPLE)
    expect(dict['、']).toBeUndefined()
    expect(dict['"']).toBeUndefined()
  })

  it('去重複編碼', () => {
    const dup = SAMPLE + '練\tvw\t999\n'
    const dict = parseDict(dup)
    expect(dict['練']).toEqual(['vw', 'vfdw', 'vvdw'])
  })
})
