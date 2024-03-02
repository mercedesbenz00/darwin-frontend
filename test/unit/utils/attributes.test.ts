import { getAttributeColor } from '@/utils/attributes'

describe('getAttributeColor', () => {
  it('returns lightened attribute color', () => {
    expect(getAttributeColor('label1')).toEqual('rgba(152,155,205,1)')
    expect(getAttributeColor('label2')).toEqual('rgba(152,171,205,1)')
  })
})
