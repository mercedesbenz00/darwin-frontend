import { matchesKeyScheme } from '@/composables/useHotkeyCombo'
describe('matchesKeyScheme', () => {
  describe('windows', () => {
    it('returns true for main when exact and match', () => {
      expect(matchesKeyScheme({
        platform: 'windows',
        mainKey: true,
        exact: true
      }, {
        ctrlKey: true,
        shiftKey: false,
        metaKey: false,
        altKey: false
      } as KeyboardEvent)).toBe(true)
    })
    it('returns false for main when exact and no match', () => {
      expect(matchesKeyScheme({
        platform: 'windows',
        mainKey: true,
        exact: true
      }, {
        ctrlKey: true,
        shiftKey: true,
        metaKey: false,
        altKey: false
      } as KeyboardEvent)).toBe(false)
    })
    it('returns true for main when not exact and match', () => {
      expect(matchesKeyScheme({
        platform: 'windows',
        mainKey: true,
        exact: false
      }, {
        ctrlKey: true,
        shiftKey: true,
        metaKey: false,
        altKey: false
      } as KeyboardEvent)).toBe(true)
    })
    it('returns false for main when not exact and no match', () => {
      expect(matchesKeyScheme({
        platform: 'windows',
        mainKey: true,
        exact: false
      }, {
        ctrlKey: false,
        shiftKey: true,
        metaKey: true,
        altKey: false
      } as KeyboardEvent)).toBe(false)
    })
  })

  describe('mac', () => {
    it('returns true for main when exact and match', () => {
      expect(matchesKeyScheme({
        platform: 'mac',
        mainKey: true,
        exact: true
      }, {
        ctrlKey: false,
        shiftKey: false,
        metaKey: true,
        altKey: false
      } as KeyboardEvent)).toBe(true)
    })
    it('returns false for main when exact and no match', () => {
      expect(matchesKeyScheme({
        platform: 'mac',
        mainKey: true,
        exact: true
      }, {
        ctrlKey: true,
        shiftKey: false,
        metaKey: true,
        altKey: false
      } as KeyboardEvent)).toBe(false)
    })
    it('returns false for main when exact and no match', () => {
      expect(matchesKeyScheme({
        platform: 'mac',
        mainKey: true,
        exact: true
      }, {
        ctrlKey: false,
        shiftKey: false,
        altKey: true,
        metaKey: true
      } as KeyboardEvent)).toBe(false)
    })
    it('returns true for main when no exact and match', () => {
      expect(matchesKeyScheme({
        platform: 'mac',
        mainKey: true
      }, {
        ctrlKey: true,
        shiftKey: false,
        metaKey: true,
        altKey: false
      } as KeyboardEvent)).toBe(true)
    })
    it('returns true for main when no exact and match', () => {
      expect(matchesKeyScheme({
        platform: 'mac',
        mainKey: true
      }, {
        ctrlKey: true,
        shiftKey: false,
        altKey: true,
        metaKey: true
      } as KeyboardEvent)).toBe(true)
    })
  })
})
