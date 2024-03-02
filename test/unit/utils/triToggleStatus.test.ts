import { resolveNextTriToggleStatus } from '@/utils/triToggleStatus'

describe('resolveNextTriToggleStatus', () => {
  it('returns positive when none', () => {
    expect(resolveNextTriToggleStatus('none')).toEqual('positive')
  })
  it('returns negative when positive', () => {
    expect(resolveNextTriToggleStatus('positive')).toEqual('negative')
  })
  it('returns none when negative', () => {
    expect(resolveNextTriToggleStatus('negative')).toEqual('none')
  })
})
