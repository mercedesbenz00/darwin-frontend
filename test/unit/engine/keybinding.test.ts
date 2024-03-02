import { keybindingMatch } from '@/engine/keybinding'

const ALT_V_UBUNTU = { ...new KeyboardEvent('keydown'), key: 'v', altKey: true, keyCode: 86 }
const ALT_V_MAC_OS = { ...new KeyboardEvent('keydown'), key: '√', altKey: true, keyCode: 86 }

const BACKSPACE = { ...new KeyboardEvent('keydown'), key: 'Backspace', keyCode: 8 }

describe('keybindingMatch', () => {
  it('matches backspace', () => {
    expect(keybindingMatch(BACKSPACE, ['backspace'])).toBe(true)
    expect(keybindingMatch(BACKSPACE, ['Backspace'])).toBe(true)
  })

  it('matches alt+v on ubuntu', () => {
    expect(keybindingMatch(ALT_V_UBUNTU, ['alt', 'v'])).toBe(true)
  })

  it('matches alt+v on MacOS', () => {
    expect(keybindingMatch(ALT_V_MAC_OS, ['alt', 'v'])).toBe(true)
  })
})
