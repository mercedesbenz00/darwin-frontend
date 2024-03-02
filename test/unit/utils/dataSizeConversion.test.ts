import { fromBytes, toBytes } from '@/utils'

describe('fromBytes', () => {
  it('works as expected', () => {
    expect(fromBytes(1, 'KB')).toEqual(0.001)
    expect(fromBytes(1, 'MB')).toEqual(0.000001)
    expect(fromBytes(1, 'GB')).toEqual(0.000000001)
    expect(fromBytes(1, 'TB')).toEqual(0.000000000001)

    expect(fromBytes(1000, 'KB')).toEqual(1)
    expect(fromBytes(1000, 'MB')).toEqual(0.001)
    expect(fromBytes(1000, 'GB')).toEqual(0.000001)
    expect(fromBytes(1000, 'TB')).toEqual(0.000000001)

    expect(fromBytes(1000000, 'KB')).toEqual(1000)
    expect(fromBytes(1000000, 'MB')).toEqual(1)
    expect(fromBytes(1000000, 'GB')).toEqual(0.001)
    expect(fromBytes(1000000, 'TB')).toEqual(0.000001)

    expect(fromBytes(1000000000, 'KB')).toEqual(1000000)
    expect(fromBytes(1000000000, 'MB')).toEqual(1000)
    expect(fromBytes(1000000000, 'GB')).toEqual(1)
    expect(fromBytes(1000000000, 'TB')).toEqual(0.001)

    expect(fromBytes(1000000000000, 'KB')).toEqual(1000000000)
    expect(fromBytes(1000000000000, 'MB')).toEqual(1000000)
    expect(fromBytes(1000000000000, 'GB')).toEqual(1000)
    expect(fromBytes(1000000000000, 'TB')).toEqual(1)

    expect(fromBytes(1100, 'KB')).toEqual(1.1)
    expect(fromBytes(1100000, 'MB')).toEqual(1.1)
    expect(fromBytes(1100000000, 'GB')).toEqual(1.1)
    expect(fromBytes(1100000000000, 'TB')).toEqual(1.1)

    expect(fromBytes(1234, 'KB')).toEqual(1.234)
  })
})

describe('toBytes', () => {
  it('works as expected', () => {
    expect(toBytes(1, 'KB')).toEqual(1000)
    expect(toBytes(1, 'MB')).toEqual(1000000)
    expect(toBytes(1, 'GB')).toEqual(1000000000)
    expect(toBytes(1, 'TB')).toEqual(1000000000000)

    expect(toBytes(0.1, 'KB')).toEqual(100)
    expect(toBytes(1.234, 'KB')).toEqual(1234)
  })
})
