import { Mock, StorageMock } from 'test/unit/utils/storageMocks'

import { loadBoolean, loadNumber, saveBoolean, saveNumber } from '@/store/persistedSettings'

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: new Mock() })
})

afterEach(() => {
  window.localStorage.clear()
})

describe('loadBoolean', () => {
  it('load saved boolean value if exists', () => {
    const localStorage = (window.localStorage as StorageMock)
    localStorage.setItem('BOOLEAN_KEY', 'true')
    expect(loadBoolean('BOOLEAN_KEY', false)).toBeTruthy()
  })

  it('load fallback value if not exist', () => {
    expect(loadBoolean('BOOLEAN_KEY', false)).toBeFalsy()
  })
})

describe('loadNumber', () => {
  it('load saved number value if exists', () => {
    const localStorage = (window.localStorage as StorageMock)
    localStorage.setItem('NUMBER_KEY', '5')
    expect(loadNumber('NUMBER_KEY', 10)).toBe(5)
  })

  it('load fallback value if not exist', () => {
    expect(loadNumber('NUMBER_KEY', 10)).toBe(10)
  })
})

describe('saveBoolean', () => {
  it('save boolean value', () => {
    saveBoolean('BOOLEAN_KEY', true)
    const localStorage = (window.localStorage as StorageMock)
    expect(localStorage.getItem('BOOLEAN_KEY')).toEqual('true')
  })
})

describe('saveNumber', () => {
  it('save number value', () => {
    saveNumber('NUMBER_KEY', 10)
    const localStorage = (window.localStorage as StorageMock)
    expect(localStorage.getItem('NUMBER_KEY')).toEqual('10')
  })
})
