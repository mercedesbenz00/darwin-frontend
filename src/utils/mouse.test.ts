import { isLeftMouseButton, isMiddleMouseButton, MouseButton } from './mouse'

const leftMouseDown = new MouseEvent('mousedown', { button: MouseButton.LEFT })
const rightMouseDown = new MouseEvent('mousedown', { button: MouseButton.RIGHT })
const middleMouseDown = new MouseEvent('mousedown', { button: MouseButton.MIDDLE })

describe('isLeftMouseButton', () => {
  it('returns true on left mouse button down', () => {
    expect(isLeftMouseButton(leftMouseDown)).toBe(true)
  })

  it('returns false on right mouse button down', () => {
    expect(isLeftMouseButton(rightMouseDown)).toBe(false)
  })

  it('returns false on right mouse button down', () => {
    expect(isLeftMouseButton(middleMouseDown)).toBe(false)
  })
})

describe('isMiddleMouseButton', () => {
  it('returns false on left mouse button down', () => {
    expect(isMiddleMouseButton(leftMouseDown)).toBe(false)
  })

  it('returns false on right mouse button down', () => {
    expect(isMiddleMouseButton(rightMouseDown)).toBe(false)
  })

  it('returns true on right mouse button down', () => {
    expect(isMiddleMouseButton(middleMouseDown)).toBe(true)
  })
})
