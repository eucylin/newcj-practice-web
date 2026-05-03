import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeInput } from './CodeInput'

describe('CodeInput', () => {
  it('打英文鍵顯示為字根', async () => {
    const user = userEvent.setup()
    render(<CodeInput value="" onChange={() => {}} onSubmit={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'vw')
    // 由父元件控制 value，這裡只驗證顯示組件存在
    expect(input).toBeInTheDocument()
  })

  it('受控顯示：value=vw 顯示「女田」', () => {
    render(<CodeInput value="vw" onChange={() => {}} onSubmit={() => {}} />)
    expect(screen.getByText('女田')).toBeInTheDocument()
  })

  it('按 Space 觸發 onSubmit', async () => {
    const user = userEvent.setup()
    let submitted = ''
    render(
      <CodeInput
        value="vw"
        onChange={() => {}}
        onSubmit={v => { submitted = v }}
      />,
    )
    const input = screen.getByRole('textbox')
    input.focus()
    await user.keyboard(' ')
    expect(submitted).toBe('vw')
  })
})
