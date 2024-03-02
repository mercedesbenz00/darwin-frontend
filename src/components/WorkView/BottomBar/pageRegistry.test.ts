import {
  enqueuePage,
  mergeQueue,
  resolvePageInformation
} from '@/components/WorkView/BottomBar/pageRegistry'

describe('enqueuePage', () => {
  it('add new page to queue when never requested', () => {
    const pageRegistry = { queue: [], requested: [] }
    enqueuePage(pageRegistry, { from: 'from', size: 50 })
    expect(pageRegistry.queue).toHaveLength(1)
    expect(pageRegistry.queue[0]).toEqual({ from: 'from', size: 50 })
  })

  it('merge new page to queue when requested already', () => {
    const pageRegistry = {
      queue: [],
      requested: [{ from: 'from', size: 50 }]
    }
    enqueuePage(pageRegistry, { from: 'from', size: 50 })
    expect(pageRegistry.queue).toHaveLength(0)
  })
})

describe('mergeQueue', () => {
  it('merge queue into requested', () => {
    const pageRegistry = {
      queue: [
        { from: 'from', size: 50 },
        { datasetItemId: 1 }
      ],
      requested: []
    }
    mergeQueue(pageRegistry)
    expect(pageRegistry.queue).toHaveLength(1)
    expect(pageRegistry.queue[0]).toEqual({ datasetItemId: 1 })
    expect(pageRegistry.requested).toHaveLength(1)
    expect(pageRegistry.requested[0]).toEqual({ from: 'from', size: 50 })
  })
})

describe('resolvePageInformation', () => {
  it('returns { datasetItemId } when no cursor mapping for the current dataset item', () => {
    const pages = resolvePageInformation([], 5)
    expect(pages).toHaveLength(1)
    expect(pages[0]).toEqual({ datasetItemId: 5 })
  })

  it('returns { to, size } when cursor mapping exists with previous', () => {
    const pages = resolvePageInformation(
      [{ previous: 'previous', next: null, ids: [5] }],
      5
    )
    expect(pages).toHaveLength(1)
    expect(pages[0]).toEqual({ to: 'previous', size: 50 })
  })

  it('returns { from, size } when cursor mapping exists with next', () => {
    const pages = resolvePageInformation(
      [{ previous: null, next: 'next', ids: [5] }],
      5
    )
    expect(pages).toHaveLength(1)
    expect(pages[0]).toEqual({ from: 'next', size: 50 })
  })

  it('returns { from, size } and { to, size } when cursor mapping exists with next and previous', () => {
    const pages = resolvePageInformation(
      [{ previous: 'previous', next: 'next', ids: [5] }],
      5
    )
    expect(pages).toHaveLength(2)
    expect(pages[0]).toEqual({ to: 'previous', size: 50 })
    expect(pages[1]).toEqual({ from: 'next', size: 50 })
  })
})
